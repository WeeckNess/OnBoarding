'use client';

import React, { useState } from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import ArcSidebar from './ArcSidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoaded } = useOnboarding();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If not logged in, show full-width centered layout with top branding
  if (!isLoaded) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-8">
          {children}
        </main>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        {/* Simple top brand header on login/identification page */}
        <header className="w-full border-b border-white/5 py-4 px-6 glass-panel">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center font-bold text-white text-xs shadow-md shadow-brand-500/20">
                DI
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white leading-tight">Data Insight SAS</span>
                <span className="text-[10px] text-slate-400 leading-tight">
                  Portail d’onboarding par <strong className="text-slate-300 font-medium">Midi Agency</strong>
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-400">
              Espace Nouvel Arrivant
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8">
          {children}
        </main>

        <footer className="border-t border-white/5 py-6 px-4 sm:px-8 text-center text-xs text-slate-500">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} Data Insight SAS — Intégration Salarié</span>
            <span className="text-slate-400">
              Propulsé par <strong className="text-brand-400 font-semibold">Midi Agency</strong>
            </span>
          </div>
        </footer>
      </div>
    );
  }

  // When logged in, render Arc Sidebar + adjusted content area
  return (
    <div className="flex w-full min-h-screen">
      <ArcSidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isCollapsed ? 'md:pl-20' : 'md:pl-72'
      }`}>
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-8">
          {children}
        </main>

        <footer className="border-t border-white/5 py-6 px-4 sm:px-8 text-center text-xs text-slate-500">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} Data Insight SAS — Intégration Salarié</span>
            <span className="text-slate-400">
              Propulsé par <strong className="text-brand-400 font-semibold">Midi Agency</strong>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
