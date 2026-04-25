import { useState, useEffect, useCallback } from 'react'
import apiClient from '../api/client'

export function useBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.get('/bookings/')
      setBookings(data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Error fetching bookings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const updateBookingStatus = useCallback(async (bookingId, status) => {
    await apiClient.patch(`/bookings/${bookingId}/status`, { status })
    await fetchBookings()
  }, [fetchBookings])

  return { bookings, loading, error, refetch: fetchBookings, updateBookingStatus }
}
