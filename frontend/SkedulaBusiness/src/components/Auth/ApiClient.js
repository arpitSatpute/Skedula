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
            console.log("🔑 ApiClient: Added token to request");
        } else {
            console.log("⚠️ ApiClient: No token found for request");
        }
        
        return config;
    },
    (error) => {
        console.error("❌ ApiClient: Request interceptor error:", error);
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

        console.log("⚠️ ApiClient: Response error:", error.response?.status);

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                console.log("🔄 ApiClient: 401 received, attempting token refresh...");

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

                console.log("✅ ApiClient: Refresh response received:", refreshResponse.data);

                // Extract new access token
                let newAccessToken = refreshResponse.data.data?.accessToken || 
                                   refreshResponse.data?.accessToken || 
                                   refreshResponse.data?.token;

                if (newAccessToken) {
                    // Store new access token
                    localStorage.setItem('accessToken', newAccessToken);
                    console.log("✅ ApiClient: New access token stored");

                    // Update the failed request with new token and retry
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    console.log("🔄 ApiClient: Retrying original request with new token");
                    return apiClient.request(originalRequest);
                } else {
                    throw new Error('No access token received from refresh');
                }

            } catch (refreshError) {
                console.error('❌ ApiClient: Unable to refresh token:', refreshError);
                
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
