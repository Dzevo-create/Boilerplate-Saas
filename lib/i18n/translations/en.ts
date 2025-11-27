/**
 * English Translations
 */

export const en = {
  // Common
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    filter: 'Filter',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    confirm: 'Confirm',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    or: 'or',
    and: 'and',
  },

  // Navigation
  nav: {
    home: 'Home',
    features: 'Features',
    pricing: 'Pricing',
    about: 'About',
    blog: 'Blog',
    docs: 'Documentation',
    dashboard: 'Dashboard',
    settings: 'Settings',
    login: 'Login',
    register: 'Get Started',
    logout: 'Logout',
  },

  // Landing Page
  landing: {
    badge: 'Production-ready in minutes',
    title: 'Build your SaaS',
    titleHighlight: 'faster than ever',
    subtitle: 'A production-ready boilerplate with authentication, payments, and database already configured. Focus on your product, not the infrastructure.',
    primaryCta: 'Start Building',
    secondaryCta: 'View Pricing',
    features: {
      title: 'Everything you need to launch',
      subtitle: 'Pre-built components and integrations to accelerate your development.',
      auth: {
        title: 'Authentication',
        description: 'Secure authentication with Supabase. Email/password, magic links, and OAuth providers ready to use.',
      },
      payments: {
        title: 'Payments',
        description: 'Stripe integration for subscriptions and one-time payments. Webhooks, customer portal, and billing ready.',
      },
      database: {
        title: 'Database',
        description: 'PostgreSQL with Supabase. Row-level security, real-time subscriptions, and type-safe queries included.',
      },
      storage: {
        title: 'Storage',
        description: 'File uploads and storage with Supabase Storage. Secure, scalable, and easy to use.',
      },
      security: {
        title: 'Security',
        description: 'Built-in security best practices. CSRF protection, rate limiting, and secure headers.',
      },
      performance: {
        title: 'Performance',
        description: 'Optimized for speed with Next.js 15. Server components, streaming, and edge functions.',
      },
    },
    testimonials: {
      title: 'Loved by developers',
      subtitle: 'Join thousands of developers who ship faster with our boilerplate.',
    },
    cta: {
      title: 'Ready to ship faster?',
      subtitle: 'Start building your SaaS today with our production-ready boilerplate.',
      primaryCta: 'Get Started Free',
      secondaryCta: 'View Documentation',
    },
  },

  // Pricing
  pricing: {
    title: 'Simple, transparent pricing',
    subtitle: 'Choose the plan that fits your needs. Upgrade or downgrade anytime.',
    monthly: 'Monthly',
    yearly: 'Yearly',
    popular: 'Most Popular',
    perMonth: '/month',
    perYear: '/year',
    plans: {
      starter: {
        name: 'Starter',
        description: 'Perfect for side projects',
        cta: 'Get Started',
      },
      pro: {
        name: 'Pro',
        description: 'For growing businesses',
        cta: 'Start Free Trial',
      },
      enterprise: {
        name: 'Enterprise',
        description: 'For large scale operations',
        cta: 'Contact Sales',
      },
    },
  },

  // Auth
  auth: {
    login: {
      title: 'Welcome back',
      subtitle: 'Sign in to your account',
      email: 'Email',
      password: 'Password',
      submit: 'Sign In',
      forgotPassword: 'Forgot password?',
      noAccount: "Don't have an account?",
      signUp: 'Sign up',
    },
    register: {
      title: 'Create an account',
      subtitle: 'Start your free trial today',
      name: 'Full name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      submit: 'Create Account',
      hasAccount: 'Already have an account?',
      signIn: 'Sign in',
      terms: 'By creating an account, you agree to our',
      termsLink: 'Terms of Service',
      privacyLink: 'Privacy Policy',
    },
    resetPassword: {
      title: 'Reset your password',
      subtitle: 'Enter your email to receive a reset link',
      email: 'Email',
      submit: 'Send Reset Link',
      backToLogin: 'Back to login',
    },
  },

  // Dashboard
  dashboard: {
    welcome: 'Welcome back',
    overview: 'Overview',
    credits: 'Credits',
    creditsRemaining: 'credits remaining',
    subscription: 'Subscription',
    usage: 'Usage',
    recentActivity: 'Recent Activity',
  },

  // Admin
  admin: {
    title: 'Admin Panel',
    dashboard: 'Dashboard',
    users: 'Users',
    analytics: 'Analytics',
    subscriptions: 'Subscriptions',
    settings: 'Settings',
    security: 'Security',
    notifications: 'Notifications',
  },

  // Onboarding
  onboarding: {
    welcome: {
      title: 'Welcome to SaaS Boilerplate',
      subtitle: "Let's get you set up in just a few steps.",
    },
    profile: {
      title: 'Complete your profile',
      subtitle: 'Tell us a bit about yourself.',
    },
    preferences: {
      title: 'Set your preferences',
      subtitle: 'Customize your experience.',
    },
    complete: {
      title: "You're all set!",
      subtitle: 'Start exploring the dashboard.',
      cta: 'Go to Dashboard',
    },
    skip: 'Skip for now',
    continue: 'Continue',
  },

  // Footer
  footer: {
    description: 'Build your SaaS faster with our production-ready boilerplate.',
    product: 'Product',
    resources: 'Resources',
    company: 'Company',
    legal: 'Legal',
    copyright: '© {year} SaaS Boilerplate. All rights reserved.',
  },

  // Errors
  errors: {
    notFound: 'Page not found',
    notFoundDescription: 'The page you are looking for does not exist.',
    serverError: 'Server error',
    serverErrorDescription: 'Something went wrong on our end.',
    backHome: 'Back to home',
  },
};

export type Translations = typeof en;

