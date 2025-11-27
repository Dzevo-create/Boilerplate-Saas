/**
 * Admin Layout
 * 
 * Provides the admin dashboard structure with sidebar navigation.
 * All admin pages share this layout.
 */

import { AdminSidebar } from '@/components/admin';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

