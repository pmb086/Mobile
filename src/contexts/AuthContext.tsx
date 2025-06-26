import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('Starting Request:', {
    url: request.url,
    method: request.method,
    baseURL: request.baseURL,
    headers: request.headers,
    data: request.data,
    params: request.params,
  });
  return request;
}, error => {
  console.error('Request Error:', {
    message: error.message,
    config: error.config,
  });
  return Promise.reject(error);
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      config: {
        url: response.config.url,
        method: response.config.method,
        baseURL: response.config.baseURL,
      }
    });
    return response;
  },
  error => {
    console.log('Response Error:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        baseURL: error.config.baseURL,
        headers: error.config.headers,
        data: error.config.data,
      } : 'No config available',
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      } : 'No response available'
    });
    return Promise.reject(error);
  }
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    // Update axios authorization header when token changes
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('@TeachConnect:token'),
        AsyncStorage.getItem('@TeachConnect:user')
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', { email, password });
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      const { token: newToken, user: userData } = response.data;
      
      await Promise.all([
        AsyncStorage.setItem('@TeachConnect:token', newToken),
        AsyncStorage.setItem('@TeachConnect:user', JSON.stringify(userData))
      ]);

      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('@TeachConnect:token'),
        AsyncStorage.removeItem('@TeachConnect:user')
      ]);
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      delete api.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      isAuthenticated, 
      signIn, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 