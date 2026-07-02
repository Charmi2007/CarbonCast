import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Sync Guest Data when user logs in or signs up
  const syncGuestData = async () => {
    try {
      const guestData = localStorage.getItem('my_calcs');
      if (guestData) {
        const record_ids = JSON.parse(guestData);
        if (Array.isArray(record_ids) && record_ids.length > 0) {
          await apiClient.post('/auth/sync-guest-data', { record_ids });
          localStorage.removeItem('my_calcs');
        }
      }
    } catch (error) {
      console.error("Failed to sync guest data", error);
    }
  };

  const login = async (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    await syncGuestData();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await apiClient.get('/auth/me');
          if (res.data.status === 'success') {
            setUser(res.data.user);
            // Also attempt sync in case a previous attempt failed but token is valid
            await syncGuestData();
          }
        } catch (error) {
          console.error("Auth check failed", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    fetchUser();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
