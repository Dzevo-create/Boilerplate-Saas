'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/I18nProvider';

interface PricingPlan {
  nameKey: string;
  descriptionKey: string;
  price: string;
  periodKey?: string;
  featureKeys: string[];
  ctaKey: string;
  href: string;
  highlighted?: boolean;
  badgeKey?: string;
}

interface PricingSectionProps {
  className?: string;
}

const pricingPlans: PricingPlan[] = [
  {
    nameKey: 'pricing.plans.starter.name',
    descriptionKey: 'pricing.plans.starter.description',
    price: '$0',
    periodKey: 'pricing.perMonth',
    featureKeys: [
      '100 credits per month',
      'Basic support',
      'API access',
      'Community Discord',
    ],
    ctaKey: 'pricing.plans.starter.cta',
    href: '/register',
  },
  {
    nameKey: 'pricing.plans.pro.name',
    descriptionKey: 'pricing.plans.pro.description',
    price: '$29',
    periodKey: 'pricing.perMonth',
    featureKeys: [
      '1,000 credits per month',
      'Priority support',
      'Advanced API access',
      'Custom integrations',
      'Analytics dashboard',
    ],
    ctaKey: 'pricing.plans.pro.cta',
    href: '/register?plan=pro',
    highlighted: true,
    badgeKey: 'pricing.popular',
  },
  {
    nameKey: 'pricing.plans.enterprise.name',
    descriptionKey: 'pricing.plans.enterprise.description',
    price: '$99',
    periodKey: 'pricing.perMonth',
    featureKeys: [
      'Unlimited credits',
      '24/7 dedicated support',
      'Custom API limits',
      'SSO / SAML',
      'SLA guarantee',
      'Custom contracts',
    ],
    ctaKey: 'pricing.plans.enterprise.cta',
    href: '/contact',
  },
];

export function PricingSection({ className }: PricingSectionProps) {
  const { t } = useI18n();

  return (
    <section id="pricing" className={cn('border-t border-border py-24', className)}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <h2 className="mb-4 text-center text-3xl font-bold">{t('pricing.title')}</h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
          {t('pricing.subtitle')}
        </p>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface PricingCardProps {
  plan: PricingPlan;
  t: (key: string, params?: Record<string, string | number>) => string;
}

function PricingCard({ plan, t }: PricingCardProps) {
  const { nameKey, descriptionKey, price, periodKey, featureKeys, ctaKey, href, highlighted, badgeKey } = plan;

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-xl border p-6',
        highlighted
          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
          : 'border-border bg-card'
      )}
    >
      {/* Badge */}
      {badgeKey && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            {t(badgeKey)}
          </span>
        </div>
      )}

      {/* Plan Info */}
      <div className="mb-6">
        <h3 className="text-xl font-bold">{t(nameKey)}</h3>
        <p className="text-sm text-muted-foreground">{t(descriptionKey)}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        {periodKey && <span className="text-muted-foreground">{t(periodKey)}</span>}
      </div>

      {/* Features */}
      <ul className="mb-8 flex-1 space-y-3">
        {featureKeys.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link href={href}>
        <Button
          className="w-full"
          variant={highlighted ? 'default' : 'outline'}
        >
          {t(ctaKey)}
        </Button>
      </Link>
    </div>
  );
}

