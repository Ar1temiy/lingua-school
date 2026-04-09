import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const authenticate = async () => {
            try {
                // Get vk_params
                let vkParams = '';
                if (window.location.search && window.location.search.includes('vk_user_id')) {
                    vkParams = window.location.search.substring(1);
                    localStorage.setItem('vk_params', vkParams);
                } else {
                    vkParams = localStorage.getItem('vk_params') || import.meta.env.VITE_TEST_VK_PARAMS || '';
                }

                if (!vkParams) {
                    setError('Не найдены параметры авторизации VK');
                    setLoading(false);
                    return;
                }

                const response = await apiClient.post('/students/auth', {
                    vk_launch_params: vkParams,
                    first_name: null,
                    last_name: null
                });

                setUser(response.data);
            } catch (err) {
                console.error("Auth error:", err);
                setError(err.response?.data?.detail || 'Ошибка авторизации');
            } finally {
                setLoading(false);
            }
        };

        authenticate();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, error }}>
            {children}
        </AuthContext.Provider>
    );
};
