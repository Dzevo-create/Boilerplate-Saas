'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingStep } from './OnboardingStep';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, User, Settings, Check } from 'lucide-react';

interface OnboardingFormProps {
  onComplete?: () => void;
  redirectTo?: string;
}

export function OnboardingForm({
  onComplete,
  redirectTo = '/dashboard',
}: OnboardingFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    role: '',
    useCase: '',
  });

  const totalSteps = 4;
  const stepLabels = ['Welcome', 'Profile', 'Preferences', 'Complete'];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Here you would save the onboarding data to your database
      // await saveOnboardingData(formData);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      onComplete?.();
      router.push(redirectTo);
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push(redirectTo);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-12">
          <OnboardingProgress
            currentStep={currentStep}
            totalSteps={totalSteps}
            labels={stepLabels}
          />
        </div>

        {/* Steps */}
        {currentStep === 1 && (
          <OnboardingStep
            title="Welcome to SaaS Boilerplate"
            subtitle="Let's get you set up in just a few steps."
            onNext={handleNext}
            showBack={false}
            showSkip
            onSkip={handleSkip}
            skipLabel="Skip onboarding"
          >
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <p className="text-center text-muted-foreground">
                We&apos;re excited to have you! This quick setup will help us 
                personalize your experience and get you started faster.
              </p>
            </div>
          </OnboardingStep>
        )}

        {currentStep === 2 && (
          <OnboardingStep
            title="Complete your profile"
            subtitle="Tell us a bit about yourself."
            onNext={handleNext}
            onBack={handleBack}
            showSkip
            onSkip={handleNext}
          >
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company (optional)</Label>
                <Input
                  id="company"
                  placeholder="Acme Inc."
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Your Role</Label>
                <select
                  id="role"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="">Select your role</option>
                  <option value="developer">Developer</option>
                  <option value="designer">Designer</option>
                  <option value="product">Product Manager</option>
                  <option value="founder">Founder / CEO</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </OnboardingStep>
        )}

        {currentStep === 3 && (
          <OnboardingStep
            title="Set your preferences"
            subtitle="Customize your experience."
            onNext={handleNext}
            onBack={handleBack}
            showSkip
            onSkip={handleNext}
          >
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Settings className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="useCase">What will you use this for?</Label>
                <select
                  id="useCase"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={formData.useCase}
                  onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                >
                  <option value="">Select use case</option>
                  <option value="saas">Building a SaaS</option>
                  <option value="marketplace">Marketplace</option>
                  <option value="ai">AI Application</option>
                  <option value="internal">Internal Tool</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="rounded-lg border border-border p-4">
                <h4 className="font-medium mb-2">Quick Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Check out the dashboard to see your credits</li>
                  <li>• Visit the pricing page to upgrade your plan</li>
                  <li>• Read the docs for implementation guides</li>
                </ul>
              </div>
            </div>
          </OnboardingStep>
        )}

        {currentStep === 4 && (
          <OnboardingStep
            title="You're all set!"
            subtitle="Start exploring the dashboard."
            onNext={handleComplete}
            onBack={handleBack}
            nextLabel="Go to Dashboard"
            isLoading={isLoading}
          >
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
                <Check className="h-10 w-10 text-green-500" />
              </div>
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Your account is ready to use. You can now access all features
                  and start building your project.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {formData.fullName && (
                    <span className="rounded-full bg-secondary px-3 py-1 text-sm">
                      {formData.fullName}
                    </span>
                  )}
                  {formData.company && (
                    <span className="rounded-full bg-secondary px-3 py-1 text-sm">
                      {formData.company}
                    </span>
                  )}
                  {formData.role && (
                    <span className="rounded-full bg-secondary px-3 py-1 text-sm">
                      {formData.role}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </OnboardingStep>
        )}
      </div>
    </div>
  );
}

