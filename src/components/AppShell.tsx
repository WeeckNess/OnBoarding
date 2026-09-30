'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useOnboarding } from '@/context/OnboardingContext';
import ArcSidebar from './ArcSidebar';
import OnboardingTour from './tour/OnboardingTour';
import { homeForRole } from '@/lib/onboarding';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoaded, error, clearError, refresh } = useOnboarding();
  const pathname = usePathname();
  const router = useRouter();
  const isManager = currentUser?.appRole === 'manager';
  const isAdmin = currentUser?.appRole === 'admin';
  const isService = currentUser?.appRole === 'rh' || currentUser?.appRole === 'it';
  const isEmployee = currentUser?.appRole === 'employee';
  const home = homeForRole(currentUser?.appRole || 'employee');
  const wrongSpace =
    !!currentUser &&
    (isAdmin
      ? !pathname.startsWith('/admin') && pathname !== '/'
      : isService
        ? pathname !== '/operations' && pathname !== '/codex' && pathname !== '/'
      : isManager
        ? !pathname.startsWith('/manager') && pathname !== '/codex' && pathname !== '/'
        : pathname.startsWith('/manager') || pathname.startsWith('/admin') || pathname.startsWith('/operations'));
  useEffect(() => {
    if (isLoaded && !currentUser && pathname !== '/') router.replace('/');
    else if (wrongSpace) router.replace(home);
  }, [isLoaded, currentUser, pathname, router, wrongSpace, home]);
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
      <ArcSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? 'md:pl-20' : 'md:pl-72'
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
                © {new Date().getFullYear()} Data Insight SAS — Parcours
                d’intégration
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
      {isEmployee && <OnboardingTour />}
    </div>
  );
}
