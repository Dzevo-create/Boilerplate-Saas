/**
 * Supabase Browser Client
 * 
 * Use this client in React Client Components.
 * Handles authentication cookies automatically.
 * Supports DEMO_MODE when no Supabase credentials are configured.
 */

import { createBrowserClient, type SupabaseClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if we're in demo mode
export const DEMO_MODE = !supabaseUrl || 
  supabaseUrl === 'https://your-project.supabase.co' ||
  !supabaseAnonKey ||
  supabaseAnonKey === 'your-anon-key';

if (DEMO_MODE && typeof window !== 'undefined') {
  console.log('🎭 Running in DEMO MODE - Supabase credentials not configured');
  console.log('📝 Copy env.template to .env.local and add your credentials');
}

/**
 * Creates a mock Supabase client for demo mode
 */
function createMockClient(): SupabaseClient<Database> {
  const mockClient = {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ 
        data: { subscription: { unsubscribe: () => {} } } 
      }),
      signInWithPassword: async () => ({ 
        data: { user: null, session: null }, 
        error: { message: 'Demo Mode - Authentication disabled' } 
      }),
      signUp: async () => ({ 
        data: { user: null, session: null }, 
        error: { message: 'Demo Mode - Registration disabled' } 
      }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: { message: 'Demo Mode' } }),
      update: () => ({ data: null, error: { message: 'Demo Mode' } }),
      delete: () => ({ data: null, error: { message: 'Demo Mode' } }),
    }),
  };
  return mockClient as unknown as SupabaseClient<Database>;
}

/**
 * Creates a Supabase client for browser/client-side usage.
 * Uses SSR-compatible cookie handling.
 */
export function createClient(): SupabaseClient<Database> {
  if (DEMO_MODE) {
    return createMockClient();
  }
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Singleton instance for convenience
export const supabase = DEMO_MODE 
  ? createMockClient() 
  : createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

