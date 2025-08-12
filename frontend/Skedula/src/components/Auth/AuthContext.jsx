import React, { createContext, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);

    const login = async (email, password, role) => {
        try{
            // Fix: Ensure URL has proper slash
            const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;
            const url = `${baseURL}/auth/login`;
            
            const response = await axios.post(url, { email, password, role });
            const { accessToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('userRole', role);
            setUser({ email, role });
            console.log('Login successful');
            return response.data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const signup = async (data) => {
        try {
            const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;
            
            const response = await axios.post(`${baseURL}/auth/signup`, data);
            console.log('Signup successful');
            localStorage.setItem('user', response.data.data.id);
            return response.data;
        } catch(error) {
            console.error('Signup failed:', error);
            throw error;
        };
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        setUser(null);
        console.log('Logout successful');
    };
    
    const value = {
        user,
        login,
        signup,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
