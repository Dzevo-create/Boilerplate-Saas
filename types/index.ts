/**
 * Shared Types
 * 
 * Export all types from a single entry point.
 */

export * from './database.types';

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
}

// Subscription Types
export type SubscriptionStatus = 
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'paused'
  | 'trialing'
  | 'unpaid';

export type PlanId = 'starter' | 'pro' | 'business';

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  price: number;
  credits: number;
  features: string[];
  stripePriceId: string;
  popular?: boolean;
}

// Credit Types
export type CreditOperationType =
  | 'purchase'
  | 'subscription'
  | 'usage'
  | 'refund'
  | 'bonus'
  | 'admin_adjustment';

export interface CreditResult {
  success: boolean;
  balanceAfter: number;
  transactionId: string | null;
  errorMessage: string | null;
}

