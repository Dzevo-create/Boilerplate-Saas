'use client';

import { LucideIcon, Shield, Sparkles, Zap, Database, Lock, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/I18nProvider';

interface Feature {
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
}

interface FeaturesProps {
  columns?: 2 | 3 | 4;
  className?: string;
}

const featuresList: Feature[] = [
  { icon: Shield, titleKey: 'landing.features.auth.title', descriptionKey: 'landing.features.auth.description' },
  { icon: Sparkles, titleKey: 'landing.features.payments.title', descriptionKey: 'landing.features.payments.description' },
  { icon: Zap, titleKey: 'landing.features.database.title', descriptionKey: 'landing.features.database.description' },
  { icon: Database, titleKey: 'landing.features.storage.title', descriptionKey: 'landing.features.storage.description' },
  { icon: Lock, titleKey: 'landing.features.security.title', descriptionKey: 'landing.features.security.description' },
  { icon: Gauge, titleKey: 'landing.features.performance.title', descriptionKey: 'landing.features.performance.description' },
];

export function Features({ columns = 3, className }: FeaturesProps) {
  const { t } = useI18n();
  
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <section id="features" className={cn('border-t border-border bg-secondary/20 py-24', className)}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <h2 className="mb-4 text-center text-3xl font-bold">
          {t('landing.features.title')}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
          {t('landing.features.subtitle')}
        </p>

        {/* Features Grid */}
        <div className={cn('grid gap-8', gridCols[columns])}>
          {featuresList.map((feature, index) => (
            <FeatureCard 
              key={index} 
              icon={feature.icon}
              title={t(feature.titleKey)}
              description={t(feature.descriptionKey)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
      <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

