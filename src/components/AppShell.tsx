'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ManagerSidebar from './manager/ManagerSidebar';
import Image from 'next/image';
import { useOnboarding } from '@/context/OnboardingContext';
import ArcSidebar from './ArcSidebar';
import OnboardingTour from './OnboardingTour';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoaded, error, clearError, refresh } = useOnboarding();
  const pathname = usePathname();
  const router = useRouter();
  const isManager = currentUser?.appRole === 'manager';
  const wrongSpace =
    !!currentUser &&
    (isManager
      ? !pathname.startsWith('/manager') &&
        pathname !== '/codex' &&
        pathname !== '/'
      : pathname.startsWith('/manager'));
  useEffect(() => {
    if (isLoaded && !currentUser && pathname !== '/') router.replace('/');
    else if (wrongSpace) router.replace(isManager ? '/manager' : '/dashboard');
  }, [isLoaded, currentUser, pathname, router, wrongSpace, isManager]);
  const errorBanner = error ? (
    <div
      role="alert"
      className="mb-5 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200"
    >
      <p>{error}</p>
      <div className="mt-2 flex gap-4">
        <button
          onClick={() => {
            clearError();
            void refresh();
          }}
          className="underline"
        >
          Actualiser
        </button>
        <button onClick={clearError} className="underline">
          Fermer
        </button>
      </div>
    </div>
  ) : null;
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If not logged in, show full-width centered layout with clean top branding
  if (!isLoaded || wrongSpace || (!currentUser && pathname !== '/')) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8">
          <p role="status" className="text-slate-400">
            Chargement de votre espace…
          </p>
        </main>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        {/* Simple clean top brand header on login/identification page */}
        <header className="w-full border-b border-white/5 py-4 px-6 glass-panel">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 relative rounded-xl overflow-hidden shadow-md shadow-brand-500/20 ring-1 ring-brand-500/30">
                <Image
                  src="/logo-midi.png"
                  alt="Midi Agency"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white tracking-tight">
                  Midi Agency
                </span>
                <span className="text-[11px] text-slate-400">
                  Portail d’intégration DataInsight
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-10">
          {errorBanner}
          {children}
        </main>

        <footer className="border-t border-white/5 py-6 px-4 sm:px-8 text-center text-xs text-slate-500">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 relative">
                <Image
                  src="/logo-midi.png"
                  alt="Midi"
                  fill
                  className="object-contain opacity-60"
                />
              </div>
              <span>© {new Date().getFullYear()} Data Insight SAS</span>
            </div>
            <span className="text-slate-400">
              Expérience conçue par{' '}
              <strong className="text-brand-400 font-semibold">
                Midi Agency
              </strong>
            </span>
          </div>
        </footer>
      </div>
    );
  }

  // When logged in, render Arc Sidebar + adjusted content area + OnboardingTour
  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      {isManager ? (
        <ManagerSidebar />
      ) : (
        <ArcSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      )}

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed && !isManager ? 'md:pl-20' : 'md:pl-72'
        }`}
      >
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-8">
          {errorBanner}
          {children}
        </main>

        <footer className="border-t border-white/5 py-6 px-4 sm:px-8 text-center text-xs text-slate-500">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 relative">
                <Image
                  src="/logo-midi.png"
                  alt="Midi"
                  fill
                  className="object-contain opacity-60"
                />
              </div>
              <span>
                © {new Date().getFullYear()} Data Insight SAS — Intégration
                Salarié
              </span>
            </div>
            <span className="text-slate-400">
              Propulsé par{' '}
              <strong className="text-brand-400 font-semibold">
                Midi Agency
              </strong>
            </span>
          </div>
        </footer>
      </div>

      {/* Interactive Tour Assistant */}
      {!isManager && <OnboardingTour />}
    </div>
  );
}
