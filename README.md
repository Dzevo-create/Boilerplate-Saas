# 🚀 SaaS Boilerplate

A production-ready SaaS boilerplate with Next.js 15, Supabase, and Stripe. Built for rapid development with modular architecture.

## ✨ Features

### 🔐 Authentication
- Email/password authentication
- Magic links & OAuth providers
- Password reset flow
- Session management with Supabase

### 💳 Payments
- Stripe integration for subscriptions
- One-time payments support
- Webhook handling with idempotency
- Customer portal
- Credit system with atomic transactions

### 🗄️ Database
- PostgreSQL with Supabase
- Row-level security (RLS)
- Type-safe queries
- Migration support

### 🎨 UI/UX
- Modern, responsive design
- Dark/Light mode toggle
- shadcn/ui components
- Tailwind CSS styling
- Animations & transitions

### 🌍 Internationalization
- Multi-language support (EN/DE)
- Language switcher component
- Easy to add new languages
- Browser language detection

### 📱 Landing Page Components
- Modular, reusable sections
- Header with navigation
- Hero section
- Features grid
- Testimonials
- Pricing cards
- CTA sections
- Footer with links

### 👨‍💼 Admin Dashboard
- Full admin panel
- User management
- Analytics overview
- Subscription management
- Settings configuration
- Collapsible sidebar

### 🎯 Onboarding
- Multi-step onboarding flow
- Progress indicator
- Skippable steps
- Form validation

### 💰 Credits System
- Atomic credit transactions
- Transaction history
- Refund support
- Multiple operation types
- Configurable pricing
- Low balance warnings

### 🤖 AI Chat System
- Multi-provider support (OpenAI, Anthropic, Google)
- Streaming responses
- Conversation management
- Message attachments
- Pin/delete conversations
- Credit-based usage

---

## 🏗️ Architecture

### Rules
- **Max 300 lines per file** - Keep code modular
- **One component per file** - Single responsibility
- **TypeScript strict mode** - Type safety
- **No linter errors** - Clean code

### Folder Structure
```
saas-boilerplate/
├── app/                    # Next.js pages
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   └── ...
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── auth/             # Auth components
│   ├── chat/             # AI Chat UI
│   ├── credits/          # Credits UI
│   ├── i18n/             # Language switcher
│   ├── landing/          # Landing page
│   ├── onboarding/       # Onboarding flow
│   ├── theme/            # Theme toggle
│   └── ui/               # Base UI (shadcn)
├── lib/                   # Utilities
│   ├── i18n/             # Translations
│   ├── services/         # Business logic
│   └── supabase/         # Database client
└── types/                 # TypeScript types
```

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repo>
cd saas-boilerplate
npm install
```

### 2. Environment Setup
Copy `env.template` to `.env.local` and fill in:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# AI Providers
OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
# GOOGLE_API_KEY=AIza...
```

### 3. Database Setup
Run the SQL in `database/schema.sql` in your Supabase dashboard.

### 4. Start Development
```bash
npm run dev
```

---

## 📦 Components

### Landing Page
```tsx
import { Header, Hero, Features, Footer } from '@/components/landing';

<Header showThemeToggle showLanguageSwitcher />
<Hero title="Your Title" titleHighlight="Highlight" />
<Features columns={3} />
<Footer />
```

### Admin Dashboard
```tsx
import { AdminSidebar, AdminHeader, StatsCard, DataTable } from '@/components/admin';

<AdminSidebar />
<AdminHeader title="Dashboard" />
<StatsCard title="Users" value="1,234" />
<DataTable data={users} columns={columns} />
```

### Theme Toggle
```tsx
import { ThemeToggle } from '@/components/theme';

<ThemeToggle variant="icon" />   // Icon button
<ThemeToggle variant="switch" /> // Toggle switch
<ThemeToggle variant="dropdown" /> // Dropdown menu
```

### Language Switcher
```tsx
import { LanguageSwitcher } from '@/components/i18n';

<LanguageSwitcher variant="dropdown" />
<LanguageSwitcher variant="buttons" />
<LanguageSwitcher variant="icon" />
```

### Onboarding
```tsx
import { OnboardingForm } from '@/components/onboarding';

<OnboardingForm onComplete={() => {}} redirectTo="/dashboard" />
```

### Credits System
```tsx
import { CreditBalance, CreditHistory, CreditPurchase } from '@/components/credits';
import { CreditService } from '@/lib/services/credits';

// Display balance
<CreditBalance userId={userId} variant="large" />

// Show history
<CreditHistory userId={userId} limit={20} />

// Purchase credits
<CreditPurchase onPurchase={handlePurchase} />

// Service usage
const check = await CreditService.checkCredits(userId, 'ai_chat');
const result = await CreditService.deductCredits(userId, 'ai_chat');
```

### AI Chat System
```tsx
import { ChatInterface, ChatMessage, ChatInput } from '@/components/chat';
import { AIService } from '@/lib/services/ai';

// Full chat interface
<ChatInterface
  conversations={conversations}
  messages={messages}
  onSendMessage={handleSend}
/>

// AI completion
const ai = new AIService('openai', apiKey);
const response = await ai.createCompletion({ messages });

// Streaming
for await (const chunk of ai.createStreamingCompletion({ messages })) {
  console.log(chunk.content);
}
```

---

## 🌍 Adding Languages

1. Create translation file:
```typescript
// lib/i18n/translations/fr.ts
export const fr = {
  common: { loading: 'Chargement...' },
  // ...
};
```

2. Add to config:
```typescript
// lib/i18n/config.ts
export const locales = ['en', 'de', 'fr'] as const;
```

3. Import in provider:
```typescript
// lib/i18n/I18nProvider.tsx
import { fr } from './translations';
const translations = { en, de, fr };
```

---

## 🎨 Theming

### CSS Variables
Edit `app/globals.css` to customize colors:
```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --background: 0 0% 100%;
  /* ... */
}

.dark {
  --primary: 217.2 91.2% 59.8%;
  --background: 222.2 84% 4.9%;
  /* ... */
}
```

---

## 📄 License

MIT License - Use freely for personal and commercial projects.

---

## 🤝 Contributing

1. Follow the architecture rules in `ARCHITECTURE.md`
2. Ensure no linter errors
3. Test dark/light mode
4. Add translations for new text
5. Keep files under 300 lines
