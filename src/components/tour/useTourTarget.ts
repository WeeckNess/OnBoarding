'use client';

import { useEffect, useRef, useState } from 'react';
import type { TourStep } from './tourSteps';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type TargetStatus =
  | 'none' //      l'étape n'a pas de cible (carte centrée)
  | 'waiting' //   on attend que la page / l'élément apparaisse
  | 'found' //     élément trouvé et visible
  | 'missing'; //  introuvable ou caché (ex. menu latéral sur mobile) → repli centré

export interface TargetState {
  status: TargetStatus;
  rect: Rect | null;
  /** true quand l'élément n'a plus bougé depuis ~350 ms (fin du scroll). */
  settled: boolean;
}

const MISSING_AFTER_MS = 3000;
const HIDDEN_AFTER_MS = 600;
const SETTLE_MS = 350;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function readRect(el: Element): Rect | null {
  const r = el.getBoundingClientRect();
  const visible =
    r.width > 0 &&
    r.height > 0 &&
    r.right > 0 &&
    r.bottom > 0 &&
    r.left < window.innerWidth &&
    r.top < window.innerHeight * 4; // l'élément peut être plus bas : on scrollera
  return visible ? { x: r.left, y: r.top, w: r.width, h: r.height } : null;
}

const moved = (a: Rect, b: Rect) =>
  Math.abs(a.x - b.x) > 0.5 ||
  Math.abs(a.y - b.y) > 0.5 ||
  Math.abs(a.w - b.w) > 0.5 ||
  Math.abs(a.h - b.h) > 0.5;

function scrollIntoViewIfNeeded(el: Element, rect: Rect) {
  const vh = window.innerHeight;
  const fullyVisible = rect.y >= 72 && rect.y + rect.h <= vh - 24;
  if (fullyVisible) return;
  el.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: rect.h > vh * 0.6 ? 'start' : 'center',
  });
}

/**
 * Suit en continu (requestAnimationFrame) la position de l'élément ciblé par
 * l'étape courante : gère l'attente après navigation, le scroll automatique,
 * le redimensionnement et les changements de layout.
 */
export function useTourTarget(step: TourStep, pathname: string, enabled: boolean): TargetState {
  const [state, setState] = useState<TargetState>({ status: 'waiting', rect: null, settled: false });
  const emitted = useRef<TargetState>(state);

  useEffect(() => {
    if (!enabled) return;

    const emit = (next: TargetState) => {
      const prev = emitted.current;
      const changed =
        prev.status !== next.status ||
        prev.settled !== next.settled ||
        (prev.rect === null) !== (next.rect === null) ||
        (prev.rect && next.rect && moved(prev.rect, next.rect));
      if (changed) {
        emitted.current = next;
        setState(next);
      }
    };

    if (!step.target) {
      emit({ status: 'none', rect: null, settled: true });
      return;
    }

    emit({ status: 'waiting', rect: null, settled: false });

    const start = performance.now();
    let raf = 0;
    let last: Rect | null = null;
    let lastChange = start;
    let scrolled = false;

    const selectors = Array.isArray(step.target) ? step.target : [step.target];

    const tick = (now: number) => {
      const onRoute = !step.route || pathname === step.route;
      let el: Element | null = null;
      let rect: Rect | null = null;
      if (onRoute) {
        for (const selector of selectors) {
          const candidate = document.querySelector(selector);
          const candidateRect = candidate ? readRect(candidate) : null;
          el = el ?? candidate;
          if (candidate && candidateRect) {
            el = candidate;
            rect = candidateRect;
            break;
          }
        }
      }

      if (!el || !rect) {
        // Élément présent mais caché (ex. menu latéral replié sur mobile) :
        // inutile d'attendre longtemps.
        const limit = el ? HIDDEN_AFTER_MS : MISSING_AFTER_MS;
        emit({
          status: now - start > limit ? 'missing' : 'waiting',
          rect: null,
          settled: false,
        });
      } else {
        if (!scrolled) {
          scrolled = true;
          scrollIntoViewIfNeeded(el, rect);
        }
        if (!last || moved(last, rect)) {
          last = rect;
          lastChange = now;
        }
        emit({ status: 'found', rect, settled: now - lastChange > SETTLE_MS });
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, step, pathname]);

  return state;
}
