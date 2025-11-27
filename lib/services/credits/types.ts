/**
 * Credit System Types
 * 
 * Type-safe definitions for the credit system.
 * Scalable for various operation types.
 */

// Operation types for credit transactions
export type CreditOperationType =
  | 'ai_generation'
  | 'ai_chat'
  | 'image_generation'
  | 'video_generation'
  | 'document_processing'
  | 'api_call'
  | 'purchase'
  | 'refund'
  | 'bonus'
  | 'subscription'
  | 'admin_adjustment';

// Result of credit deduction
export interface CreditDeductionResult {
  success: boolean;
  balanceAfter: number;
  transactionId: string | null;
  errorMessage: string | null;
  cost: number;
}

// Result of credit addition
export interface CreditAdditionResult {
  success: boolean;
  balanceAfter: number;
  transactionId: string | null;
  errorMessage: string | null;
}

// Result of credit refund
export interface CreditRefundResult {
  success: boolean;
  balanceAfter: number;
  transactionId: string | null;
  errorMessage: string | null;
}

// Credit check result
export interface CreditCheckResult {
  available: boolean;
  cost: number;
  currentBalance: number;
}

// Credit transaction record
export interface CreditTransaction {
  id: string;
  userId: string;
  operationType: CreditOperationType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  metadata?: Record<string, unknown>;
  referenceId?: string;
  createdAt: Date;
}

// Credit display info for UI
export interface CreditDisplayInfo {
  credits: number;
  displayText: string;
  displayShort: string;
  isLow: boolean;
  warningText?: string;
}

// Pricing configuration
export interface CreditPricing {
  operationType: CreditOperationType;
  baseCost: number;
  description: string;
  metadata?: Record<string, unknown>;
}

// Default pricing (can be overridden in DB)
export const DEFAULT_CREDIT_PRICING: Record<CreditOperationType, number> = {
  ai_generation: 10,
  ai_chat: 1,
  image_generation: 15,
  video_generation: 50,
  document_processing: 5,
  api_call: 1,
  purchase: 0,
  refund: 0,
  bonus: 0,
  subscription: 0,
  admin_adjustment: 0,
};

