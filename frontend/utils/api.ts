import axios from 'axios';
import { useAuthStore } from '../src/stores/authStore';

export const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;

const getToken = () => {
    const { token } = useAuthStore.getState();
    return token;
}

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
    (config) => {
        const token = getToken();
       if (token) {
           config.headers['Authorization'] = `Bearer ${token}`;
       }
       return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
// Add a response interceptor to handle responses globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access, e.g., redirect to login
            window.location.href = '/login';
        }    return Promise.reject(error); 
    }
);

