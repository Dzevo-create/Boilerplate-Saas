/**
 * Stripe Service
 * 
 * Handles all Stripe-related operations.
 * Server-side only - do not import in client components.
 */

import Stripe from 'stripe';
import { logger } from '@/lib/logger';
import { getPlanById } from '@/lib/config/plans';
import type { PlanId } from '@/types';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

export interface CheckoutSessionParams {
  userId: string;
  email: string;
  planId: PlanId;
  successUrl: string;
  cancelUrl: string;
}

export interface CustomerPortalParams {
  customerId: string;
  returnUrl: string;
}

/**
 * Stripe Service Class
 */
export class StripeService {
  /**
   * Create a checkout session for subscription
   */
  static async createCheckoutSession(params: CheckoutSessionParams) {
    const { userId, email, planId, successUrl, cancelUrl } = params;
    
    const plan = getPlanById(planId);
    if (!plan) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }

    if (!plan.stripePriceId) {
      throw new Error(`No Stripe Price ID configured for plan: ${planId}`);
    }

    logger.info('Creating checkout session', { userId, planId, email });

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.stripePriceId,
            quantity: 1,
          },
        ],
        customer_email: email,
        metadata: {
          userId,
          planId,
          planName: plan.name,
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        subscription_data: {
          metadata: {
            userId,
            planId,
          },
        },
      });

      logger.info('Checkout session created', { sessionId: session.id });
      return session;
    } catch (error) {
      logger.error('Failed to create checkout session', { error, userId, planId });
      throw error;
    }
  }

  /**
   * Create a customer portal session
   */
  static async createPortalSession(params: CustomerPortalParams) {
    const { customerId, returnUrl } = params;

    logger.info('Creating portal session', { customerId });

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return session;
    } catch (error) {
      logger.error('Failed to create portal session', { error, customerId });
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(subscriptionId: string, immediately = false) {
    logger.info('Canceling subscription', { subscriptionId, immediately });

    try {
      if (immediately) {
        return await stripe.subscriptions.cancel(subscriptionId);
      } else {
        return await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      }
    } catch (error) {
      logger.error('Failed to cancel subscription', { error, subscriptionId });
      throw error;
    }
  }

  /**
   * Retrieve a subscription
   */
  static async getSubscription(subscriptionId: string) {
    try {
      return await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      logger.error('Failed to retrieve subscription', { error, subscriptionId });
      throw error;
    }
  }

  /**
   * Retrieve a customer
   */
  static async getCustomer(customerId: string) {
    try {
      return await stripe.customers.retrieve(customerId);
    } catch (error) {
      logger.error('Failed to retrieve customer', { error, customerId });
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  static verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): Stripe.Event {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  }
}

export { stripe };

