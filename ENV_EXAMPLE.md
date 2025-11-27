# Environment Variables Setup

Copy this content to a `.env.local` file in your project root.

```bash
# ===========================================
# SaaS Boilerplate Environment Variables
# ===========================================

# App
NEXT_PUBLIC_APP_NAME="My SaaS App"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ===========================================
# Supabase Configuration
# ===========================================
# Get these from: https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# ===========================================
# Stripe Configuration
# ===========================================
# Get these from: https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Stripe Webhook Secret
# Get from: https://dashboard.stripe.com/webhooks (after creating endpoint)
# For local testing: stripe listen --forward-to localhost:3000/api/webhooks/stripe
STRIPE_WEBHOOK_SECRET="whsec_..."

# ===========================================
# Stripe Price IDs (from your Stripe Dashboard)
# ===========================================
# Create products and prices at: https://dashboard.stripe.com/products
STRIPE_PRICE_ID_STARTER="price_..."
STRIPE_PRICE_ID_PRO="price_..."
STRIPE_PRICE_ID_BUSINESS="price_..."

# ===========================================
# AI Provider Configuration
# ===========================================
# OpenAI - https://platform.openai.com/api-keys
OPENAI_API_KEY="sk-..."

# Anthropic (optional) - https://console.anthropic.com/
# ANTHROPIC_API_KEY="sk-ant-..."

# Google AI (optional) - https://aistudio.google.com/apikey
# GOOGLE_API_KEY="AIza..."

# ===========================================
# Optional: Analytics & Monitoring
# ===========================================
# NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..."
# SENTRY_DSN="..."

# ===========================================
# Optional: Email (for custom email sending)
# ===========================================
# RESEND_API_KEY="re_..."
```

## Getting Your Keys

### Supabase
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Go to Settings > API
4. Copy the URL and anon key

### Stripe
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get API keys from Developers > API keys
3. Create products at Products > Add product
4. Copy the price IDs

### Local Webhook Testing
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

