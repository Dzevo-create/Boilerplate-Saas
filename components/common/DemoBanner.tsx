/**
 * Demo Mode Banner
 * 
 * Displays a banner when the app is running without configured APIs.
 */

'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function DemoBanner() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if we're in demo mode
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const isDemo = !supabaseUrl || 
      supabaseUrl === 'https://your-project.supabase.co';
    setIsDemoMode(isDemo);
  }, []);

  if (!isDemoMode || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950">
      <div className="container mx-auto flex items-center justify-between px-4 py-2 text-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium">
            Demo Mode – APIs nicht konfiguriert. 
            Kopiere <code className="rounded bg-amber-400/50 px-1">env.template</code> zu{' '}
            <code className="rounded bg-amber-400/50 px-1">.env.local</code> und füge deine Keys ein.
          </span>
        </div>
        <button 
          onClick={() => setDismissed(true)}
          className="rounded p-1 hover:bg-amber-400/50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

