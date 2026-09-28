'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  FileCheck2,
  MapPin,
  BookOpen,
  UserCheck,
  Sun,
  PenTool,
  CheckCircle2,
  Search,
  Coffee,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface TourStep {
  id: string;
  stepNumber: number;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  targetPath: string;
  actionText: string;
  interactiveType: 'welcome' | 'contract' | 'roadmap' | 'codex' | 'buddy';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    stepNumber: 1,
    badge: 'Introduction & Cockpit',
    title: 'Bienvenue sur ton Espace Onboarding ! 👋',
    subtitle: 'Conçu sur-mesure par Midi Agency pour Data Insight',
    description: 'Cette plateforme rassemble tout ce dont tu as besoin pour tes 30 premiers jours : contrats à signer, planning quotidien, base de connaissances et accès direct à ton parrain.',
    targetPath: '/dashboard',
    actionText: 'Voir mon tableau de bord',
    interactiveType: 'welcome'
  },
  {
    id: 'contract',
    stepNumber: 2,
    badge: 'Formalités Légales',
    title: 'Signature Électronique du Contrat & NDA ✍️',
    subtitle: 'Valide ton CDI et tes accès en toute sécurité',
    description: 'Consulte ton contrat de travail à durée indéterminée et l’accord de confidentialité, puis appose ta signature numérique à la souris ou au clavier. La signature est simulée pour cette démonstration.',
    targetPath: '/contracts',
    actionText: 'Aller signer mon contrat',
    interactiveType: 'contract'
  },
  {
    id: 'roadmap',
    stepNumber: 3,
    badge: 'Plan de Vol 30 Jours',
    title: 'La Roadmap J+1 à J+30 Interactive 🗺️',
    subtitle: 'Savoir exactement quoi faire chaque jour',
    description: 'Découpage pas-à-pas : Jour 1 (Welcome & Setup), Semaine 1 (Stack dbt & Snowflake), Semaine 2 (1ère Pull Request), J15 (Rapport d’étonnement) et J30 (Autonomie complète).',
    targetPath: '/roadmap',
    actionText: 'Explorer la feuille de route',
    interactiveType: 'roadmap'
  },
  {
    id: 'codex',
    stepNumber: 4,
    badge: 'Base de Connaissances',
    title: 'Le Codex & Documentation Interne 📚',
    subtitle: 'La réponse à toutes tes questions en 1 seconde',
    description: 'Une recherche instantanée sur tous les sujets : culture de l’entreprise, stack technique Data, politique télétravail hybride, mutuelle Alan et tickets restaurant Swile.',
    targetPath: '/codex',
    actionText: 'Ouvrir le Codex',
    interactiveType: 'codex'
  },
  {
    id: 'buddy',
    stepNumber: 5,
    badge: 'Système de Parrainage',
    title: 'Ton Buddy / Parrain Dédié 🤝',
    subtitle: 'Camille Reynaud t’accompagne dès le Jour 1',
    description: 'Prends un premier café d’accueil informel, pose toutes tes questions sans tabou et suis les points de synchronisation programmés tout au long du mois.',
    targetPath: '/buddy',
    actionText: 'Contacter mon Buddy',
    interactiveType: 'buddy'
  }
];

const STORAGE_KEY_TOUR_COMPLETED = 'midi_onboarding_tour_completed';

export default function OnboardingTour() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  // Interactive demo states inside tour
  const [demoSigned, setDemoSigned] = useState(false);
  const [demoChecklist, setDemoChecklist] = useState<string[]>(['j1']);
  const [demoSearchQuery, setDemoSearchQuery] = useState('dbt');

  useEffect(() => {
    try {
      const isCompleted = localStorage.getItem(STORAGE_KEY_TOUR_COMPLETED);
      if (!isCompleted && !hasAutoOpened) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          setHasAutoOpened(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error(e);
    }
  }, [hasAutoOpened]);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY_TOUR_COMPLETED, 'true');
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenManually = () => {
    setCurrentStepIndex(0);
    setIsOpen(true);
  };

  const handleGoToPage = (path: string) => {
    handleComplete();
    router.push(path);
  };

  const currentStep = TOUR_STEPS[currentStepIndex];

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleOpenManually}
          className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-carbon-850/95 hover:bg-carbon-800 border border-brand-500/30 text-xs font-bold text-slate-200 shadow-xl shadow-brand-500/10 hover:border-brand-500/60 transition-all cursor-pointer backdrop-blur-md hover:scale-105"
        >
          <div className="w-6 h-6 relative rounded-full overflow-hidden shrink-0 ring-1 ring-brand-500/40">
            <Image src="/logo-midi.png" alt="Midi Guide" fill className="object-cover" />
          </div>
          <span className="hidden sm:inline">Tutoriel Plateforme</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
        </button>
      </div>

      {/* Full-space Dynamic Spotlight Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          
          <div className="w-full max-w-3xl bg-carbon-900 border-2 border-brand-500/40 rounded-3xl p-6 sm:p-9 shadow-2xl shadow-brand-500/25 space-y-6 relative overflow-hidden">
            
            {/* Ambient solar warm background aura */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Top Bar with Step tracker & Close */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 relative rounded-2xl overflow-hidden shrink-0 shadow-lg ring-2 ring-brand-500/50">
                  <Image src="/logo-midi.png" alt="Midi Guide" fill className="object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-brand-400 uppercase tracking-wider">
                      Midi Assistant
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-300 font-mono font-bold border border-brand-500/25">
                      Étape {currentStepIndex + 1} sur {TOUR_STEPS.length}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {currentStep.badge}
                  </span>
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Fermer le tutoriel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Top Bar */}
            <div className="w-full bg-carbon-950 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 h-full rounded-full transition-all duration-300 shadow-sm shadow-brand-500/40"
                style={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
              />
            </div>

            {/* Main Content Area with Dynamic Interactive Preview */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
              
              {/* Left Column: Text & Speech Bubble */}
              <div className="md:col-span-7 space-y-4">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {currentStep.title}
                  </h2>
                  <p className="text-xs font-semibold text-brand-400">
                    {currentStep.subtitle}
                  </p>
                </div>

                {/* Speech Bubble */}
                <div className="relative bg-carbon-850 p-4 sm:p-5 rounded-2xl border border-brand-500/25 text-xs text-slate-200 leading-relaxed shadow-lg">
                  <div className="absolute -left-2 top-6 w-3 h-3 bg-carbon-850 border-t border-l border-brand-500/25 -rotate-45 hidden md:block" />
                  <p className="text-sm font-medium text-slate-100">
                    {currentStep.description}
                  </p>
                </div>

                {/* Action shortcut to jump to the actual page */}
                <button
                  onClick={() => handleGoToPage(currentStep.targetPath)}
                  className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-bold hover:underline cursor-pointer pt-1"
                >
                  <span>{currentStep.actionText}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              {/* Right Column: Live Interactive Sandbox Box */}
              <div className="md:col-span-5 bg-carbon-950/80 p-4 rounded-2xl border border-brand-500/20 space-y-3 shadow-inner">
                
                {currentStep.interactiveType === 'welcome' && (
                  <div className="space-y-3 text-center py-2">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400 mx-auto">
                      <Sun className="w-6 h-6 animate-spin-slow" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white">Cockpit Onboarding</p>
                      <p className="text-[11px] text-slate-400">Suivi jour après jour et synchronisation automatique</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-carbon-850 text-[11px] font-bold text-brand-300 border border-brand-500/20">
                      ⚡ 100% interactif & fluide
                    </div>
                  </div>
                )}

                {currentStep.interactiveType === 'contract' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5 text-brand-400" />
                        <span>Simulateur signature</span>
                      </span>
                      <span className="text-[10px] text-brand-300 font-mono">Démo live</span>
                    </div>
                    <div 
                      onClick={() => setDemoSigned(!demoSigned)}
                      className={`h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                        demoSigned
                          ? 'bg-brand-500/10 border-brand-500 text-brand-300'
                          : 'bg-carbon-900 border-white/20 text-slate-400 hover:border-brand-500/50'
                      }`}
                    >
                      {demoSigned ? (
                        <div className="text-center space-y-1">
                          <CheckCircle2 className="w-5 h-5 text-brand-400 mx-auto" />
                          <span className="text-xs font-bold text-brand-400 italic">Alexandre Moreau ✓</span>
                          <span className="text-[10px] block text-slate-400">Signature simulée</span>
                        </div>
                      ) : (
                        <div className="text-center space-y-1 text-xs">
                          <span>✍️ Clique ici pour tester la signature</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentStep.interactiveType === 'roadmap' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-400" />
                        <span>Checklist Roadmap</span>
                      </span>
                      <span className="text-[10px] text-brand-300">{demoChecklist.length}/3 validés</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      {[
                        { id: 'j1', label: 'Jour 1 : Welcome & Setup' },
                        { id: 's1', label: 'Semaine 1 : Pipeline dbt' },
                        { id: 's2', label: 'Semaine 2 : Première PR' },
                      ].map((item) => {
                        const isChecked = demoChecklist.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setDemoChecklist(prev => 
                                prev.includes(item.id) 
                                  ? prev.filter(x => x !== item.id) 
                                  : [...prev, item.id]
                              );
                            }}
                            className={`w-full p-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-brand-500/15 border-brand-500/40 text-brand-300 font-bold'
                                : 'bg-carbon-900 border-white/5 text-slate-400 hover:text-white'
                            }`}
                          >
                            <span className="text-[11px] truncate">{item.label}</span>
                            {isChecked ? (
                              <Check className="w-3.5 h-3.5 text-brand-400" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {currentStep.interactiveType === 'codex' && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                        <span>Moteur Codex</span>
                      </span>
                    </div>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={demoSearchQuery}
                        onChange={(e) => setDemoSearchQuery(e.target.value)}
                        placeholder="Tape dbt, Swile, remote..."
                        className="w-full bg-carbon-900 border border-brand-500/30 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="p-2.5 rounded-xl bg-carbon-850 border border-white/5 text-[11px] text-slate-300 space-y-1">
                      <span className="font-bold text-brand-400 block">⚡ Résultat trouvé :</span>
                      <p className="text-slate-400 truncate">Stack Data Insight (Snowflake, dbt Core, Kafka, AWS)</p>
                    </div>
                  </div>
                )}

                {currentStep.interactiveType === 'buddy' && (
                  <div className="space-y-2.5 text-center">
                    <div className="flex items-center gap-2.5 text-left p-2 rounded-xl bg-carbon-850 border border-brand-500/20">
                      <div className="w-9 h-9 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold shrink-0">
                        CR
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">Camille Reynaud</p>
                        <p className="text-[10px] text-brand-300 truncate">Senior Data Lead • Ton Buddy</p>
                      </div>
                    </div>

                    <a
                      href="https://cal.com/camille-datainsight/welcome-coffee"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-carbon-950 font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 cursor-pointer hover:opacity-95"
                    >
                      <Coffee className="w-3.5 h-3.5 text-carbon-950" />
                      <span>Réserver mon café d'accueil</span>
                    </a>
                  </div>
                )}

              </div>

            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 relative z-10">
              <button
                onClick={handleComplete}
                className="text-xs text-slate-400 hover:text-slate-200 font-semibold cursor-pointer px-2 py-1"
              >
                Passer la visite
              </button>

              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <button
                    onClick={handlePrev}
                    className="py-2.5 px-4 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-slate-200 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Précédent</span>
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 text-carbon-950 font-extrabold text-xs shadow-lg shadow-brand-500/20 hover:opacity-95 active:scale-[0.99] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Commencer l’aventure' : 'Étape suivante'}</span>
                  {currentStepIndex === TOUR_STEPS.length - 1 ? (
                    <Check className="w-4 h-4 text-carbon-950" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-carbon-950" />
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>
      )}
    </>
  );
}
