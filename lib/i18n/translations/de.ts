/**
 * German Translations
 */

import type { Translations } from './en';

export const de: Translations = {
  // Common
  common: {
    loading: 'Lädt...',
    error: 'Ein Fehler ist aufgetreten',
    success: 'Erfolg',
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    create: 'Erstellen',
    search: 'Suchen',
    filter: 'Filtern',
    back: 'Zurück',
    next: 'Weiter',
    previous: 'Zurück',
    submit: 'Absenden',
    confirm: 'Bestätigen',
    close: 'Schließen',
    yes: 'Ja',
    no: 'Nein',
    or: 'oder',
    and: 'und',
  },

  // Navigation
  nav: {
    home: 'Startseite',
    features: 'Funktionen',
    pricing: 'Preise',
    about: 'Über uns',
    blog: 'Blog',
    docs: 'Dokumentation',
    dashboard: 'Dashboard',
    settings: 'Einstellungen',
    login: 'Anmelden',
    register: 'Jetzt starten',
    logout: 'Abmelden',
  },

  // Landing Page
  landing: {
    badge: 'Produktionsbereit in Minuten',
    title: 'Erstelle dein SaaS',
    titleHighlight: 'schneller als je zuvor',
    subtitle: 'Ein produktionsbereites Boilerplate mit Authentifizierung, Zahlungen und Datenbank bereits konfiguriert. Konzentriere dich auf dein Produkt, nicht auf die Infrastruktur.',
    primaryCta: 'Jetzt starten',
    secondaryCta: 'Preise ansehen',
    features: {
      title: 'Alles, was du zum Starten brauchst',
      subtitle: 'Vorgefertigte Komponenten und Integrationen, um deine Entwicklung zu beschleunigen.',
      auth: {
        title: 'Authentifizierung',
        description: 'Sichere Authentifizierung mit Supabase. E-Mail/Passwort, Magic Links und OAuth-Provider sofort einsatzbereit.',
      },
      payments: {
        title: 'Zahlungen',
        description: 'Stripe-Integration für Abonnements und Einmalzahlungen. Webhooks, Kundenportal und Abrechnung bereit.',
      },
      database: {
        title: 'Datenbank',
        description: 'PostgreSQL mit Supabase. Row-Level Security, Echtzeit-Abonnements und typsichere Abfragen inklusive.',
      },
      storage: {
        title: 'Speicher',
        description: 'Datei-Uploads und Speicherung mit Supabase Storage. Sicher, skalierbar und einfach zu verwenden.',
      },
      security: {
        title: 'Sicherheit',
        description: 'Integrierte Best Practices für Sicherheit. CSRF-Schutz, Rate-Limiting und sichere Header.',
      },
      performance: {
        title: 'Leistung',
        description: 'Optimiert für Geschwindigkeit mit Next.js 15. Server Components, Streaming und Edge Functions.',
      },
    },
    testimonials: {
      title: 'Von Entwicklern geliebt',
      subtitle: 'Schließe dich Tausenden von Entwicklern an, die schneller ausliefern mit unserem Boilerplate.',
    },
    cta: {
      title: 'Bereit, schneller zu liefern?',
      subtitle: 'Starte heute mit dem Aufbau deines SaaS mit unserem produktionsbereiten Boilerplate.',
      primaryCta: 'Kostenlos starten',
      secondaryCta: 'Dokumentation ansehen',
    },
  },

  // Pricing
  pricing: {
    title: 'Einfache, transparente Preise',
    subtitle: 'Wähle den Plan, der zu dir passt. Jederzeit upgraden oder downgraden.',
    monthly: 'Monatlich',
    yearly: 'Jährlich',
    popular: 'Am beliebtesten',
    perMonth: '/Monat',
    perYear: '/Jahr',
    plans: {
      starter: {
        name: 'Starter',
        description: 'Perfekt für Nebenprojekte',
        cta: 'Jetzt starten',
      },
      pro: {
        name: 'Pro',
        description: 'Für wachsende Unternehmen',
        cta: 'Kostenlos testen',
      },
      enterprise: {
        name: 'Enterprise',
        description: 'Für große Operationen',
        cta: 'Vertrieb kontaktieren',
      },
    },
  },

  // Auth
  auth: {
    login: {
      title: 'Willkommen zurück',
      subtitle: 'Melde dich bei deinem Konto an',
      email: 'E-Mail',
      password: 'Passwort',
      submit: 'Anmelden',
      forgotPassword: 'Passwort vergessen?',
      noAccount: 'Noch kein Konto?',
      signUp: 'Registrieren',
    },
    register: {
      title: 'Konto erstellen',
      subtitle: 'Starte noch heute deine kostenlose Testversion',
      name: 'Vollständiger Name',
      email: 'E-Mail',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      submit: 'Konto erstellen',
      hasAccount: 'Bereits ein Konto?',
      signIn: 'Anmelden',
      terms: 'Mit der Erstellung eines Kontos stimmst du unseren',
      termsLink: 'Nutzungsbedingungen',
      privacyLink: 'Datenschutzrichtlinie',
    },
    resetPassword: {
      title: 'Passwort zurücksetzen',
      subtitle: 'Gib deine E-Mail ein, um einen Reset-Link zu erhalten',
      email: 'E-Mail',
      submit: 'Reset-Link senden',
      backToLogin: 'Zurück zur Anmeldung',
    },
  },

  // Dashboard
  dashboard: {
    welcome: 'Willkommen zurück',
    overview: 'Übersicht',
    credits: 'Credits',
    creditsRemaining: 'Credits verbleibend',
    subscription: 'Abonnement',
    usage: 'Nutzung',
    recentActivity: 'Letzte Aktivität',
  },

  // Admin
  admin: {
    title: 'Admin-Panel',
    dashboard: 'Dashboard',
    users: 'Benutzer',
    analytics: 'Analysen',
    subscriptions: 'Abonnements',
    settings: 'Einstellungen',
    security: 'Sicherheit',
    notifications: 'Benachrichtigungen',
  },

  // Onboarding
  onboarding: {
    welcome: {
      title: 'Willkommen bei SaaS Boilerplate',
      subtitle: 'Lass uns dich in wenigen Schritten einrichten.',
    },
    profile: {
      title: 'Vervollständige dein Profil',
      subtitle: 'Erzähl uns ein bisschen über dich.',
    },
    preferences: {
      title: 'Lege deine Präferenzen fest',
      subtitle: 'Passe dein Erlebnis an.',
    },
    complete: {
      title: 'Alles erledigt!',
      subtitle: 'Beginne mit der Erkundung des Dashboards.',
      cta: 'Zum Dashboard',
    },
    skip: 'Vorerst überspringen',
    continue: 'Weiter',
  },

  // Footer
  footer: {
    description: 'Erstelle dein SaaS schneller mit unserem produktionsbereiten Boilerplate.',
    product: 'Produkt',
    resources: 'Ressourcen',
    company: 'Unternehmen',
    legal: 'Rechtliches',
    copyright: '© {year} SaaS Boilerplate. Alle Rechte vorbehalten.',
  },

  // Errors
  errors: {
    notFound: 'Seite nicht gefunden',
    notFoundDescription: 'Die gesuchte Seite existiert nicht.',
    serverError: 'Serverfehler',
    serverErrorDescription: 'Auf unserer Seite ist etwas schief gelaufen.',
    backHome: 'Zurück zur Startseite',
  },
};

