import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';
import { supabase } from '../supabase';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
  };

  const signUp = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out from Supabase", error);
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const u = session.user;
        setUser({
          id: u.id,
          name: u.user_metadata?.name || u.email?.split('@')[0] || "Eco Citizen",
          email: u.email || ""
        });
        setToken(session.access_token);
        localStorage.setItem('token', session.access_token);
        syncGuestData();
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      }
      setIsLoading(false);
    });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const u = session.user;
        setUser({
          id: u.id,
          name: u.user_metadata?.name || u.email?.split('@')[0] || "Eco Citizen",
          email: u.email || ""
        });
        setToken(session.access_token);
        localStorage.setItem('token', session.access_token);
        syncGuestData();
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signUp, logout }}>
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
