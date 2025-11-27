'use client';

/**
 * Dashboard Content Component
 * 
 * Client component for the dashboard with interactive elements.
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { User as DbUser } from '@/types';
import type { User as AuthUser } from '@supabase/supabase-js';
import { 
  CreditCard, 
  LogOut, 
  Settings, 
  Sparkles,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface DashboardContentProps {
  user: DbUser | null;
  authUser: AuthUser;
}

export function DashboardContent({ user, authUser }: DashboardContentProps) {
  const { signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const handleManageSubscription = async () => {
    if (!user?.stripe_customer_id) {
      router.push('/pricing');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to open billing portal');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionBadge = () => {
    if (!user?.subscription_status || user.subscription_status === 'canceled') {
      return <Badge variant="secondary">Free</Badge>;
    }
    if (user.subscription_status === 'active') {
      return <Badge variant="success">{user.subscription_plan || 'Active'}</Badge>;
    }
    return <Badge variant="warning">{user.subscription_status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="text-xl font-bold">
            <span className="text-primary">SaaS</span>Boilerplate
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {authUser.email}
            </span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your account.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Credits Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Credits</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{user?.credits || 0}</div>
              <p className="text-xs text-muted-foreground">
                Available credits
              </p>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Subscription</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {getSubscriptionBadge()}
              </div>
              {user?.current_period_end && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Renews {new Date(user.current_period_end).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Account Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Account</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium truncate">
                {user?.full_name || authUser.email}
              </div>
              <p className="text-xs text-muted-foreground">
                Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Upgrade Card */}
          <Card>
            <CardHeader>
              <CardTitle>Upgrade Your Plan</CardTitle>
              <CardDescription>
                Get more credits and unlock premium features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/pricing">
                <Button className="w-full gap-2">
                  <Sparkles className="h-4 w-4" />
                  View Plans
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Billing Card */}
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>
                Manage your subscription and payment methods.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleManageSubscription}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                {user?.stripe_customer_id ? 'Manage Billing' : 'Subscribe Now'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

