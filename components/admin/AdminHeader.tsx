'use client';

import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export function AdminHeader({
  title,
  subtitle,
  showSearch = true,
  showNotifications = true,
  actions,
  className,
}: AdminHeaderProps) {
  return (
    <header className={cn('border-b border-border bg-card px-6 py-4', className)}>
      <div className="flex items-center justify-between">
        {/* Left: Title & Subtitle */}
        <div>
          {title && <h1 className="text-2xl font-bold">{title}</h1>}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Right: Search, Notifications, User */}
        <div className="flex items-center gap-4">
          {/* Search */}
          {showSearch && (
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-64 pl-9"
              />
            </div>
          )}

          {/* Custom Actions */}
          {actions}

          {/* Notifications */}
          {showNotifications && (
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
            </Button>
          )}

          {/* User Menu */}
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

