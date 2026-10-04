'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BriefcaseBusiness, Loader2, Mail, ShieldCheck, User, UserRound } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';

export default function WelcomePage() {
  const router = useRouter();
  const { loginUser, currentUser, isLoaded, demoProfileSwitchEnabled } = useOnboarding();
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && currentUser) {
      router.replace(
        currentUser.appRole === 'admin'
          ? '/admin'
          : currentUser.appRole === 'manager'
            ? '/manager'
            : '/dashboard'
      );
    }
  }, [currentUser, isLoaded, router]);

  const handleQuickLogin = async (profile: { email: string; label: string }) => {
    setLoading(true);
    setNotice('');
    const result = await loginUser(profile.email);
    if (!result.success) {
      setNotice(result.message || `Connexion au profil ${profile.label} impossible.`);
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setNotice('');
    const result = await loginUser(email);
    if (!result.success) {
      setNotice(result.message || 'Connexion impossible.');
    }
    setLoading(false);
  };

  if (currentUser) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
        <p className="text-sm text-slate-300">Ouverture de votre espace…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-4">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Bienvenue chez Data Insight
        </h1>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
          Accédez à votre espace salarié, manager ou RH avec l’adresse associée à votre fiche.
        </p>
      </div>

      <section className="glass-panel relative space-y-8 overflow-hidden rounded-3xl border border-white/10 p-6 shadow-2xl sm:p-10">
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="relative border-b border-white/10 pb-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-white sm:text-lg">
            <User className="h-5 w-5 text-brand-400" />
            Identification
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Saisissez votre adresse email professionnelle.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="work-email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Adresse email
              </label>
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <input
                id="work-email"
                type="email"
                autoComplete="username"
                required
                placeholder="prenom.nom@datainsight.example"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-carbon-850 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 transition-colors focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {demoProfileSwitchEnabled && (
            <div className="rounded-2xl border border-brand-500/20 bg-carbon-900/70 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-white">Accès rapides de démonstration</p>
                  <p className="mt-1 text-[11px] text-slate-400">Choisissez un espace pour ouvrir directement le profil correspondant.</p>
                </div>
                {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand-300" />}
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  { label: 'RH', subtitle: 'Sonia · Administration', email: 'sonia.mercier@datainsight.example', icon: ShieldCheck },
                  { label: 'Manager', subtitle: 'Antoine · Data Platform', email: 'antoine.laurent@datainsight.example', icon: BriefcaseBusiness },
                  { label: 'Salarié', subtitle: 'Léa · Data Engineer', email: 'lea.martin.01@datainsight.example', icon: UserRound },
                ].map((profile) => {
                  const Icon = profile.icon;
                  return (
                    <button
                      key={profile.label}
                      type="button"
                      disabled={loading}
                      onClick={() => void handleQuickLogin(profile)}
                      className="group flex min-h-20 items-center gap-3 rounded-xl border border-white/10 bg-carbon-850/80 px-3 py-3 text-left transition-colors hover:border-brand-400/50 hover:bg-brand-500/10 disabled:cursor-wait disabled:opacity-60"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-brand-300 transition-colors group-hover:bg-brand-500/15">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-bold text-white">{profile.label}</span>
                        <span className="mt-0.5 block truncate text-[10px] text-slate-400">{profile.subtitle}</span>
                      </span>
                      <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-500 transition-colors group-hover:text-brand-300" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {notice && <p role="status" className="text-sm text-amber-200">{notice}</p>}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-zinc-100 px-6 py-4 text-sm font-extrabold text-carbon-950 shadow-xl transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connexion en cours…
              </>
            ) : (
              <>
                <span>Accéder à mon espace</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
