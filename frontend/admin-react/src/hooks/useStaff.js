import { useState, useEffect, useCallback } from 'react'
import apiClient from '../api/client'

export function useStaff() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStaff = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.get('/staff/')
      setStaff(data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Error fetching staff')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStaff() }, [fetchStaff])

  const deleteStaff = useCallback(async (staffId) => {
    await apiClient.delete(`/staff/${staffId}`)
    await fetchStaff()
  }, [fetchStaff])

  return { staff, loading, error, refetch: fetchStaff, deleteStaff }
}
