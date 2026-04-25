import { useState, useEffect, useCallback } from 'react'
import apiClient from '../api/client'

export function useMyLessons(teacherId) {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLessons = useCallback(async () => {
    if (!teacherId) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.get('/lessons/', {
        params: { teacher_id: teacherId },
      })
      setLessons(data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Error fetching lessons')
    } finally {
      setLoading(false)
    }
  }, [teacherId])

  useEffect(() => { fetchLessons() }, [fetchLessons])

  const createLesson = useCallback(async (lessonData) => {
    await apiClient.post('/lessons/', lessonData)
    await fetchLessons()
  }, [fetchLessons])

  const updateLesson = useCallback(async (lessonId, lessonData) => {
    await apiClient.patch(`/lessons/${lessonId}`, lessonData)
    await fetchLessons()
  }, [fetchLessons])

  const changeLessonStatus = useCallback(async (lessonId, status) => {
    await apiClient.patch(`/lessons/${lessonId}/status`, { status })
    await fetchLessons()
  }, [fetchLessons])

  const deleteLesson = useCallback(async (lessonId) => {
    await apiClient.delete(`/lessons/${lessonId}`)
    await fetchLessons()
  }, [fetchLessons])

  const getLessonStudents = useCallback(async (lessonId) => {
    const { data } = await apiClient.get(`/lessons/${lessonId}/students`)
    return data
  }, [])

  const updateBookingStatus = useCallback(async (bookingId, status) => {
    await apiClient.patch(`/bookings/${bookingId}/status`, { status })
    await fetchLessons()
  }, [fetchLessons])

  return {
    lessons,
    loading,
    error,
    refetch: fetchLessons,
    createLesson,
    updateLesson,
    changeLessonStatus,
    deleteLesson,
    getLessonStudents,
    updateBookingStatus,
  }
}
