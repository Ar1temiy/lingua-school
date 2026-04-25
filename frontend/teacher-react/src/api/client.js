import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('teacher_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('teacher_access_token')
      localStorage.removeItem('teacher_refresh_token')
      localStorage.removeItem('teacher_user')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/teacher/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
