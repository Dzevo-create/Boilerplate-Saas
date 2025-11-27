'use client';

import { useState } from 'react';
import { Coins, History, ShoppingCart } from 'lucide-react';
import { CreditBalance, CreditHistory, CreditPurchase } from '@/components/credits';
import { cn } from '@/lib/utils';

type Tab = 'balance' | 'history' | 'purchase';

export default function CreditsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('balance');

  // Demo user ID (in production: get from auth)
  const demoUserId = 'demo-user-123';

  const tabs = [
    { id: 'balance' as Tab, label: 'Guthaben', icon: Coins },
    { id: 'history' as Tab, label: 'Verlauf', icon: History },
    { id: 'purchase' as Tab, label: 'Kaufen', icon: ShoppingCart },
  ];

  const handlePurchase = async (packageId: string) => {
    console.log('Purchase package:', packageId);
    // In production: Redirect to Stripe checkout
    alert(`Demo: Würde Paket "${packageId}" kaufen`);
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Credits</h1>
        <p className="text-muted-foreground">
          Verwalte dein Credit-Guthaben für KI-Funktionen
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-card rounded-xl border p-6">
        {activeTab === 'balance' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <CreditBalance
                initialCredits={100}
                variant="large"
                className="justify-center"
              />
              <p className="text-muted-foreground mt-4">
                Dein aktuelles Guthaben
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <UsageCard
                title="Chat-Nachrichten"
                cost={1}
                description="Pro Nachricht"
              />
              <UsageCard
                title="Bildgenerierung"
                cost={15}
                description="Pro Bild"
              />
              <UsageCard
                title="Videogenerierung"
                cost={50}
                description="Pro Video"
              />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <CreditHistory userId={demoUserId} limit={20} />
        )}

        {activeTab === 'purchase' && (
          <CreditPurchase onPurchase={handlePurchase} />
        )}
      </div>
    </div>
  );
}

interface UsageCardProps {
  title: string;
  cost: number;
  description: string;
}

function UsageCard({ title, cost, description }: UsageCardProps) {
  return (
    <div className="p-4 rounded-lg bg-muted/50 text-center">
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-primary">{cost} Credits</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

