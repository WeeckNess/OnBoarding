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

/**
 * Garde la découpe (et son halo) à l'intérieur de l'écran : un élément collé
 * au bord, comme le menu latéral, faisait déborder le cadre à gauche.
 */
const VIEWPORT_INSET = 6;
function fitInViewport(rect: Rect): Rect {
  const maxX = window.innerWidth - VIEWPORT_INSET;
  const maxY = window.innerHeight - VIEWPORT_INSET;
  const x = Math.max(VIEWPORT_INSET, rect.x);
  const y = Math.max(VIEWPORT_INSET, rect.y);
  const right = Math.min(maxX, rect.x + rect.w);
  const bottom = Math.min(maxY, rect.y + rect.h);
  return { x, y, w: Math.max(0, right - x), h: Math.max(0, bottom - y) };
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
    if (currentUser?.appRole !== 'employee') return;
    setIndex(0);
    setOpen(true);
  }, [currentUser?.appRole]);

  // Ouverture automatique à la première connexion + relance via évènement.
  useEffect(() => {
    if (currentUser?.appRole !== 'employee') return;
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
  }, [currentUser?.appRole, start]);

  // Chaque étape se joue sur sa page : on y navigue si besoin.
  useEffect(() => {
    if (currentUser?.appRole === 'employee' && open && step.route && pathname !== step.route) {
      router.push(step.route);
    }
  }, [currentUser?.appRole, open, step, pathname, router]);

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
      colors: ['#FFFFFF', '#E4E4E7', '#A1A1AA', '#E4E4E7', '#34D399'],
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
      ? fitInViewport({
          x: target.rect.x - pad,
          y: target.rect.y - pad,
          w: target.rect.w + pad * 2,
          h: target.rect.h + pad * 2,
        })
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
          className="group flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full bg-carbon-850/95 hover:bg-carbon-800 border border-brand-500/30 hover:border-brand-500/60 text-xs font-bold text-slate-200 shadow-xl transition-all cursor-pointer backdrop-blur-md hover:-translate-y-0.5"
          aria-label="Lancer le guide de la plateforme"
        >
          <span className="w-7 h-7 relative rounded-full overflow-hidden shrink-0 ring-1 ring-brand-500/40">
            <Image src="/logo-midi.png" alt="" fill sizes="28px" className="object-cover" />
          </span>
          <span>Guide</span>
          {!open && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-100 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-100" />
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
