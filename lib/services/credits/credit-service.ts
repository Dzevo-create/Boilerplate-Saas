/**
 * Credit Service
 * 
 * Professional credit management with atomic operations,
 * transaction history, and refund support.
 */

import { createClient } from '@/lib/supabase/client';
import {
  CreditOperationType,
  CreditDeductionResult,
  CreditAdditionResult,
  CreditRefundResult,
  CreditCheckResult,
  CreditTransaction,
  DEFAULT_CREDIT_PRICING,
} from './types';

export class CreditService {
  /**
   * Check if user has enough credits for an operation
   */
  static async checkCredits(
    userId: string,
    operationType: CreditOperationType,
    customCost?: number
  ): Promise<CreditCheckResult> {
    try {
      const supabase = createClient();
      
      const { data: user, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();

      if (error || !user) {
        console.error('[CreditService] Error fetching user credits:', error);
        return { available: false, cost: 0, currentBalance: 0 };
      }

      const currentBalance = user.credits || 0;
      const cost = customCost ?? DEFAULT_CREDIT_PRICING[operationType];

      return {
        available: currentBalance >= cost,
        cost,
        currentBalance,
      };
    } catch (error) {
      console.error('[CreditService] Exception in checkCredits:', error);
      return { available: false, cost: 0, currentBalance: 0 };
    }
  }

  /**
   * Deduct credits for an operation (with transaction history)
   */
  static async deductCredits(
    userId: string,
    operationType: CreditOperationType,
    metadata?: Record<string, unknown>,
    referenceId?: string,
    customCost?: number
  ): Promise<CreditDeductionResult> {
    try {
      const supabase = createClient();
      const cost = customCost ?? DEFAULT_CREDIT_PRICING[operationType];

      // Get current balance
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return this.createErrorResult('User not found', cost);
      }

      const currentBalance = user.credits || 0;
      if (currentBalance < cost) {
        return this.createErrorResult('Insufficient credits', cost);
      }

      const newBalance = currentBalance - cost;

      // Update balance
      const { error: updateError } = await supabase
        .from('users')
        .update({ credits: newBalance })
        .eq('id', userId);

      if (updateError) {
        return this.createErrorResult(updateError.message, cost);
      }

      // Create transaction record
      const transactionId = await this.createTransaction(
        userId, operationType, -cost, currentBalance, newBalance, metadata, referenceId
      );

      return {
        success: true,
        balanceAfter: newBalance,
        transactionId,
        errorMessage: null,
        cost,
      };
    } catch (error) {
      console.error('[CreditService] Exception in deductCredits:', error);
      return this.createErrorResult(
        error instanceof Error ? error.message : 'Unknown error',
        customCost ?? DEFAULT_CREDIT_PRICING[operationType]
      );
    }
  }

  /**
   * Add credits (for purchases, bonuses, etc.)
   */
  static async addCredits(
    userId: string,
    operationType: CreditOperationType,
    amount: number,
    metadata?: Record<string, unknown>,
    referenceId?: string
  ): Promise<CreditAdditionResult> {
    try {
      const supabase = createClient();

      // Get current balance
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return { success: false, balanceAfter: 0, transactionId: null, errorMessage: 'User not found' };
      }

      const currentBalance = user.credits || 0;
      const newBalance = currentBalance + amount;

      // Update balance
      const { error: updateError } = await supabase
        .from('users')
        .update({ credits: newBalance })
        .eq('id', userId);

      if (updateError) {
        return { success: false, balanceAfter: 0, transactionId: null, errorMessage: updateError.message };
      }

      // Create transaction record
      const transactionId = await this.createTransaction(
        userId, operationType, amount, currentBalance, newBalance, metadata, referenceId
      );

      return {
        success: true,
        balanceAfter: newBalance,
        transactionId,
        errorMessage: null,
      };
    } catch (error) {
      console.error('[CreditService] Exception in addCredits:', error);
      return {
        success: false,
        balanceAfter: 0,
        transactionId: null,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Refund credits for a failed operation
   */
  static async refundCredits(
    userId: string,
    originalTransactionId: string,
    metadata?: Record<string, unknown>
  ): Promise<CreditRefundResult> {
    try {
      const supabase = createClient();

      // Get original transaction
      const { data: transaction, error: txError } = await supabase
        .from('credit_transactions')
        .select('amount, operation_type')
        .eq('id', originalTransactionId)
        .eq('user_id', userId)
        .single();

      if (txError || !transaction) {
        return { success: false, balanceAfter: 0, transactionId: null, errorMessage: 'Transaction not found' };
      }

      const refundAmount = Math.abs(transaction.amount);

      return this.addCredits(userId, 'refund', refundAmount, {
        ...metadata,
        original_transaction_id: originalTransactionId,
        original_operation_type: transaction.operation_type,
      }, originalTransactionId);
    } catch (error) {
      console.error('[CreditService] Exception in refundCredits:', error);
      return {
        success: false,
        balanceAfter: 0,
        transactionId: null,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get user's current credit balance
   */
  static async getUserCredits(userId: string): Promise<number> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();

      if (error || !data) return 0;
      return data.credits || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get user's transaction history
   */
  static async getTransactionHistory(
    userId: string,
    limit = 50
  ): Promise<CreditTransaction[]> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) return [];

      return data.map(tx => ({
        id: tx.id,
        userId: tx.user_id,
        operationType: tx.operation_type,
        amount: tx.amount,
        balanceBefore: tx.balance_before,
        balanceAfter: tx.balance_after,
        metadata: tx.metadata,
        referenceId: tx.reference_id,
        createdAt: new Date(tx.created_at),
      }));
    } catch {
      return [];
    }
  }

  // Private helper methods
  private static createErrorResult(message: string, cost: number): CreditDeductionResult {
    return { success: false, balanceAfter: 0, transactionId: null, errorMessage: message, cost };
  }

  private static async createTransaction(
    userId: string,
    operationType: CreditOperationType,
    amount: number,
    balanceBefore: number,
    balanceAfter: number,
    metadata?: Record<string, unknown>,
    referenceId?: string
  ): Promise<string | null> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          operation_type: operationType,
          amount,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          metadata,
          reference_id: referenceId,
        })
        .select('id')
        .single();

      if (error) return null;
      return data?.id || null;
    } catch {
      return null;
    }
  }
}

