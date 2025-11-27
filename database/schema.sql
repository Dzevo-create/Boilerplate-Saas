-- =====================================================
-- SaaS Boilerplate - Supabase Database Schema
-- =====================================================
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Users Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  credits INTEGER DEFAULT 0 CHECK (credits >= 0),
  -- Stripe fields
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  subscription_status TEXT,
  subscription_plan TEXT,
  current_period_end TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON public.users(stripe_customer_id);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);

DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id);

DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
CREATE POLICY "Service role can manage users" ON public.users
  FOR ALL USING (auth.role() = 'service_role');


-- 2. Credit Transactions Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  operation_type TEXT NOT NULL,
  metadata JSONB,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_credit_tx_user ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_tx_created ON public.credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_tx_metadata ON public.credit_transactions USING GIN(metadata);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.credit_transactions;
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

DROP POLICY IF EXISTS "Service role can manage transactions" ON public.credit_transactions;
CREATE POLICY "Service role can manage transactions" ON public.credit_transactions
  FOR ALL USING (auth.role() = 'service_role');


-- 3. Updated At Trigger
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- 4. Handle New User Trigger
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, credits)
  VALUES (NEW.id, NEW.email, 0)
  ON CONFLICT (auth_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();


-- 5. Credit Functions
-- =====================================================

-- Add Credits Function
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_operation_type TEXT,
  p_amount INTEGER,
  p_metadata JSONB DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  balance_after INTEGER,
  transaction_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_new_balance INTEGER;
  v_tx_id UUID;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RETURN QUERY SELECT FALSE, 0, NULL::UUID, 'Amount must be positive'::TEXT;
    RETURN;
  END IF;

  -- Update user credits and get new balance
  UPDATE public.users
  SET credits = credits + p_amount
  WHERE id = p_user_id
  RETURNING credits INTO v_new_balance;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, NULL::UUID, 'User not found'::TEXT;
    RETURN;
  END IF;

  -- Create transaction record
  INSERT INTO public.credit_transactions (user_id, amount, operation_type, metadata, reference_id)
  VALUES (p_user_id, p_amount, p_operation_type, p_metadata, p_reference_id)
  RETURNING id INTO v_tx_id;

  RETURN QUERY SELECT TRUE, v_new_balance, v_tx_id, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Deduct Credits Function
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_operation_type TEXT,
  p_amount INTEGER DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  balance_after INTEGER,
  transaction_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_current_balance INTEGER;
  v_cost INTEGER;
  v_new_balance INTEGER;
  v_tx_id UUID;
BEGIN
  -- Get cost (use provided amount or default to 1)
  v_cost := COALESCE(p_amount, 1);

  -- Get current balance
  SELECT credits INTO v_current_balance
  FROM public.users
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, NULL::UUID, 'User not found'::TEXT;
    RETURN;
  END IF;

  -- Check sufficient balance
  IF v_current_balance < v_cost THEN
    RETURN QUERY SELECT FALSE, v_current_balance, NULL::UUID, 'Insufficient credits'::TEXT;
    RETURN;
  END IF;

  -- Update balance
  UPDATE public.users
  SET credits = credits - v_cost
  WHERE id = p_user_id
  RETURNING credits INTO v_new_balance;

  -- Create transaction record (negative amount for deduction)
  INSERT INTO public.credit_transactions (user_id, amount, operation_type, metadata, reference_id)
  VALUES (p_user_id, -v_cost, p_operation_type, p_metadata, p_reference_id)
  RETURNING id INTO v_tx_id;

  RETURN QUERY SELECT TRUE, v_new_balance, v_tx_id, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Get Credit Cost Function (placeholder - customize as needed)
CREATE OR REPLACE FUNCTION get_credit_cost(
  p_operation_type TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS INTEGER AS $$
BEGIN
  -- Default costs - customize as needed
  RETURN CASE p_operation_type
    WHEN 'usage' THEN 1
    WHEN 'premium_usage' THEN 5
    ELSE 1
  END;
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these to verify setup:

-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name IN ('users', 'credit_transactions');

-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public';

