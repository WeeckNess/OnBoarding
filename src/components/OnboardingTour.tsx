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
  HelpCircle, 
  MessageSquare,
  FileCheck2,
  MapPin,
  BookOpen,
  UserCheck,
  Sun
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  category: string;
  message: string;
  subMessage: string;
  targetPath?: string;
  icon: React.ReactNode;
  highlightText: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue sur ton Espace Onboarding ! 👋',
    category: 'Introduction',
    message: 'Midi Agency et Data Insight ont conçu cette plateforme pour que tes 30 premiers jours soient fluides, clairs et sans stress.',
    subMessage: 'Laisse-moi te montrer en 4 étapes rapides les fonctionnalités clés à ta disposition.',
    icon: <Sun className="w-5 h-5 text-brand-400 animate-spin-slow" />,
    highlightText: 'Tableau de bord central & suivi en direct'
  },
  {
    id: 'contracts',
    title: '1. Ton Contrat de Travail & NDA ✍️',
    category: 'Administratif',
    message: 'Avant de commencer tes missions, consulte et signe numériquement ton contrat CDI et l’accord de confidentialité directement depuis l’onglet Contrats.',
    subMessage: 'Tu pourras dessiner ta signature ou taper ton nom, puis télécharger une copie certifiée.',
    targetPath: '/contracts',
    icon: <FileCheck2 className="w-5 h-5 text-amber-400" />,
    highlightText: 'Signature électronique en 1 clic'
  },
  {
    id: 'roadmap',
    title: '2. La Roadmap J+1 à 30 🗺️',
    category: 'Parcours',
    message: 'C’est ton plan de vol quotidien : installation du poste, premier café, 1ère Pull Request, rapport d’étonnement et bilan du premier mois.',
    subMessage: 'Chaque tâche validée met à jour ta jauge de progression en temps réel.',
    targetPath: '/roadmap',
    icon: <MapPin className="w-5 h-5 text-brand-400" />,
    highlightText: 'Checklist interactive jour par jour'
  },
  {
    id: 'codex',
    title: '3. Le Codex & Documentation 📚',
    category: 'Connaissances',
    message: 'Une question sur la stack Data, les tickets resto Swile, Alan Blue ou le télétravail ?',
    subMessage: 'Le moteur de recherche du Codex rassemble toutes les réponses et documentations internes.',
    targetPath: '/codex',
    icon: <BookOpen className="w-5 h-5 text-brand-300" />,
    highlightText: 'Recherche instantanée dans toute l’entreprise'
  },
  {
    id: 'buddy',
    title: '4. Ton Buddy / Parrain Dédié 🤝',
    category: 'Équipe',
    message: 'Tu n’es jamais seul : un parrain attitré (Camille Reynaud) est là pour t’épauler dès le Jour 1.',
    subMessage: 'Envoie-lui un message Slack ou réserve votre café d’accueil en 1 clic !',
    targetPath: '/buddy',
    icon: <UserCheck className="w-5 h-5 text-emerald-400" />,
    highlightText: 'Synchronisations régulières et contact direct'
  }
];

const STORAGE_KEY_TOUR_COMPLETED = 'midi_onboarding_tour_completed';

export default function OnboardingTour() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  useEffect(() => {
    // Auto-open on first login if not completed before
    try {
      const isCompleted = localStorage.getItem(STORAGE_KEY_TOUR_COMPLETED);
      if (!isCompleted && !hasAutoOpened) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          setHasAutoOpened(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error(e);
    }
  }, [hasAutoOpened]);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      const nextStep = TOUR_STEPS[nextIndex];
      if (nextStep.targetPath) {
        router.push(nextStep.targetPath);
      }
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      const prevStep = TOUR_STEPS[prevIndex];
      if (prevStep.targetPath) {
        router.push(prevStep.targetPath);
      }
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

  const currentStep = TOUR_STEPS[currentStepIndex];

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleOpenManually}
          className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-carbon-850/95 hover:bg-carbon-800 border border-brand-500/30 text-xs font-bold text-slate-200 shadow-xl shadow-brand-500/10 hover:border-brand-500/60 transition-all cursor-pointer backdrop-blur-md"
        >
          <div className="w-6 h-6 relative rounded-full overflow-hidden shrink-0 ring-1 ring-brand-500/40">
            <Image src="/logo-midi.png" alt="Midi Guide" fill className="object-cover" />
          </div>
          <span className="hidden sm:inline">Guide & Tutoriel</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
        </button>
      </div>

      {/* Interactive Tour Modal / Chat Bubble Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          
          <div className="w-full max-w-lg bg-carbon-900 border-2 border-brand-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-brand-500/20 space-y-6 relative overflow-hidden">
            
            {/* Ambient solar background light */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Header with Avatar & Close Button */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 relative rounded-2xl overflow-hidden shrink-0 shadow-md ring-2 ring-brand-500/40">
                  <Image src="/logo-midi.png" alt="Midi Guide" fill className="object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-brand-400 uppercase tracking-wider">
                      Midi Assistant
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 font-mono border border-brand-500/20">
                      Étape {currentStepIndex + 1}/{TOUR_STEPS.length}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                    {currentStep.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={handleComplete}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Fermer le tutoriel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Speech Chat Bubble */}
            <div className="space-y-4">
              <div className="relative bg-carbon-850 p-4 sm:p-5 rounded-2xl border border-brand-500/20 text-xs text-slate-200 leading-relaxed shadow-inner">
                {/* Chat bubble pointer */}
                <div className="absolute -top-2 left-6 w-4 h-4 bg-carbon-850 border-t border-l border-brand-500/20 rotate-45" />

                <p className="text-sm font-medium text-white mb-2">
                  {currentStep.message}
                </p>

                <p className="text-slate-400 text-xs">
                  {currentStep.subMessage}
                </p>

                {/* Highlight Chip */}
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-brand-300 font-bold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  <span>{currentStep.highlightText}</span>
                </div>
              </div>

              {/* Progress Dots */}
              <div className="flex items-center justify-center gap-1.5 py-1">
                {TOUR_STEPS.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => {
                      setCurrentStepIndex(idx);
                      if (step.targetPath) router.push(step.targetPath);
                    }}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === currentStepIndex
                        ? 'w-6 bg-brand-400'
                        : 'w-2 bg-carbon-800 hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Footer Navigation Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handleComplete}
                className="text-xs text-slate-400 hover:text-slate-200 font-semibold px-2 py-1 cursor-pointer"
              >
                Passer le guide
              </button>

              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <button
                    onClick={handlePrev}
                    className="p-2.5 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-slate-200 border border-white/10 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Précédent</span>
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 text-carbon-950 font-extrabold text-xs shadow-lg shadow-brand-500/20 hover:opacity-95 active:scale-[0.99] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Terminer la visite' : 'Étape suivante'}</span>
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
