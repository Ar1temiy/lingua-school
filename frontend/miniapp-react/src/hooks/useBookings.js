import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';

export const useBookings = () => {
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMyBookings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/bookings/my');
            setMyBookings(response.data);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to fetch bookings');
            console.error(err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const createBooking = async (lessonId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.post('/bookings/', { lesson_id: lessonId });
            await fetchMyBookings();
            return response.data;
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to book lesson');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const cancelBooking = async (bookingId) => {
        setLoading(true);
        try {
            await apiClient.patch(`/bookings/${bookingId}/cancel`);
            await fetchMyBookings();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to cancel booking');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        myBookings,
        loading,
        error,
        fetchMyBookings,
        createBooking,
        cancelBooking
    };
};
