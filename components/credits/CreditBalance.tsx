'use client';

import { useEffect, useState } from 'react';
import { Coins, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreditService, formatCredits } from '@/lib/services/credits';

interface CreditBalanceProps {
  userId?: string;
  initialCredits?: number;
  showWarning?: boolean;
  warningThreshold?: number;
  variant?: 'default' | 'compact' | 'large';
  className?: string;
}

export function CreditBalance({
  userId,
  initialCredits,
  showWarning = true,
  warningThreshold = 10,
  variant = 'default',
  className,
}: CreditBalanceProps) {
  const [credits, setCredits] = useState(initialCredits ?? 0);
  const [loading, setLoading] = useState(!initialCredits);

  useEffect(() => {
    if (userId && !initialCredits) {
      loadCredits();
    }
  }, [userId, initialCredits]);

  const loadCredits = async () => {
    if (!userId) return;
    setLoading(true);
    const balance = await CreditService.getUserCredits(userId);
    setCredits(balance);
    setLoading(false);
  };

  const display = formatCredits(credits, warningThreshold);

  if (loading) {
    return (
      <div className={cn('animate-pulse bg-muted rounded h-8 w-20', className)} />
    );
  }

  const variants = {
    default: 'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/10',
    compact: 'flex items-center gap-1.5 text-sm',
    large: 'flex items-center gap-3 px-4 py-2 rounded-xl bg-secondary/10 text-lg',
  };

  return (
    <div className={cn(variants[variant], className)}>
      <Coins className={cn(
        'text-primary',
        variant === 'compact' ? 'h-4 w-4' : 'h-5 w-5'
      )} />
      <span className="font-semibold">{display.displayText}</span>
      {showWarning && display.isLow && (
        <AlertTriangle className="h-4 w-4 text-amber-500" />
      )}
    </div>
  );
}

