import axios from "axios";
import { parseApiError } from "../../utils/errorHandler";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
    withCredentials: true // Always send cookies
});

// Request interceptor - Add access token to every request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh on 401 & normalize errors
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Token Refresh
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshResponse = await axios.post(
                    `${import.meta.env.VITE_BACKEND_BASE_URL}/auth/refresh`, 
                    {},
                    {
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                let newAccessToken = refreshResponse.data.data?.accessToken || 
                                   refreshResponse.data?.accessToken || 
                                   refreshResponse.data?.token;

                if (newAccessToken) {
                    localStorage.setItem('accessToken', newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return apiClient.request(originalRequest);
                } else {
                    throw new Error('No access token received from refresh');
                }

            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('customer');
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Attach sanitized, concise cleanMessage to error
        error.cleanMessage = parseApiError(error);
        if (error.response?.status === 404) {
            error.isNotFound = true;
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;
