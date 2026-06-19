import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, setToken, getToken } from '@/lib/api';
import type { AppRole } from '@/lib/types';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
}

interface AuthContextType {
  user: AppUser | null;
  supaUser: AppUser | null; // kept for backwards-compat with existing imports
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (email: string, password: string, fullName: string) => Promise<string | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api<AppUser>('/auth/me')
      .then((u) => setUser(u))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const { token, user } = await api<{ token: string; user: AppUser }>('/auth/login', {
        body: { email, password },
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

  return (
    <AuthContext.Provider value={{ user, supaUser: user, loading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
