# Architecture Rules & Best Practices

## 🏗️ Core Principles

This boilerplate follows strict architectural guidelines to ensure maintainability, scalability, and code quality.

---

## 📏 File Size Limits

**Maximum 300 lines per file.** If a file exceeds this limit:
1. Extract logic into separate utility functions
2. Split components into smaller sub-components
3. Move constants/types to dedicated files

---

## 📁 Folder Structure

```
saas-boilerplate/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Auth-related pages (grouped)
│   ├── (marketing)/         # Marketing pages (landing, pricing)
│   ├── admin/               # Admin dashboard pages
│   ├── api/                 # API routes
│   └── globals.css          # Global styles
│
├── components/              # React components
│   ├── admin/              # Admin-specific components
│   ├── auth/               # Authentication components
│   ├── common/             # Shared/common components
│   ├── i18n/               # Internationalization components
│   ├── landing/            # Landing page components
│   ├── onboarding/         # Onboarding flow components
│   ├── theme/              # Theme/dark mode components
│   └── ui/                 # Base UI components (shadcn)
│
├── lib/                     # Utilities and services
│   ├── config/             # Configuration files
│   ├── hooks/              # Custom React hooks
│   ├── i18n/               # Internationalization logic
│   ├── services/           # Business logic services
│   ├── supabase/           # Supabase client setup
│   └── utils.ts            # Utility functions
│
├── types/                   # TypeScript type definitions
└── database/               # Database schema and migrations
```

---

## 🧩 Component Architecture

### Component Rules

1. **One component per file** - Each file exports one main component
2. **Colocate related files** - Keep styles, tests, and types near components
3. **Props interfaces** - Always define TypeScript interfaces for props
4. **Default exports** - Use named exports for components

### Component Template

```tsx
/**
 * ComponentName
 * 
 * Brief description of what this component does.
 */

'use client'; // Only if needed

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  /** Prop description */
  propName: string;
  /** Optional prop with default */
  optionalProp?: boolean;
  className?: string;
}

export function ComponentName({
  propName,
  optionalProp = false,
  className,
}: ComponentNameProps) {
  // Component logic here
  
  return (
    <div className={cn('base-styles', className)}>
      {/* JSX */}
    </div>
  );
}
```

---

## 🎨 Styling Rules

1. **Tailwind CSS** - Use Tailwind for all styling
2. **CSS Variables** - Use CSS variables for theming (light/dark)
3. **cn() utility** - Always use `cn()` for conditional classes
4. **No inline styles** - Avoid inline styles, use Tailwind classes

### Theme Variables

```css
/* Light mode */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... */
}

/* Dark mode */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

---

## 🌍 Internationalization (i18n)

### Adding Translations

1. Add keys to `lib/i18n/translations/en.ts`
2. Add corresponding translations to `lib/i18n/translations/de.ts`
3. Use the `useTranslations()` hook in components

```tsx
import { useTranslations } from '@/lib/i18n';

function MyComponent() {
  const t = useTranslations();
  return <h1>{t('landing.title')}</h1>;
}
```

### Adding New Languages

1. Create new translation file: `lib/i18n/translations/[lang].ts`
2. Add locale to `lib/i18n/config.ts`
3. Import and add to translations object in `I18nProvider.tsx`

---

## 🔐 Authentication Flow

1. **AuthProvider** wraps the entire app
2. **useAuth()** hook provides user state and auth methods
3. **Middleware** protects routes based on auth status
4. **Supabase** handles session management

---

## 💳 Payment Integration

### Stripe Flow

1. User selects plan → `POST /api/checkout`
2. Stripe redirects to checkout
3. On success → Webhook updates database
4. Credits/subscription updated atomically

### Webhook Handling

- All webhook handlers include idempotency checks
- Credit operations are atomic (database transactions)
- Logging for debugging and audit trails

---

## 📝 Code Quality

### TypeScript

- **Strict mode** enabled
- **No `any` types** - Use proper typing
- **Interfaces over types** for objects
- **Enums** for fixed value sets

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Utils | camelCase | `formatDate.ts` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE` |
| Types/Interfaces | PascalCase | `UserProfile` |

### File Naming

- Components: `ComponentName.tsx`
- Hooks: `useHookName.ts`
- Utils: `utilName.ts`
- Types: `typeName.types.ts`
- Tests: `ComponentName.test.tsx`

---

## ✅ Checklist Before Commit

- [ ] No linter errors
- [ ] No TypeScript errors
- [ ] File under 300 lines
- [ ] Components have proper props interface
- [ ] Translations added for new strings
- [ ] Dark mode works correctly
- [ ] Mobile responsive
- [ ] Accessibility considered

---

## 🚀 Quick Reference

### Import Order

```tsx
// 1. React/Next imports
import { useState } from 'react';
import Link from 'next/link';

// 2. Third-party imports
import { motion } from 'framer-motion';

// 3. Internal imports (absolute)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks';
import { cn } from '@/lib/utils';

// 4. Types
import type { User } from '@/types';

// 5. Styles (if any)
import './styles.css';
```

### Environment Variables

- `NEXT_PUBLIC_*` - Exposed to client
- All others - Server-only
- Validate in `lib/env.ts`

