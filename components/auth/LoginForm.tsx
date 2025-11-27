'use client';

/**
 * Login Form Component
 * 
 * Handles user authentication with email and password.
 */

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    logger.info('Login started', { email });

    try {
      const { error } = await signIn(email, password);

      if (error) {
        logger.error('Login error', { error: error.message });
        toast.error('Login failed', { description: error.message });
        setLoading(false);
        return;
      }

      // Wait for session
      let session = null;
      for (let i = 0; i < 3; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          session = data.session;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      if (!session?.user) {
        logger.error('No session after login');
        toast.error('Session could not be created');
        setLoading(false);
        return;
      }

      toast.success('Successfully logged in');
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      logger.error('Unexpected login error', { error });
      toast.error('An error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          disabled={loading}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link 
            href="/reset-password" 
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          disabled={loading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}

