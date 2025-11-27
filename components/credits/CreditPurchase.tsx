'use client';

import { useState } from 'react';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonus?: number;
  popular?: boolean;
  icon: React.ReactNode;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 100,
    price: 9.99,
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    id: 'popular',
    name: 'Popular',
    credits: 500,
    price: 39.99,
    bonus: 50,
    popular: true,
    icon: <Zap className="h-5 w-5" />,
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 1500,
    price: 99.99,
    bonus: 200,
    icon: <Crown className="h-5 w-5" />,
  },
];

interface CreditPurchaseProps {
  onPurchase?: (packageId: string) => Promise<void>;
  className?: string;
}

export function CreditPurchase({ onPurchase, className }: CreditPurchaseProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!selected || !onPurchase) return;
    setLoading(true);
    try {
      await onPurchase(selected);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid gap-4 md:grid-cols-3">
        {CREDIT_PACKAGES.map((pkg) => (
          <CreditPackageCard
            key={pkg.id}
            package={pkg}
            selected={selected === pkg.id}
            onSelect={() => setSelected(pkg.id)}
          />
        ))}
      </div>
      
      {selected && (
        <Button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? 'Verarbeite...' : 'Jetzt kaufen'}
        </Button>
      )}
    </div>
  );
}

interface CreditPackageCardProps {
  package: CreditPackage;
  selected: boolean;
  onSelect: () => void;
}

function CreditPackageCard({
  package: pkg,
  selected,
  onSelect,
}: CreditPackageCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative p-6 rounded-xl border-2 text-left transition-all',
        'hover:border-primary/50 hover:shadow-md',
        selected
          ? 'border-primary bg-primary/5 shadow-md'
          : 'border-border bg-card',
        pkg.popular && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {pkg.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
          Beliebt
        </span>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          'p-2 rounded-lg',
          selected ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}>
          {pkg.icon}
        </div>
        {selected && (
          <div className="p-1 rounded-full bg-primary text-primary-foreground">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>

      <h3 className="font-semibold text-lg mb-1">{pkg.name}</h3>
      <p className="text-3xl font-bold mb-2">
        {pkg.credits.toLocaleString()}
        <span className="text-sm font-normal text-muted-foreground ml-1">Credits</span>
      </p>
      
      {pkg.bonus && (
        <p className="text-sm text-green-500 font-medium mb-2">
          +{pkg.bonus} Bonus Credits
        </p>
      )}
      
      <p className="text-xl font-semibold text-primary">
        €{pkg.price.toFixed(2)}
      </p>
      <p className="text-xs text-muted-foreground">
        €{(pkg.price / (pkg.credits + (pkg.bonus || 0))).toFixed(3)} / Credit
      </p>
    </button>
  );
}

