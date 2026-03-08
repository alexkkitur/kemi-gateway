import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupaUser } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
}

interface AuthContextType {
  user: AppUser | null;
  supaUser: SupaUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (email: string, password: string, fullName: string) => Promise<string | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchAppUser(supaUser: SupaUser): Promise<AppUser | null> {
  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('user_id', supaUser.id)
    .single();

  // Get role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', supaUser.id)
    .single();

  if (!profile || !roleData) return null;

  return {
    id: supaUser.id,
    name: profile.full_name,
    email: profile.email,
    role: roleData.role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [supaUser, setSupaUser] = useState<SupaUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSupaUser(session.user);
          // Use setTimeout to avoid potential deadlock with Supabase client
          setTimeout(async () => {
            const appUser = await fetchAppUser(session.user);
            setUser(appUser);
            setLoading(false);
          }, 0);
        } else {
          setSupaUser(null);
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Then check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setSupaUser(session.user);
        const appUser = await fetchAppUser(session.user);
        setUser(appUser);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  };

  const signup = async (email: string, password: string, fullName: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    return error ? error.message : null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupaUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, supaUser, loading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
