'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OnboardingStepProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  backLabel?: string;
  skipLabel?: string;
  showBack?: boolean;
  showSkip?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function OnboardingStep({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  onSkip,
  nextLabel = 'Continue',
  backLabel = 'Back',
  skipLabel = 'Skip for now',
  showBack = true,
  showSkip = false,
  isLoading = false,
  className,
}: OnboardingStepProps) {
  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle && (
          <p className="mt-2 text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Content */}
      <div className="mb-8">{children}</div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {onNext && (
          <Button
            onClick={onNext}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Loading...' : nextLabel}
          </Button>
        )}

        <div className="flex gap-3">
          {showBack && onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
              className="flex-1"
            >
              {backLabel}
            </Button>
          )}
          {showSkip && onSkip && (
            <Button
              variant="ghost"
              onClick={onSkip}
              disabled={isLoading}
              className="flex-1"
            >
              {skipLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

