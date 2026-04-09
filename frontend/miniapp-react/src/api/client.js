import axios from 'axios';

// Забираем параметры VK из URL или из LocalStorage или из env
const getVkParams = () => {
    // 1. Попытка взять из URL (когда аппка запущена внутри VK)
    if (window.location.search) {
        const query = window.location.search.substring(1);
        if (query.includes('vk_user_id')) {
            localStorage.setItem('vk_params', query);
            return query;
        }
    }
    
    // 2. Иначе бративаем сохраненный или дев-заглушку
    return localStorage.getItem('vk_params') || import.meta.env.VITE_TEST_VK_PARAMS || '';
};

// Экземпляр axios для всех запросов MiniApp
export const apiClient = axios.create({
    baseURL: import.meta.env.DEV ? '/api' : '/',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Добавляем автоматический подсос VK-параметров во все реквесты
apiClient.interceptors.request.use((config) => {
    const vkParams = getVkParams();
    if (vkParams) {
        config.headers['X-Vk-Params'] = vkParams;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
