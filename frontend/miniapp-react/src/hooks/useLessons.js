import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';

export const useLessons = () => {
    const [lessons, setLessons] = useState([]);
    const [languages, setLanguages] = useState([]);
    const [staff, setStaff] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchLanguages = useCallback(async () => {
        try {
            const response = await apiClient.get('/languages/');
            setLanguages(response.data);
            return response.data;
        } catch (err) {
            console.error(err);
            return [];
        }
    }, []);

    const fetchStaff = useCallback(async () => {
        try {
            const response = await apiClient.get('/staff/');
            setStaff(response.data);
            return response.data;
        } catch (err) {
            console.error(err);
            return [];
        }
    }, []);

    const fetchAvailableLessons = useCallback(async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            // Build query params
            const params = new URLSearchParams();
            if (filters.language_id) params.append('language_id', filters.language_id);
            if (filters.teacher_id) params.append('teacher_id', filters.teacher_id);
            // By default, showing upcoming lessons
            const response = await apiClient.get('/lessons/', { params });
            // Filter only upcoming lessons that have space
            const available = response.data.filter(l => new Date(l.start_time) > new Date());
            setLessons(available);
            return available;
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to fetch lessons');
            console.error(err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        lessons,
        languages,
        staff,
        loading,
        error,
        fetchLanguages,
        fetchStaff,
        fetchAvailableLessons
    };
};
