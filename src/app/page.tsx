'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { INITIAL_EMPLOYEES } from '@/lib/mockData';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Database, 
  ShieldCheck, 
  User, 
  Mail, 
  Briefcase,
  Building2,
  FileSignature
} from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const { loginUser, currentUser } = useOnboarding();

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
    await new Promise(r => setTimeout(r, 600)); // Smooth validation feedback
    await loginUser(email, firstName, lastName);
    setLoading(false);
    setStep('matched');
  };

  const handleProceedToContract = () => {
    router.push('/contracts');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-12 space-y-10">
      
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-medium tracking-wide">
          <Sparkles className="w-4 h-4 text-accent-cyan" />
          <span>Plateforme Officielle d’Intégration Salarié</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Bienvenue chez <span className="bg-gradient-to-r from-brand-400 to-accent-cyan bg-clip-text text-transparent">Data Insight</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
          Préparez votre arrivée en quelques minutes : validation de votre profil, signature de vos documents administratifs et accès direct à votre feuille de route des 30 premiers jours.
        </p>
      </div>

      {/* Main Card */}
      {step === 'form' ? (
        <div className="glass-panel p-6 sm:p-10 rounded-3xl space-y-8 relative overflow-hidden shadow-2xl border border-white/10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-accent-cyan" />
              <span>Étape 1 : Formulaire d’identification du nouveau collaborateur</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Renseignez vos coordonnées pour que notre système vérifie votre dossier dans la base de données Data Insight.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Prénom
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Alexandre"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Nom
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Moreau"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Adresse email professionnelle ou personnelle
                </label>
                {identifiedUser && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <Database className="w-3 h-3" /> Dossier RH pré-chargé trouvé
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
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Quick Demo Pre-filled profiles */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium text-slate-300">💡 Profils de démonstration pré-configurés :</span>
                <span className="text-[10px] text-brand-400">Cliquez pour tester</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {INITIAL_EMPLOYEES.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => handleQuickSelect(emp)}
                    className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                      email.toLowerCase() === emp.email.toLowerCase()
                        ? 'bg-brand-600/30 border-brand-500 text-white shadow-sm'
                        : 'bg-slate-800/40 border-white/5 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="font-semibold">{emp.firstName} {emp.lastName}</div>
                    <div className="text-[10px] text-slate-400 truncate">{emp.role}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-600 to-accent-cyan text-white font-bold text-sm shadow-lg shadow-brand-500/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Vérification dans la base de données...</span>
              ) : (
                <>
                  <span>Valider mes informations & Passer aux contrats</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security note */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Données chiffrées de bout en bout • Conforme RGPD & Sécurité Data Insight</span>
          </div>
        </div>
      ) : (
        /* Step Matched: Boarding Pass & Confirmation */
        <div className="glass-panel p-6 sm:p-10 rounded-3xl space-y-8 relative overflow-hidden shadow-2xl border border-emerald-500/30">
          <div className="flex items-center gap-3 text-emerald-400">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Profil identifié avec succès !</h2>
              <p className="text-xs text-slate-300">Votre dossier collaborateur a été rattaché à votre compte Data Insight.</p>
            </div>
          </div>

          {/* Boarding Pass Ticket */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 p-6 rounded-2xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-lg">
                  {firstName?.[0] || 'D'}{lastName?.[0] || 'I'}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{firstName} {lastName}</h3>
                  <p className="text-xs text-brand-300 font-mono">{email}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Date d'arrivée</span>
                <span className="text-sm font-bold text-accent-cyan">01 Octobre 2026</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> Poste</span>
                <p className="font-semibold text-white">{identifiedUser?.role || 'Data Engineer / Analytics'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> Département</span>
                <p className="font-semibold text-white">{identifiedUser?.department || 'Data Platform'}</p>
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <span className="text-slate-400 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Manager</span>
                <p className="font-semibold text-white">{identifiedUser?.managerName || 'Antoine Laurent'}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
            <FileSignature className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-amber-300">Dernière formalité administrative :</strong>
              Votre contrat de travail et les accords de confidentialité (NDA) sont en attente de votre signature électronique pour débloquer votre accès complet à la roadmap et aux outils.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setStep('form')}
              className="py-3 px-5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold hover:bg-slate-700 transition-colors"
            >
              Modifier mes coordonnées
            </button>
            <button
              onClick={handleProceedToContract}
              className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-600 to-accent-cyan text-white font-bold text-sm shadow-lg shadow-brand-500/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <span>Accéder et signer mon contrat de travail</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-sm">
            01
          </div>
          <h3 className="font-bold text-sm text-white">Signature Électronique</h3>
          <p className="text-xs text-slate-400">
            Paraphez vos contrats légaux et accords de confidentialité en ligne en toute sécurité.
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-accent-cyan/20 text-accent-cyan flex items-center justify-center font-bold text-sm">
            02
          </div>
          <h3 className="font-bold text-sm text-white">Roadmap J+1 à 30</h3>
          <p className="text-xs text-slate-400">
            Suivez jour après jour vos missions, vos installations de logiciels et vos jalons d'intégration.
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
            03
          </div>
          <h3 className="font-bold text-sm text-white">Buddy & Codex</h3>
          <p className="text-xs text-slate-400">
            Connectez-vous directement avec votre parrain dédié et consultez la documentation complète de l'entreprise.
          </p>
        </div>
      </div>

    </div>
  );
}
