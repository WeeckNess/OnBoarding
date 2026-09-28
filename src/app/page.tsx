'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { INITIAL_EMPLOYEES } from '@/lib/mockData';
import { 
  ArrowRight, 
  CheckCircle2, 
  Database, 
  User, 
  Mail, 
  Briefcase, 
  Building2, 
  FileSignature 
} from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const { loginUser } = useOnboarding();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [identifiedUser, setIdentifiedUser] = useState<typeof INITIAL_EMPLOYEES[0] | null>(null);
  const [step, setStep] = useState<'form' | 'matched'>('form');

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
    await new Promise(r => setTimeout(r, 600));
    await loginUser(email, firstName, lastName);
    setLoading(false);
    setStep('matched');
  };

  const handleProceedToContract = () => {
    router.push('/contracts');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      
      {/* Clean Hero Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Bienvenue chez <span className="bg-gradient-to-r from-brand-400 via-brand-300 to-accent-sand bg-clip-text text-transparent">Data Insight</span>
        </h1>
        
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          Renseignez vos informations pour valider votre dossier et accéder à la signature de votre contrat.
        </p>
      </div>

      {/* Main Form Card */}
      {step === 'form' ? (
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
                <span>Vérification du dossier...</span>
              ) : (
                <>
                  <span>Valider mes informations & Passer au contrat</span>
                  <ArrowRight className="w-4 h-4 text-carbon-950" />
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Step Matched: Boarding Pass & Confirmation */
        <div className="glass-panel p-6 sm:p-10 rounded-3xl space-y-8 relative overflow-hidden shadow-2xl border border-brand-500/30">
          <div className="flex items-center gap-3 text-brand-300">
            <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Profil identifié avec succès !</h2>
              <p className="text-xs text-slate-300">Votre dossier collaborateur a été rattaché à votre compte Data Insight.</p>
            </div>
          </div>

          {/* Boarding Pass Ticket */}
          <div className="bg-gradient-to-br from-carbon-900 via-carbon-850 to-carbon-950 p-6 rounded-2xl border border-brand-500/20 space-y-6 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-carbon-950 font-black text-lg shadow-md">
                  {firstName?.[0] || 'D'}{lastName?.[0] || 'I'}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{firstName} {lastName}</h3>
                  <p className="text-xs text-brand-300 font-mono">{email}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Date d'arrivée</span>
                <span className="text-sm font-bold text-brand-400">01 Octobre 2026</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-brand-400" /> Poste</span>
                <p className="font-bold text-white">{identifiedUser?.role || 'Data Engineer / Analytics'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-brand-400" /> Département</span>
                <p className="font-bold text-white">{identifiedUser?.department || 'Data Platform'}</p>
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <span className="text-slate-400 flex items-center gap-1"><User className="w-3.5 h-3.5 text-brand-400" /> Manager</span>
                <p className="font-bold text-white">{identifiedUser?.managerName || 'Antoine Laurent'}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/25 flex items-start gap-3 text-xs text-brand-200">
            <FileSignature className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-brand-300">Dernière étape :</strong>
              Votre contrat de travail et l’accord de confidentialité (NDA) sont prêts pour votre signature électronique.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setStep('form')}
              className="py-3.5 px-5 rounded-2xl bg-carbon-850 text-slate-300 hover:text-white text-xs font-bold hover:bg-carbon-800 transition-colors cursor-pointer border border-white/5"
            >
              Modifier mes coordonnées
            </button>
            <button
              onClick={handleProceedToContract}
              className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 text-carbon-950 font-extrabold text-sm shadow-lg shadow-brand-500/20 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Accéder et signer mon contrat de travail</span>
              <ArrowRight className="w-4 h-4 text-carbon-950" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
