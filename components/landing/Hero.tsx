'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/I18nProvider';

interface HeroProps {
  badgeIcon?: React.ReactNode;
  className?: string;
}

export function Hero({
  badgeIcon = <Sparkles className="h-4 w-4 text-primary" />,
  className,
}: HeroProps) {
  const { t } = useI18n();

  return (
    <section className={cn('container mx-auto px-4 py-24 text-center', className)}>
      {/* Badge */}
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm">
        {badgeIcon}
        <span>{t('landing.badge')}</span>
      </div>

      {/* Headline */}
      <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
        {t('landing.title')}
        <span className="block text-primary">{t('landing.titleHighlight')}</span>
      </h1>

      {/* Subheadline */}
      <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
        {t('landing.subtitle')}
      </p>

      {/* CTA Buttons */}
      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link href="/register">
          <Button size="lg" className="gap-2">
            {t('landing.primaryCta')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/pricing">
          <Button size="lg" variant="outline">
            {t('landing.secondaryCta')}
          </Button>
        </Link>
      </div>
    </section>
  );
}

