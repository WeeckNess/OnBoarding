'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useOnboarding } from '@/context/OnboardingContext';
import { TOUR_STEPS } from './tourSteps';
import { useTourTarget, type Rect } from './useTourTarget';
import Spotlight from './Spotlight';
import TourPopover from './TourPopover';
import TourIntro from './TourIntro';
import GhostCursor from './GhostCursor';

export const TOUR_STORAGE_KEY = 'midi_onboarding_tour_completed';
const START_EVENT = 'midi:start-tour';

/** Relance la visite guidée depuis n'importe quel composant. */
export function startOnboardingTour() {
  window.dispatchEvent(new Event(START_EVENT));
}

function markCompleted() {
  try {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  } catch {
    /* stockage indisponible (navigation privée) : on ignore */
  }
}

export default function OnboardingTour() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useOnboarding();

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [shake, setShake] = useState(0);

  const step = TOUR_STEPS[index];
  const total = TOUR_STEPS.length;
  const target = useTourTarget(step, pathname, open);

  const start = useCallback(() => {
    setIndex(0);
    setOpen(true);
  }, []);

  // Ouverture automatique à la première connexion + relance via évènement.
  useEffect(() => {
    let done: string | null = null;
    try {
      done = localStorage.getItem(TOUR_STORAGE_KEY);
    } catch {
      done = 'true';
    }
    const timer = done ? undefined : setTimeout(start, 700);
    window.addEventListener(START_EVENT, start);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(START_EVENT, start);
    };
  }, [start]);

  // Chaque étape se joue sur sa page : on y navigue si besoin.
  useEffect(() => {
    if (open && step.route && pathname !== step.route) {
      router.push(step.route);
    }
  }, [open, step, pathname, router]);

  const close = useCallback(() => {
    setOpen(false);
    markCompleted();
  }, []);

  const finish = useCallback(() => {
    const launcher = document.querySelector('[data-tour="tour-launcher"]')?.getBoundingClientRect();
    close();
    confetti({
      particleCount: 110,
      spread: 75,
      startVelocity: 38,
      origin: launcher
        ? { x: (launcher.left + launcher.width / 2) / window.innerWidth, y: launcher.top / window.innerHeight }
        : { y: 0.7 },
      colors: ['#DEAF4A', '#E8BC60', '#F6E1B6', '#F59E0B', '#34D399'],
      disableForReducedMotion: true,
    });
    if (pathname !== '/dashboard') router.push('/dashboard');
  }, [close, pathname, router]);

  const next = useCallback(() => {
    if (index >= total - 1) finish();
    else setIndex((i) => i + 1);
  }, [index, total, finish]);

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  // Clavier : ← → pour naviguer, Échap pour quitter.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close, next, prev]);

  const pad = step.padding ?? 10;
  const holeRect: Rect | null =
    target.status === 'found' && target.rect
      ? { x: target.rect.x - pad, y: target.rect.y - pad, w: target.rect.w + pad * 2, h: target.rect.h + pad * 2 }
      : null;

  const isIntro = step.id === 'welcome';
  const popoverVisible = !isIntro && target.status !== 'waiting';

  return (
    <>
      {/* Bouton flottant pour (re)lancer le guide */}
      <div className="fixed bottom-6 right-6 z-40 print:hidden">
        <button
          data-tour="tour-launcher"
          onClick={start}
          className="group flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full bg-carbon-850/95 hover:bg-carbon-800 border border-brand-500/30 hover:border-brand-500/60 text-xs font-bold text-slate-200 shadow-xl shadow-brand-500/10 transition-all cursor-pointer backdrop-blur-md hover:-translate-y-0.5"
          aria-label="Lancer le guide de la plateforme"
        >
          <span className="w-7 h-7 relative rounded-full overflow-hidden shrink-0 ring-1 ring-brand-500/40">
            <Image src="/logo-midi.png" alt="" fill sizes="28px" className="object-cover" />
          </span>
          <span>Guide</span>
          {!open && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
          )}
        </button>
      </div>

      {open && (
        <>
          <Spotlight rect={holeRect} onBackdropClick={() => setShake((s) => s + 1)} />

          {isIntro ? (
            <TourIntro firstName={currentUser?.firstName} onStart={next} onSkip={close} />
          ) : (
            <TourPopover
              step={step}
              index={index}
              total={total}
              rect={holeRect}
              visible={popoverVisible}
              shake={shake}
              onNext={next}
              onPrev={prev}
              onClose={close}
              onJump={setIndex}
            />
          )}

          {step.demo && target.status === 'found' && (
            <GhostCursor key={step.id} demo={step.demo} active={target.settled} />
          )}
        </>
      )}
    </>
  );
}
