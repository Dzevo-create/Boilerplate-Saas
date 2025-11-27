'use client';

/**
 * Reset Password Form Component
 * 
 * Handles password reset requests.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

export function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    logger.info('Password reset requested', { email });

    try {
      const { error } = await resetPassword(email);

      if (error) {
        logger.error('Password reset error', { error: error.message });
        toast.error('Failed to send reset email', { description: error.message });
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success('Reset email sent');
    } catch (error) {
      logger.error('Unexpected reset error', { error });
      toast.error('An error occurred');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="text-lg font-semibold">Check your email</h3>
        <p className="text-muted-foreground">
          We sent a password reset link to <strong>{email}</strong>.
        </p>
        <Link href="/login">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </Link>
      </div>
    );
  }

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

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          'Send Reset Link'
        )}
      </Button>

      <Link href="/login" className="block">
        <Button variant="ghost" className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Button>
      </Link>
    </form>
  );
}

