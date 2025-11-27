'use client';

/**
 * Auth Provider Component
 * 
 * Provides authentication state and methods to the entire application.
 * Handles session management and auth state changes.
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    logger.info('Sign in attempt', { email });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      logger.error('Sign in failed', { error: error.message });
    }
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    logger.info('Sign up attempt', { email });
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/verify-email`
      : `${process.env.NEXT_PUBLIC_APP_URL}/verify-email`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    
    if (error) {
      logger.error('Sign up failed', { error: error.message });
    }
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    logger.info('Sign out');
    try {
      await supabase.auth.signOut();
    } catch (error) {
      logger.error('Sign out error', { error });
    } finally {
      setUser(null);
      setSession(null);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    logger.info('Password reset request', { email });
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    logger.info('Password update');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
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

