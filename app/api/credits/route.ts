/**
 * Credits API Route
 * 
 * Handles credit balance and transaction history.
 */

import { NextRequest, NextResponse } from 'next/server';
import { CreditService } from '@/lib/services/credits';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'history': {
        const limit = parseInt(searchParams.get('limit') || '50');
        const history = await CreditService.getTransactionHistory(user.id, limit);
        return NextResponse.json({ transactions: history });
      }

      case 'balance':
      default: {
        const balance = await CreditService.getUserCredits(user.id);
        return NextResponse.json({ credits: balance });
      }
    }
  } catch (error) {
    console.error('[Credits API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, operationType, amount, metadata, customCost } = body;

    switch (action) {
      case 'check': {
        const result = await CreditService.checkCredits(
          user.id,
          operationType,
          customCost
        );
        return NextResponse.json(result);
      }

      case 'deduct': {
        const result = await CreditService.deductCredits(
          user.id,
          operationType,
          metadata,
          undefined,
          customCost
        );
        return NextResponse.json(result);
      }

      case 'add': {
        // Only allow admin to add credits
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (userData?.role !== 'admin') {
          return NextResponse.json(
            { error: 'Forbidden' },
            { status: 403 }
          );
        }

        const targetUserId = body.targetUserId || user.id;
        const result = await CreditService.addCredits(
          targetUserId,
          operationType || 'admin_adjustment',
          amount,
          metadata
        );
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Credits API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
