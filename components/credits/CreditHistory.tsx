'use client';

import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CreditService,
  CreditTransaction,
  getOperationLabel,
  formatTransactionAmount,
} from '@/lib/services/credits';

interface CreditHistoryProps {
  userId: string;
  limit?: number;
  className?: string;
}

export function CreditHistory({ userId, limit = 20, className }: CreditHistoryProps) {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [userId, limit]);

  const loadHistory = async () => {
    setLoading(true);
    const history = await CreditService.getTransactionHistory(userId, limit);
    setTransactions(history);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-muted rounded-lg h-16" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Keine Transaktionen vorhanden</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {transactions.map((tx) => (
        <TransactionItem key={tx.id} transaction={tx} />
      ))}
    </div>
  );
}

interface TransactionItemProps {
  transaction: CreditTransaction;
}

function TransactionItem({ transaction }: TransactionItemProps) {
  const isCredit = transaction.amount > 0;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-card border">
      <div className="flex items-center gap-3">
        <div className={cn(
          'p-2 rounded-full',
          isCredit ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
        )}>
          {isCredit ? (
            <ArrowDownLeft className="h-4 w-4" />
          ) : (
            <ArrowUpRight className="h-4 w-4" />
          )}
        </div>
        <div>
          <p className="font-medium">{getOperationLabel(transaction.operationType)}</p>
          <p className="text-sm text-muted-foreground">
            {transaction.createdAt.toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn(
          'font-semibold',
          isCredit ? 'text-green-500' : 'text-red-500'
        )}>
          {formatTransactionAmount(transaction.amount)}
        </p>
        <p className="text-sm text-muted-foreground">
          Saldo: {transaction.balanceAfter}
        </p>
      </div>
    </div>
  );
}

