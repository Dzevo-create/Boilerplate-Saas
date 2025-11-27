/**
 * Landing Page
 * 
 * Main entry point using modular landing components.
 * Customize each section via props or replace with your own components.
 */

import { Header, Hero, Features, Testimonials, PricingSection, CTA, Footer } from '@/components/landing';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header 
        showThemeToggle={true}
        showLanguageSwitcher={true}
      />
      
      <main className="flex-1">
        <Hero
          badge="Production-ready in minutes"
          title="Build your SaaS"
          titleHighlight="faster than ever"
          subtitle="A production-ready boilerplate with authentication, payments, and database already configured. Focus on your product, not the infrastructure."
          primaryCta={{ label: 'Start Building', href: '/register' }}
          secondaryCta={{ label: 'View Pricing', href: '/pricing' }}
        />

        <Features
          title="Everything you need to launch"
          subtitle="Pre-built components and integrations to accelerate your development."
        />

        <Testimonials
          title="Loved by developers"
          subtitle="Join thousands of developers who ship faster with our boilerplate."
        />

        <PricingSection
          title="Simple, transparent pricing"
          subtitle="Choose the plan that fits your needs. Upgrade or downgrade anytime."
        />

        <CTA
          title="Ready to ship faster?"
          subtitle="Start building your SaaS today with our production-ready boilerplate."
          primaryCta={{ label: 'Get Started Free', href: '/register' }}
          secondaryCta={{ label: 'View Documentation', href: '/docs' }}
        />
      </main>

      <Footer />
    </div>
  );
}
