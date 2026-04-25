import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import axios from 'axios'

const TeacherAuthContext = createContext(null)

// Helper: normalize user object so full_name always exists
function normalizeUser(user) {
  return {
    ...user,
    full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
  }
}

export function TeacherAuthProvider({ children }) {
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount — restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('teacher_access_token')
    const stored = localStorage.getItem('teacher_user')
    if (token && stored) {
      try {
        setTeacher(JSON.parse(stored))
      } catch {
        localStorage.removeItem('teacher_user')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    const { data } = await axios.post('/api/staff/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (data.access_token) {
      localStorage.setItem('teacher_access_token', data.access_token)
      if (data.refresh_token) {
        localStorage.setItem('teacher_refresh_token', data.refresh_token)
      }

      // Fetch current user profile
      const meResp = await axios.get('/api/staff/me', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      })
      const user = normalizeUser(meResp.data)

      if (user.role !== 'teacher') {
        localStorage.removeItem('teacher_access_token')
        localStorage.removeItem('teacher_refresh_token')
        throw new Error('Доступ запрещён: эта панель только для преподавателей')
      }

      localStorage.setItem('teacher_user', JSON.stringify(user))
      setTeacher(user)
      return user
    }
    throw new Error('Ошибка входа')
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('teacher_access_token')
    localStorage.removeItem('teacher_refresh_token')
    localStorage.removeItem('teacher_user')
    setTeacher(null)
  }, [])

  return (
    <TeacherAuthContext.Provider value={{ teacher, login, logout, loading }}>
      {children}
    </TeacherAuthContext.Provider>
  )
}

export function useTeacherAuth() {
  const ctx = useContext(TeacherAuthContext)
  if (!ctx) throw new Error('useTeacherAuth must be used within TeacherAuthProvider')
  return ctx
}
