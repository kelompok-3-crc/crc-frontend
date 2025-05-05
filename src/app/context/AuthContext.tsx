"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '@/app/constants/config';

interface User {
  type: string;
  branch_name: string;
  name: string;
  nip: string;
  total_target: number;
  achieved: number;
  percentage: number;
  products: any;
  target_month: number;
  target_year: number;
  target_setted: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (nip: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Add cookie options configuration
const cookieOptions = {
  expires: 7, // 7 days
  secure: false, // HTTP only
  sameSite: 'strict' as const,
  path: '/'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Set initial loading to true
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = Cookies.get('token');
        const storedUser = Cookies.get('user');

        if (storedToken && storedUser) {
          // Set initial data from cookies
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token and refresh user data
          await fetchUserProfile(storedToken);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Clear invalid data
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const interceptUnauthorized = () => {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        try {
          const response = await originalFetch(...args);
          
          if (response.status === 401) {
            // Clear auth state and cookies
            logout();
            // We don't need router.replace here since useProtectedRoute will handle the redirect
            return response;
          }
          
          return response;
        } catch (error) {
          console.error('Fetch error:', error);
          throw error;
        }
      };

      // Cleanup function
      return () => {
        window.fetch = originalFetch;
      };
    };

    // Set up the interceptor
    const cleanup = interceptUnauthorized();
    return () => cleanup();
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/summary`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.data);
        Cookies.set('user', JSON.stringify(data.data), cookieOptions);
      } else {
        throw new Error(data.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
      throw error;
    }
  };

  const login = async (nip: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nip, password }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      if (data.success) {
        Cookies.set('token', data.token);
        console.log(data)
        await fetchUserProfile(data.token)
        return true;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Remove both token and user data from cookies
    Cookies.remove('token');
    Cookies.remove('user');
    setToken(null);
    setUser(null);
    router.replace("/login");

  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}