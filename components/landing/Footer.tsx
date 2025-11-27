'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/I18nProvider';

interface FooterLink {
  labelKey: string;
  href: string;
}

interface FooterColumn {
  titleKey: string;
  links: FooterLink[];
}

interface FooterProps {
  logo?: React.ReactNode;
  className?: string;
}

const footerColumns: FooterColumn[] = [
  {
    titleKey: 'footer.product',
    links: [
      { labelKey: 'nav.features', href: '#features' },
      { labelKey: 'nav.pricing', href: '/pricing' },
      { labelKey: 'Changelog', href: '/changelog' },
      { labelKey: 'Roadmap', href: '/roadmap' },
    ],
  },
  {
    titleKey: 'footer.resources',
    links: [
      { labelKey: 'nav.docs', href: '/docs' },
      { labelKey: 'API Reference', href: '/docs/api' },
      { labelKey: 'Guides', href: '/guides' },
      { labelKey: 'nav.blog', href: '/blog' },
    ],
  },
  {
    titleKey: 'footer.company',
    links: [
      { labelKey: 'nav.about', href: '/about' },
      { labelKey: 'Contact', href: '/contact' },
      { labelKey: 'Careers', href: '/careers' },
      { labelKey: 'Press', href: '/press' },
    ],
  },
  {
    titleKey: 'footer.legal',
    links: [
      { labelKey: 'Privacy Policy', href: '/privacy' },
      { labelKey: 'Terms of Service', href: '/terms' },
      { labelKey: 'Cookie Policy', href: '/cookies' },
      { labelKey: 'GDPR', href: '/gdpr' },
    ],
  },
];

const socialLinks = [
  { label: 'Twitter', href: 'https://twitter.com' },
  { label: 'GitHub', href: 'https://github.com' },
  { label: 'Discord', href: 'https://discord.com' },
];

export function Footer({ logo, className }: FooterProps) {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  // Helper to get label (uses translation if key exists, otherwise fallback)
  const getLabel = (key: string) => {
    const translated = t(key);
    return translated === key ? key : translated;
  };

  return (
    <footer className={cn('border-t border-border bg-secondary/20', className)}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-6">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-xl font-bold tracking-tight">
              {logo || (
                <>
                  <span className="text-primary">SaaS</span>Boilerplate
                </>
              )}
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {t('footer.description')}
            </p>
          </div>

          {/* Link Columns */}
          {footerColumns.map((column, index) => (
            <div key={index}>
              <h4 className="mb-4 font-semibold">{t(column.titleKey)}</h4>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {getLabel(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright', { year: currentYear })}
          </p>

          {/* Social Links */}
          <div className="flex gap-4">
            {socialLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

