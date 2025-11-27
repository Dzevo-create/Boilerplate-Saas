/**
 * Supabase Middleware Client
 * 
 * Creates a Supabase client for use in Next.js middleware.
 * Handles session refresh and cookie management.
 * Supports DEMO_MODE when no Supabase credentials are configured.
 */

import { createServerClient, type SupabaseClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database.types';

// Check if we're in demo mode (no real Supabase credentials)
const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co';

/**
 * Creates a mock Supabase client for demo mode
 */
function createMockClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
    },
  } as unknown as SupabaseClient<Database>;
}

/**
 * Creates a Supabase client for middleware.
 * Returns both the client and the response with updated cookies.
 */
export function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Return mock client in demo mode
  if (DEMO_MODE) {
    return { supabase: createMockClient(), response, isDemoMode: true };
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  return { supabase, response, isDemoMode: false };
}

