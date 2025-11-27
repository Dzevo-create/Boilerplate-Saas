/**
 * Environment Variables Configuration
 * 
 * Type-safe environment variable access with validation.
 * Throws clear errors if required variables are missing.
 */

function getEnvVar(key: string, required = true): string {
  const value = process.env[key];
  
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value || '';
}

function getPublicEnvVar(key: string, required = true): string {
  const value = process.env[key];
  
  if (required && !value) {
    // Only throw in development to avoid build failures
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Missing environment variable: ${key}`);
    }
    return '';
  }
  
  return value || '';
}

/**
 * Application Environment Configuration
 */
export const env = {
  // App
  NEXT_PUBLIC_APP_NAME: getPublicEnvVar('NEXT_PUBLIC_APP_NAME', false) || 'SaaS App',
  NEXT_PUBLIC_APP_URL: getPublicEnvVar('NEXT_PUBLIC_APP_URL', false) || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: getPublicEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: getPublicEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: getEnvVar('SUPABASE_SERVICE_ROLE_KEY', false),
  
  // Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: getPublicEnvVar('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
  STRIPE_SECRET_KEY: getEnvVar('STRIPE_SECRET_KEY', false),
  STRIPE_WEBHOOK_SECRET: getEnvVar('STRIPE_WEBHOOK_SECRET', false),
  
  // Stripe Price IDs
  STRIPE_PRICE_ID_STARTER: getEnvVar('STRIPE_PRICE_ID_STARTER', false),
  STRIPE_PRICE_ID_PRO: getEnvVar('STRIPE_PRICE_ID_PRO', false),
  STRIPE_PRICE_ID_BUSINESS: getEnvVar('STRIPE_PRICE_ID_BUSINESS', false),
} as const;

/**
 * Validate all required environment variables at startup
 */
export function validateEnv(): void {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing required environment variables');
    }
  }
}

export type Env = typeof env;

