import { useState, useEffect, useCallback } from 'react'
import apiClient from '../api/client'

export function useLanguages() {
  const [languages, setLanguages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLanguages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.get('/languages/')
      setLanguages(data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Error fetching languages')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLanguages() }, [fetchLanguages])

  return { languages, loading, error, refetch: fetchLanguages }
}
