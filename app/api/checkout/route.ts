/**
 * Checkout API Route
 * 
 * Creates a Stripe checkout session for subscription purchases.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { StripeService } from '@/lib/services/stripe';
import { checkoutSchema } from '@/lib/validation/schemas';
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
      .select('id, email')
      .eq('auth_id', user.id)
      .single();

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate request body
    const body = await request.json();
    const validationResult = checkoutSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { planId } = validationResult.data;

    // Get app URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create checkout session
    const session = await StripeService.createCheckoutSession({
      userId: dbUser.id,
      email: dbUser.email,
      planId,
      successUrl: `${appUrl}/dashboard?payment=success`,
      cancelUrl: `${appUrl}/pricing?payment=cancelled`,
    });

    logger.info('Checkout session created', { userId: dbUser.id, planId });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    logger.error('Checkout error', { error });
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

