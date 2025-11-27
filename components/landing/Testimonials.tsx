'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/I18nProvider';

interface Testimonial {
  content: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  rating?: number;
}

interface TestimonialsProps {
  testimonials?: Testimonial[];
  className?: string;
}

// These are static testimonials - in production, fetch from CMS/DB
const defaultTestimonials: Testimonial[] = [
  {
    content: 'This boilerplate saved us weeks of development time. The authentication and payment integration worked out of the box.',
    author: { name: 'Sarah Chen', role: 'CTO at TechStart' },
    rating: 5,
  },
  {
    content: 'The code quality is excellent. Clean architecture, well-documented, and follows best practices. Highly recommended!',
    author: { name: 'Michael Rodriguez', role: 'Senior Developer' },
    rating: 5,
  },
  {
    content: 'Finally a boilerplate that actually works in production. The Stripe webhook handling is bulletproof.',
    author: { name: 'Emma Thompson', role: 'Founder at SaaSify' },
    rating: 5,
  },
];

export function Testimonials({ testimonials = defaultTestimonials, className }: TestimonialsProps) {
  const { t } = useI18n();

  return (
    <section className={cn('py-24', className)}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <h2 className="mb-4 text-center text-3xl font-bold">
          {t('landing.testimonials.title')}
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
          {t('landing.testimonials.subtitle')}
        </p>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ content, author, rating }: Testimonial) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-6">
      {/* Rating */}
      {rating && (
        <div className="mb-4 flex gap-1">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          ))}
        </div>
      )}

      {/* Content */}
      <p className="mb-6 flex-1 text-muted-foreground">&quot;{content}&quot;</p>

      {/* Author */}
      <div className="flex items-center gap-3">
        {author.avatar ? (
          <img
            src={author.avatar}
            alt={author.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {author.name.split(' ').map(n => n[0]).join('')}
          </div>
        )}
        <div>
          <p className="font-medium">{author.name}</p>
          <p className="text-sm text-muted-foreground">{author.role}</p>
        </div>
      </div>
    </div>
  );
}

