import { useState, useEffect, useCallback } from 'react'
import apiClient from '../api/client'

export function useLessons() {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLessons = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.get('/lessons/')
      setLessons(data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Error fetching lessons')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLessons() }, [fetchLessons])

  return { lessons, loading, error, refetch: fetchLessons }
}
