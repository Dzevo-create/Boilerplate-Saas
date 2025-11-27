/**
 * Database Types
 * 
 * Auto-generate with: npm run db:generate-types
 * 
 * This is a starter template. Replace with generated types from Supabase.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          credits: number;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: string | null;
          subscription_plan: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          credits?: number;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          subscription_plan?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          credits?: number;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          subscription_plan?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          operation_type: string;
          metadata: Json | null;
          reference_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          operation_type: string;
          metadata?: Json | null;
          reference_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          operation_type?: string;
          metadata?: Json | null;
          reference_id?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_credits: {
        Args: {
          p_user_id: string;
          p_operation_type: string;
          p_amount: number;
          p_metadata?: Json;
          p_reference_id?: string;
        };
        Returns: {
          success: boolean;
          balance_after: number;
          transaction_id: string;
          error_message: string | null;
        }[];
      };
      deduct_credits: {
        Args: {
          p_user_id: string;
          p_operation_type: string;
          p_metadata?: Json;
          p_reference_id?: string;
        };
        Returns: {
          success: boolean;
          balance_after: number;
          transaction_id: string;
          error_message: string | null;
        }[];
      };
      get_credit_cost: {
        Args: {
          p_operation_type: string;
          p_metadata?: Json;
        };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];

// Convenience types
export type User = Tables<'users'>;
export type CreditTransaction = Tables<'credit_transactions'>;

