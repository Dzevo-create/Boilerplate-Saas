/**
 * Subscription Plans Configuration
 * 
 * Define your pricing tiers and features here.
 * Update the Stripe Price IDs with your actual values.
 */

import type { Plan, PlanId } from '@/types';

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for getting started',
    price: 9,
    credits: 50,
    stripePriceId: process.env.STRIPE_PRICE_ID_STARTER || '',
    features: [
      '50 credits per month',
      'Basic features',
      'Email support',
      'API access',
    ],
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'Best for professionals',
    price: 29,
    credits: 200,
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO || '',
    popular: true,
    features: [
      '200 credits per month',
      'All Starter features',
      'Priority support',
      'Advanced analytics',
      'Team collaboration',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    description: 'For teams and businesses',
    price: 99,
    credits: 1000,
    stripePriceId: process.env.STRIPE_PRICE_ID_BUSINESS || '',
    features: [
      '1000 credits per month',
      'All Pro features',
      'Dedicated support',
      'Custom integrations',
      'SSO authentication',
      'SLA guarantee',
    ],
  },
];

/**
 * Get plan by ID
 */
export function getPlanById(planId: PlanId): Plan | undefined {
  return PLANS.find(plan => plan.id === planId);
}

/**
 * Get plan by Stripe Price ID
 */
export function getPlanByPriceId(priceId: string): Plan | undefined {
  return PLANS.find(plan => plan.stripePriceId === priceId);
}

/**
 * Get credits for a Stripe Price ID
 */
export function getCreditsForPriceId(priceId: string): number {
  const plan = getPlanByPriceId(priceId);
  return plan?.credits || 0;
}

/**
 * Get plan name for a Stripe Price ID
 */
export function getPlanNameForPriceId(priceId: string): string {
  const plan = getPlanByPriceId(priceId);
  return plan?.name || 'Unknown';
}

