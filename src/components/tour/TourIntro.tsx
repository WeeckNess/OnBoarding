'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight, LayoutDashboard, PenTool, MapPin, BookOpen, UserCheck } from 'lucide-react';

interface TourIntroProps {
  firstName?: string;
  onStart: () => void;
  onSkip: () => void;
}

const STOPS = [
  { icon: LayoutDashboard, label: 'Tableau de bord' },
  { icon: PenTool, label: 'Contrat' },
  { icon: MapPin, label: 'Roadmap' },
  { icon: BookOpen, label: 'Codex' },
  { icon: UserCheck, label: 'Buddy' },
];

/** Écran d'accueil de la visite : carte centrée avec l'aperçu du parcours. */
export default function TourIntro({ firstName, onStart, onSkip }: TourIntroProps) {
  const startRef = useRef<HTMLButtonElement>(null);
  useEffect(() => startRef.current?.focus({ preventScroll: true }), []);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-intro-title"
        className="tour-pop pointer-events-auto relative w-full max-w-md rounded-3xl bg-carbon-900/95 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden"
      >
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative px-7 pt-8 pb-7 text-center space-y-6">
          {/* Logo Midi Agency */}
          <div className="relative w-20 h-20 mx-auto rounded-3xl overflow-hidden">
            <Image src="/logo-midi.png" alt="Midi Agency" fill sizes="80px" className="object-cover" />
          </div>

          <div className="space-y-2 tour-rise" style={{ animationDelay: '0.1s' }}>
            <h2 id="tour-intro-title" className="text-2xl font-extrabold text-white tracking-tight">
              Salut {firstName || 'toi'} 👋
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              En moins d’une minute, je te montre où trouver tout ce dont tu as besoin pour tes 30 premiers jours.
            </p>
          </div>

          {/* Aperçu du parcours */}
          <div className="relative">
            <div className="absolute left-[10%] right-[10%] top-[22px] h-px bg-white/10" />
            <div className="tour-line absolute left-[10%] right-[10%] top-[22px] h-px bg-zinc-100" />
            <ol className="relative grid grid-cols-5 gap-1">
              {STOPS.map(({ icon: Icon, label }, i) => (
                <li key={label} className="tour-rise flex flex-col items-center gap-1.5" style={{ animationDelay: `${0.25 + i * 0.12}s` }}>
                  <span className="w-11 h-11 rounded-2xl bg-carbon-850 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-md">
                    <Icon className="w-[18px] h-[18px]" />
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 leading-tight">{label}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-2 tour-rise" style={{ animationDelay: '0.9s' }}>
            <button
              ref={startRef}
              onClick={onStart}
              className="w-full py-3.5 rounded-2xl bg-zinc-100 text-carbon-950 font-extrabold text-sm shadow-xl hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-carbon-900"
            >
              <span>C’est parti</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onSkip}
              className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Plus tard, je découvre seul·e
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
