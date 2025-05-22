import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SOCKET_URL } from '../utils/socket';
import { AuthState, LoginCredentials, User, AuthResponse } from '../utils/types';

// Define the shape of our context
interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on startup
  useEffect(() => {
    const loadTokenAndUser = async () => {
      try {
        const [token, userJson] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);

        if (token && userJson) {
          setState({
            token,
            user: JSON.parse(userJson),
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState({
            ...state,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        setState({
          ...state,
          isLoading: false,
        });
      }
    };

    loadTokenAndUser();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      setError(null);
      const response = await fetch(`${SOCKET_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token and user data
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, data.token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user)),
      ]);

      setState({
        token: data.token,
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    }
  };

  // Register function
  const register = async (credentials: LoginCredentials) => {
    try {
      setError(null);
      const response = await fetch(`${SOCKET_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Save token and user data
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, data.token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user)),
      ]);

      setState({
        token: data.token,
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Remove auth data from storage
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
        AsyncStorage.removeItem('username'), // Also clear the old username storage
      ]);

      // Update state
      setState({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Context value
  const value = {
    ...state,
    login,
    register,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
