'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  variant?: 'icon' | 'dropdown' | 'switch';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className={className}
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    );
  }

  if (variant === 'switch') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Sun className="h-4 w-4 text-muted-foreground" />
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className={cn(
            'relative h-6 w-11 rounded-full transition-colors',
            resolvedTheme === 'dark' ? 'bg-primary' : 'bg-secondary'
          )}
          aria-label="Toggle theme"
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform',
              resolvedTheme === 'dark' && 'translate-x-5'
            )}
          />
        </button>
        <Moon className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  // Dropdown variant
  return (
    <div className={cn('flex items-center gap-1 rounded-lg border border-border p-1', className)}>
      <Button
        variant={theme === 'light' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setTheme('light')}
        className="h-8 px-2"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === 'dark' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setTheme('dark')}
        className="h-8 px-2"
      >
        <Moon className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === 'system' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setTheme('system')}
        className="h-8 px-2"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  );
}

