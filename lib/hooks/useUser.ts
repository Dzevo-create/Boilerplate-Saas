/**
 * useUser Hook
 * 
 * Fetches and caches the current user's database profile.
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@/types';

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async () => {
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authUser.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setUser(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user'));
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchUser();
    }
  }, [authUser, authLoading]);

  return {
    user,
    loading: authLoading || loading,
    error,
    refresh: fetchUser,
  };
}

