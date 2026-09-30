'use client';

import { Mail, UserRound } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';

export default function AccountPage() {
  const { currentUser } = useOnboarding();
  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-2">
      <header>
        <p className="mb-3 text-xs uppercase tracking-widest text-brand-400">Espace personnel</p>
        <h1 className="text-3xl font-bold sm:text-4xl">Mon compte</h1>
        <p className="mt-3 text-slate-400">Les informations associées à votre profil Data Insight.</p>
      </header>
      <section className="glass-panel space-y-5 rounded-3xl border border-white/10 p-5 sm:p-7">
        <div className="flex items-center gap-3 border-b border-white/[0.08] pb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-500/20 bg-brand-500/10 text-brand-300"><UserRound size={20} /></div>
          <div><h2 className="font-bold text-white">{currentUser.firstName} {currentUser.lastName}</h2><p className="mt-1 text-sm text-slate-400">{currentUser.role} · {currentUser.department}</p></div>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-300"><Mail size={16} className="text-slate-500" />{currentUser.email}</div>
      </section>
    </div>
  );
}
