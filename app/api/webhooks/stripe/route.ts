/**
 * Stripe Webhook Handler
 * 
 * Processes Stripe webhook events for payments and subscriptions.
 * Implements idempotency to prevent duplicate processing.
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/server';
import { CreditService } from '@/lib/services/credits';
import { getCreditsForPriceId, getPlanNameForPriceId } from '@/lib/config/plans';
import { logger } from '@/lib/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
      logger.error('[Webhook] Missing signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error('[Webhook] Secret not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      logger.error('[Webhook] Signature verification failed', { error: msg });
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    logger.info('[Webhook] Event received', { type: event.type, id: event.id });

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        logger.info('[Webhook] Unhandled event', { type: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('[Webhook] Processing error', { error });
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) {
    logger.error('[Webhook] Missing userId in metadata');
    return;
  }

  const supabase = createAdminClient();

  if (session.mode === 'subscription') {
    const subscriptionId = typeof session.subscription === 'string' 
      ? session.subscription 
      : session.subscription?.id;
    const customerId = typeof session.customer === 'string' 
      ? session.customer 
      : session.customer?.id;

    if (!subscriptionId || !customerId) {
      logger.error('[Webhook] Missing subscription/customer ID');
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id;
    const plan = getPlanNameForPriceId(priceId);
    const credits = getCreditsForPriceId(priceId);

    // Update user subscription
    await supabase
      .from('users')
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        subscription_status: 'active',
        subscription_plan: plan,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq('id', userId);

    // Add initial credits (with idempotency check)
    if (credits > 0) {
      const { data: existingTx } = await supabase
        .from('credit_transactions')
        .select('id')
        .eq('metadata->>stripe_session_id', session.id)
        .eq('operation_type', 'subscription')
        .maybeSingle();

      if (!existingTx) {
        await CreditService.addCredits(userId, 'subscription', credits, {
          stripe_session_id: session.id,
          plan_name: plan,
          type: 'subscription_initial',
        });
      }
    }

    logger.info('[Webhook] Subscription activated', { userId, plan, credits });
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const subscriptionId = typeof invoice.subscription === 'string' 
    ? invoice.subscription 
    : invoice.subscription?.id;
  const customerId = typeof invoice.customer === 'string' 
    ? invoice.customer 
    : invoice.customer?.id;

  if (!subscriptionId || !customerId) return;

  const supabase = createAdminClient();

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .or(`stripe_subscription_id.eq.${subscriptionId},stripe_customer_id.eq.${customerId}`)
    .maybeSingle();

  if (!user) {
    logger.error('[Webhook] User not found for invoice', { subscriptionId });
    return;
  }

  // Skip initial invoices (handled by checkout.session.completed)
  if (invoice.billing_reason === 'subscription_create') {
    logger.info('[Webhook] Skipping initial invoice (handled by checkout)');
    return;
  }

  // Add renewal credits
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;
  const credits = getCreditsForPriceId(priceId);
  const plan = getPlanNameForPriceId(priceId);

  if (credits > 0 && invoice.amount_paid > 0) {
    const { data: existingTx } = await supabase
      .from('credit_transactions')
      .select('id')
      .eq('metadata->>stripe_invoice_id', invoice.id)
      .maybeSingle();

    if (!existingTx) {
      await CreditService.addCredits(user.id, 'subscription', credits, {
        stripe_invoice_id: invoice.id,
        plan_name: plan,
        type: 'subscription_renewal',
      });
    }
  }

  // Update period end
  await supabase
    .from('users')
    .update({
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      subscription_status: subscription.status,
    })
    .eq('id', user.id);

  logger.info('[Webhook] Subscription renewed', { userId: user.id, credits });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = createAdminClient();
  const priceId = subscription.items.data[0]?.price.id;
  const plan = getPlanNameForPriceId(priceId);

  await supabase
    .from('users')
    .update({
      subscription_status: subscription.status,
      subscription_plan: plan,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  logger.info('[Webhook] Subscription updated', { subscriptionId: subscription.id });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = createAdminClient();

  await supabase
    .from('users')
    .update({ subscription_status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id);

  logger.info('[Webhook] Subscription canceled', { subscriptionId: subscription.id });
}

