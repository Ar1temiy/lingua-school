import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiClient } from '../api/client';

const BookingsContext = createContext();

export const BookingsProvider = ({ children }) => {
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
            // Refresh bookings after creation to sync all screens
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

    return (
        <BookingsContext.Provider value={{
            myBookings,
            loading,
            error,
            fetchMyBookings,
            createBooking,
            cancelBooking
        }}>
            {children}
        </BookingsContext.Provider>
    );
};

export const useBookings = () => {
    const context = useContext(BookingsContext);
    if (!context) {
        throw new Error('useBookings must be used within a BookingsProvider');
    }
    return context;
};
