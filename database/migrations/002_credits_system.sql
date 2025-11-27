-- Credit System Migration
-- Adds credit tracking with transaction history

-- Add credits column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 100;

-- Create credit operation type enum
DO $$ BEGIN
    CREATE TYPE credit_operation_type AS ENUM (
        'ai_generation',
        'ai_chat',
        'image_generation',
        'video_generation',
        'document_processing',
        'api_call',
        'purchase',
        'refund',
        'bonus',
        'subscription',
        'admin_adjustment'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Credit transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    operation_type credit_operation_type NOT NULL,
    amount INTEGER NOT NULL,
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    metadata JSONB,
    reference_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id 
    ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at 
    ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_operation_type 
    ON credit_transactions(operation_type);

-- Credit pricing rules table (optional, for dynamic pricing)
CREATE TABLE IF NOT EXISTS credit_pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type credit_operation_type NOT NULL UNIQUE,
    base_cost INTEGER NOT NULL,
    description TEXT,
    metadata JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default pricing rules
INSERT INTO credit_pricing_rules (operation_type, base_cost, description) VALUES
    ('ai_generation', 10, 'General AI generation'),
    ('ai_chat', 1, 'Single chat message'),
    ('image_generation', 15, 'Image generation'),
    ('video_generation', 50, 'Video generation'),
    ('document_processing', 5, 'Document processing'),
    ('api_call', 1, 'API call')
ON CONFLICT (operation_type) DO NOTHING;

-- RLS Policies
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
    ON credit_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert transactions"
    ON credit_transactions FOR INSERT
    WITH CHECK (true);

-- Function to get credit cost
CREATE OR REPLACE FUNCTION get_credit_cost(
    p_operation_type credit_operation_type,
    p_metadata JSONB DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_cost INTEGER;
BEGIN
    SELECT base_cost INTO v_cost
    FROM credit_pricing_rules
    WHERE operation_type = p_operation_type AND is_active = true;
    
    IF v_cost IS NULL THEN
        -- Default costs
        v_cost := CASE p_operation_type
            WHEN 'ai_generation' THEN 10
            WHEN 'ai_chat' THEN 1
            WHEN 'image_generation' THEN 15
            WHEN 'video_generation' THEN 50
            WHEN 'document_processing' THEN 5
            WHEN 'api_call' THEN 1
            ELSE 1
        END;
    END IF;
    
    RETURN v_cost;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct credits
CREATE OR REPLACE FUNCTION deduct_credits(
    p_user_id UUID,
    p_operation_type credit_operation_type,
    p_metadata JSONB DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, balance_after INTEGER, transaction_id UUID, error_message TEXT) AS $$
DECLARE
    v_cost INTEGER;
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_transaction_id UUID;
BEGIN
    -- Get cost
    v_cost := get_credit_cost(p_operation_type, p_metadata);
    
    -- Get current balance with lock
    SELECT credits INTO v_current_balance
    FROM users
    WHERE id = p_user_id
    FOR UPDATE;
    
    IF v_current_balance IS NULL THEN
        RETURN QUERY SELECT false, 0, NULL::UUID, 'User not found'::TEXT;
        RETURN;
    END IF;
    
    IF v_current_balance < v_cost THEN
        RETURN QUERY SELECT false, v_current_balance, NULL::UUID, 'Insufficient credits'::TEXT;
        RETURN;
    END IF;
    
    v_new_balance := v_current_balance - v_cost;
    
    -- Update balance
    UPDATE users SET credits = v_new_balance WHERE id = p_user_id;
    
    -- Create transaction
    INSERT INTO credit_transactions (user_id, operation_type, amount, balance_before, balance_after, metadata, reference_id)
    VALUES (p_user_id, p_operation_type, -v_cost, v_current_balance, v_new_balance, p_metadata, p_reference_id)
    RETURNING id INTO v_transaction_id;
    
    RETURN QUERY SELECT true, v_new_balance, v_transaction_id, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits
CREATE OR REPLACE FUNCTION add_credits(
    p_user_id UUID,
    p_operation_type credit_operation_type,
    p_amount INTEGER,
    p_metadata JSONB DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, balance_after INTEGER, transaction_id UUID, error_message TEXT) AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_transaction_id UUID;
BEGIN
    -- Get current balance with lock
    SELECT credits INTO v_current_balance
    FROM users
    WHERE id = p_user_id
    FOR UPDATE;
    
    IF v_current_balance IS NULL THEN
        RETURN QUERY SELECT false, 0, NULL::UUID, 'User not found'::TEXT;
        RETURN;
    END IF;
    
    v_new_balance := v_current_balance + p_amount;
    
    -- Update balance
    UPDATE users SET credits = v_new_balance WHERE id = p_user_id;
    
    -- Create transaction
    INSERT INTO credit_transactions (user_id, operation_type, amount, balance_before, balance_after, metadata, reference_id)
    VALUES (p_user_id, p_operation_type, p_amount, v_current_balance, v_new_balance, p_metadata, p_reference_id)
    RETURNING id INTO v_transaction_id;
    
    RETURN QUERY SELECT true, v_new_balance, v_transaction_id, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

