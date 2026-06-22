import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, setToken, getToken, ApiError } from '@/lib/api';
import type { AppRole } from '@/lib/types';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  profile_complete: boolean;
  tsc_number: string | null;
  delm_number: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  supaUser: AppUser | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<string | null>;
  signup: (email: string, password: string, fullName: string) => Promise<string | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    const u = await api<AppUser>('/auth/me');
    setUser(u);
  };

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    fetchMe()
      .catch((e) => {
        // Only clear token on explicit auth rejection — not network errors
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          setToken(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (identifier: string, password: string): Promise<string | null> => {
    try {
      const { token, user } = await api<{ token: string; user: AppUser }>('/auth/login', {
        body: { identifier, password },
      });
      setToken(token);
      setUser(user);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Login failed';
    }
  };

  const signup = async (email: string, password: string, full_name: string): Promise<string | null> => {
    try {
      const { token, user } = await api<{ token: string; user: AppUser }>('/auth/signup', {
        body: { email, password, full_name },
      });
      setToken(token);
      setUser(user);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Signup failed';
    }
  };

  const logout = async () => {
    try { await api('/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!getToken()) return;
    try { await fetchMe(); } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
        setToken(null);
        setUser(null);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user, supaUser: user, loading, login, signup, logout, refreshUser,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
