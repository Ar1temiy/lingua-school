import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import axios from 'axios'

const AdminAuthContext = createContext(null)

// Helper: normalize user object so full_name always exists
function normalizeUser(user) {
  return {
    ...user,
    full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
  }
}

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount — restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('admin_access_token')
    const stored = localStorage.getItem('admin_user')
    if (token && stored) {
      try {
        setAdmin(JSON.parse(stored))
      } catch {
        localStorage.removeItem('admin_user')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    // No /api prefix — FastAPI routes are at root (e.g. /staff/login)
    const { data } = await axios.post('/staff/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    if (data.access_token) {
      localStorage.setItem('admin_access_token', data.access_token)
      if (data.refresh_token) {
        localStorage.setItem('admin_refresh_token', data.refresh_token)
      }

      // Fetch current user profile
      const meResp = await axios.get('/staff/me', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      })
      const user = normalizeUser(meResp.data)

      if (user.role !== 'admin') {
        localStorage.removeItem('admin_access_token')
        throw new Error('Доступ запрещён: требуется роль администратора')
      }

      localStorage.setItem('admin_user', JSON.stringify(user))
      setAdmin(user)
      return user
    }
    throw new Error('Ошибка входа')
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('admin_access_token')
    localStorage.removeItem('admin_refresh_token')
    localStorage.removeItem('admin_user')
    setAdmin(null)
  }, [])

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
