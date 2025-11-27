/**
 * Subscription Portal API Route
 * 
 * Creates a Stripe billing portal session for subscription management.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { StripeService } from '@/lib/services/stripe';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const { data: dbUser } = await supabase
      .from('users')
      .select('id, stripe_customer_id')
      .eq('auth_id', user.id)
      .single();

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!dbUser.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create portal session
    const session = await StripeService.createPortalSession({
      customerId: dbUser.stripe_customer_id,
      returnUrl: `${appUrl}/dashboard`,
    });

    logger.info('Portal session created', { userId: dbUser.id });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    logger.error('Portal error', { error });
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}

