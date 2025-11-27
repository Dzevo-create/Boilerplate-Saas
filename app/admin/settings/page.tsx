/**
 * Admin Settings
 * 
 * Configure application settings and preferences.
 */

'use client';

import { AdminHeader } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';

// Settings section component
function SettingsSection({ 
  title, 
  description, 
  children 
}: { 
  title: string; 
  description?: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// Settings row component
function SettingsRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="sm:w-64">{children}</div>
    </div>
  );
}

// Toggle switch component
function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        className="peer sr-only"
        defaultChecked={defaultChecked}
      />
      <div className="peer h-6 w-11 rounded-full bg-secondary after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full dark:after:bg-foreground" />
    </label>
  );
}

export default function AdminSettingsPage() {
  return (
    <div>
      <AdminHeader
        title="Settings"
        subtitle="Manage your application settings and preferences."
        actions={
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        }
      />

      <div className="space-y-6 p-6">
        {/* General Settings */}
        <SettingsSection
          title="General"
          description="Basic application settings"
        >
          <SettingsRow
            label="Application Name"
            description="The name displayed throughout the app"
          >
            <Input defaultValue="SaaS Boilerplate" />
          </SettingsRow>
          <SettingsRow
            label="Support Email"
            description="Email address for support inquiries"
          >
            <Input defaultValue="support@example.com" />
          </SettingsRow>
          <SettingsRow
            label="Timezone"
            description="Default timezone for the application"
          >
            <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
              <option>UTC</option>
              <option>America/New_York</option>
              <option>Europe/London</option>
              <option>Europe/Berlin</option>
              <option>Asia/Tokyo</option>
            </select>
          </SettingsRow>
        </SettingsSection>

        {/* Authentication Settings */}
        <SettingsSection
          title="Authentication"
          description="Configure authentication options"
        >
          <SettingsRow
            label="Email Verification"
            description="Require email verification for new users"
          >
            <Toggle defaultChecked />
          </SettingsRow>
          <SettingsRow
            label="OAuth Providers"
            description="Allow social login"
          >
            <Toggle defaultChecked />
          </SettingsRow>
          <SettingsRow
            label="Two-Factor Auth"
            description="Enable 2FA for all users"
          >
            <Toggle />
          </SettingsRow>
        </SettingsSection>

        {/* Notifications Settings */}
        <SettingsSection
          title="Notifications"
          description="Configure notification preferences"
        >
          <SettingsRow
            label="Email Notifications"
            description="Send email notifications to users"
          >
            <Toggle defaultChecked />
          </SettingsRow>
          <SettingsRow
            label="New User Alerts"
            description="Notify admins of new signups"
          >
            <Toggle defaultChecked />
          </SettingsRow>
          <SettingsRow
            label="Payment Alerts"
            description="Notify admins of payment events"
          >
            <Toggle defaultChecked />
          </SettingsRow>
        </SettingsSection>

        {/* Billing Settings */}
        <SettingsSection
          title="Billing"
          description="Configure payment and billing options"
        >
          <SettingsRow
            label="Currency"
            description="Default currency for payments"
          >
            <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
            </select>
          </SettingsRow>
          <SettingsRow
            label="Trial Period"
            description="Days of free trial for new users"
          >
            <Input type="number" defaultValue="14" />
          </SettingsRow>
          <SettingsRow
            label="Auto-renew"
            description="Automatically renew subscriptions"
          >
            <Toggle defaultChecked />
          </SettingsRow>
        </SettingsSection>
      </div>
    </div>
  );
}

