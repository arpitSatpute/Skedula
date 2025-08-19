import axios from "axios";

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
        } else {
            console.log("No token found for request");
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle token refresh on 401
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;


        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {

                // Call refresh API with proper format
                const refreshResponse = await axios.post(
                    `${import.meta.env.VITE_BACKEND_BASE_URL}/auth/refresh`, 
                    {}, // Empty body
                    {
                        withCredentials: true, // Send cookies
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );


                // Extract new access token
                let newAccessToken = refreshResponse.data.data?.accessToken || 
                                   refreshResponse.data?.accessToken || 
                                   refreshResponse.data?.token;

                if (newAccessToken) {
                    // Store new access token
                    localStorage.setItem('accessToken', newAccessToken);

                    // Update the failed request with new token and retry
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return apiClient.request(originalRequest);
                } else {
                    throw new Error('No access token received from refresh');
                }

            } catch (refreshError) {
                
                // Clear all auth data on refresh failure
                localStorage.removeItem('accessToken');
                localStorage.removeItem('customer');
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                
                // Redirect to login
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;
