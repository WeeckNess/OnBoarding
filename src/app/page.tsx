'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { INITIAL_EMPLOYEES } from '@/lib/mockData';
import { 
  ArrowRight, 
  Database, 
  User, 
  Mail, 
  Loader2
} from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const { loginUser, currentUser, isLoaded } = useOnboarding();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [identifiedUser, setIdentifiedUser] = useState<typeof INITIAL_EMPLOYEES[0] | null>(null);

  // If already logged in, immediately redirect to /dashboard
  useEffect(() => {
    if (isLoaded && currentUser) {
      router.replace('/dashboard');
    }
  }, [currentUser, isLoaded, router]);

  const handleEmailLookup = (inputEmail: string) => {
    setEmail(inputEmail);
    const match = INITIAL_EMPLOYEES.find(e => e.email.toLowerCase() === inputEmail.trim().toLowerCase());
    if (match) {
      setFirstName(match.firstName);
      setLastName(match.lastName);
      setIdentifiedUser(match);
    } else {
      setIdentifiedUser(null);
    }
  };

  const handleQuickSelect = (emp: typeof INITIAL_EMPLOYEES[0]) => {
    setEmail(emp.email);
    setFirstName(emp.firstName);
    setLastName(emp.lastName);
    setIdentifiedUser(emp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    await loginUser(email, firstName, lastName);
    // Direct instant redirection to dashboard upon login
    router.push('/dashboard');
  };

  // Prevent flashing login form if already logged in
  if (currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        <p className="text-sm text-slate-300">Redirection vers votre tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      
      {/* Clean Hero Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Bienvenue chez <span className="bg-gradient-to-r from-brand-400 via-brand-300 to-accent-sand bg-clip-text text-transparent">Data Insight</span>
        </h1>
        
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          Renseignez vos informations pour accéder à votre espace collaborateur et votre tableau de bord.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl space-y-8 relative overflow-hidden shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="border-b border-white/10 pb-4">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-brand-400" />
            <span>Identification du collaborateur</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Entrez votre nom, prénom et email pour charger votre dossier d'onboarding.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Prénom
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Alexandre"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-carbon-850 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Nom
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Moreau"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-carbon-850 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Adresse email
              </label>
              {identifiedUser && (
                <span className="flex items-center gap-1 text-[11px] text-brand-300 font-medium">
                  <Database className="w-3 h-3 text-brand-400" /> Dossier RH trouvé
                </span>
              )}
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="email"
                required
                placeholder="alexandre.moreau@datainsight.io"
                value={email}
                onChange={(e) => handleEmailLookup(e.target.value)}
                className="w-full bg-carbon-850 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* Quick Demo Pre-filled profiles */}
          <div className="bg-carbon-900/90 p-4 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">💡 Profils de test pré-enregistrés :</span>
              <span className="text-[11px] text-brand-400 font-medium">Cliquez pour tester</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {INITIAL_EMPLOYEES.map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => handleQuickSelect(emp)}
                  className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                    email.toLowerCase() === emp.email.toLowerCase()
                      ? 'bg-brand-500/20 border-brand-500 text-white shadow-sm'
                      : 'bg-carbon-850 border-white/5 text-slate-300 hover:bg-carbon-800'
                  }`}
                >
                  <div className="font-bold text-white">{emp.firstName} {emp.lastName}</div>
                  <div className="text-[10px] text-brand-300/80 truncate mt-0.5">{emp.role}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 text-carbon-950 font-extrabold text-sm shadow-xl shadow-brand-500/20 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Connexion en cours...</span>
            ) : (
              <>
                <span>Accéder à mon tableau de bord</span>
                <ArrowRight className="w-4 h-4 text-carbon-950" />
              </>
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
