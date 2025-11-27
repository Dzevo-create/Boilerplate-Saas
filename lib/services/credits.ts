/**
 * Credit Service
 * 
 * Manages credit operations with atomic transactions.
 * Uses Supabase database functions for consistency.
 */

import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { CreditOperationType, CreditResult } from '@/types';

/**
 * Credit Service Class
 */
export class CreditService {
  /**
   * Check if user has enough credits
   */
  static async checkCreditsAvailable(
    userId: string,
    cost: number
  ): Promise<{ available: boolean; currentBalance: number }> {
    try {
      const supabase = createAdminClient();
      
      const { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();

      if (error || !data) {
        logger.error('Failed to check credits', { error, userId });
        return { available: false, currentBalance: 0 };
      }

      const currentBalance = data.credits || 0;
      return {
        available: currentBalance >= cost,
        currentBalance,
      };
    } catch (error) {
      logger.error('Error checking credits', { error, userId });
      return { available: false, currentBalance: 0 };
    }
  }

  /**
   * Deduct credits from user
   */
  static async deductCredits(
    userId: string,
    operationType: CreditOperationType,
    amount: number,
    metadata?: Record<string, unknown>,
    referenceId?: string
  ): Promise<CreditResult> {
    try {
      const supabase = createAdminClient();

      const { data, error } = await supabase.rpc('deduct_credits', {
        p_user_id: userId,
        p_operation_type: operationType,
        p_amount: amount,
        p_metadata: metadata || null,
        p_reference_id: referenceId || null,
      });

      if (error) {
        logger.error('Failed to deduct credits', { error, userId, amount });
        return {
          success: false,
          balanceAfter: 0,
          transactionId: null,
          errorMessage: error.message,
        };
      }

      const result = Array.isArray(data) ? data[0] : data;

      if (!result?.success) {
        return {
          success: false,
          balanceAfter: result?.balance_after || 0,
          transactionId: null,
          errorMessage: result?.error_message || 'Deduction failed',
        };
      }

      logger.info('Credits deducted', {
        userId,
        amount,
        balanceAfter: result.balance_after,
      });

      return {
        success: true,
        balanceAfter: result.balance_after,
        transactionId: result.transaction_id,
        errorMessage: null,
      };
    } catch (error) {
      logger.error('Error deducting credits', { error, userId });
      return {
        success: false,
        balanceAfter: 0,
        transactionId: null,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Add credits to user
   */
  static async addCredits(
    userId: string,
    operationType: CreditOperationType,
    amount: number,
    metadata?: Record<string, unknown>,
    referenceId?: string
  ): Promise<CreditResult> {
    try {
      const supabase = createAdminClient();

      // Store non-UUID reference IDs in metadata
      let finalReferenceId = referenceId;
      const finalMetadata = { ...metadata };
      
      const isUUID = (str: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

      if (referenceId && !isUUID(referenceId)) {
        finalReferenceId = undefined;
        finalMetadata.original_reference_id = referenceId;
      }

      const { data, error } = await supabase.rpc('add_credits', {
        p_user_id: userId,
        p_operation_type: operationType,
        p_amount: amount,
        p_metadata: finalMetadata || null,
        p_reference_id: finalReferenceId || null,
      });

      if (error) {
        logger.error('Failed to add credits', { error, userId, amount });
        return {
          success: false,
          balanceAfter: 0,
          transactionId: null,
          errorMessage: error.message,
        };
      }

      const result = Array.isArray(data) ? data[0] : data;

      if (!result?.success) {
        return {
          success: false,
          balanceAfter: result?.balance_after || 0,
          transactionId: null,
          errorMessage: result?.error_message || 'Addition failed',
        };
      }

      logger.info('Credits added', {
        userId,
        amount,
        balanceAfter: result.balance_after,
      });

      return {
        success: true,
        balanceAfter: result.balance_after,
        transactionId: result.transaction_id,
        errorMessage: null,
      };
    } catch (error) {
      logger.error('Error adding credits', { error, userId });
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
  static async getBalance(userId: string): Promise<number> {
    try {
      const supabase = createAdminClient();

      const { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();

      if (error || !data) {
        logger.error('Failed to get balance', { error, userId });
        return 0;
      }

      return data.credits || 0;
    } catch (error) {
      logger.error('Error getting balance', { error, userId });
      return 0;
    }
  }
}

