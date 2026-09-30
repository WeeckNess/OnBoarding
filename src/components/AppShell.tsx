'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import ArcSidebar from './ArcSidebar';
import OnboardingTour from './tour/OnboardingTour';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoaded } = useOnboarding();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Les pages de l'espace salarié exigent d'être identifié.
  const needsLogin = isLoaded && !currentUser && pathname !== '/';
  useEffect(() => {
    if (needsLogin) router.replace('/');
  }, [needsLogin, router]);

  if (needsLogin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-sm text-slate-400">
        <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
        <span>Redirection vers l’identification…</span>
      </div>
    );
  }

  // If not logged in, show full-width centered layout with clean top branding
  if (!isLoaded) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8">
          {children}
        </main>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-10">
          {children}
        </main>

        <footer className="border-t border-white/5 py-6 px-4 sm:px-8 text-center text-xs text-slate-500">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 relative">
                <Image src="/logo-midi.png" alt="Midi" fill className="object-contain opacity-60" />
              </div>
              <span>© {new Date().getFullYear()} Data Insight SAS</span>
            </div>
            <span className="text-slate-400">
              Expérience conçue par <strong className="text-brand-400 font-semibold">Midi Agency</strong>
            </span>
          </div>
        </footer>
      </div>
    );
  }

  // When logged in, render Arc Sidebar + adjusted content area + OnboardingTour
  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      <ArcSidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 print:!pl-0 ${
        isCollapsed ? 'md:pl-20' : 'md:pl-72'
      }`}>
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-8">
          {children}
        </main>

        <footer className="border-t border-white/5 py-6 px-4 sm:px-8 text-center text-xs text-slate-500 print:hidden">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 relative">
                <Image src="/logo-midi.png" alt="Midi" fill className="object-contain opacity-60" />
              </div>
              <span>© {new Date().getFullYear()} Data Insight SAS — Intégration Salarié</span>
            </div>
            <span className="text-slate-400">
              Propulsé par <strong className="text-brand-400 font-semibold">Midi Agency</strong>
            </span>
          </div>
        </footer>
      </div>

      {/* Visite guidée interactive */}
      <OnboardingTour />
    </div>
  );
}
