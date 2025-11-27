/**
 * Onboarding Components
 * 
 * Multi-step onboarding flow for new users.
 * 
 * Usage:
 * ```tsx
 * import { OnboardingForm, OnboardingProgress, OnboardingStep } from '@/components/onboarding';
 * 
 * // Full onboarding form
 * <OnboardingForm onComplete={() => {}} redirectTo="/dashboard" />
 * 
 * // Or build custom steps
 * <OnboardingProgress currentStep={1} totalSteps={3} />
 * <OnboardingStep title="Welcome" onNext={() => {}}>
 *   <YourContent />
 * </OnboardingStep>
 * ```
 */

export { OnboardingForm } from './OnboardingForm';
export { OnboardingProgress } from './OnboardingProgress';
export { OnboardingStep } from './OnboardingStep';

