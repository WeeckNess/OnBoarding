'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { TourDemo } from './tourSteps';
import { prefersReducedMotion } from './useTourTarget';

interface GhostCursorProps {
  demo: TourDemo;
  /** On ne lance la démo que lorsque la page ne bouge plus. */
  active: boolean;
}

/** Pointeur de souris stylisé, la pointe est en (0,0). */
function CursorIcon() {
  return (
    <svg width="26" height="30" viewBox="0 0 26 30" fill="none" className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
      <path
        d="M2 2L2 24.5L8.2 18.6L12.4 28L16.6 26.2L12.5 17H21L2 2Z"
        fill="#f6f5f2"
        stroke="#121315"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function visibleRect(selector: string) {
  const el = document.querySelector(selector) as HTMLElement | null;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0 || r.bottom < 0 || r.top > window.innerHeight) return null;
  return { el, r };
}

/* ------------------------------------------------------------------ */
/* Démo « clic » : le curseur glisse vers le bouton, clique, onde dorée  */
/* ------------------------------------------------------------------ */
function ClickDemo({ selector }: { selector: string }) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hit = visibleRect(selector);
    const cursor = cursorRef.current;
    const ripple = rippleRef.current;
    if (!hit || !cursor || !ripple) return;

    const ex = hit.r.left + hit.r.width / 2;
    const ey = hit.r.top + hit.r.height / 2;
    const sx = ex + 90;
    const sy = ey + 70;
    const at = (x: number, y: number, s = 1) => `translate3d(${x}px, ${y}px, 0) scale(${s})`;

    ripple.style.left = `${ex - 22}px`;
    ripple.style.top = `${ey - 22}px`;
    setReady(true);

    const timing: KeyframeAnimationOptions = { duration: 2800, iterations: Infinity };
    const moves = cursor.animate(
      [
        { offset: 0, transform: at(sx, sy), opacity: 0 },
        { offset: 0.1, transform: at(sx, sy), opacity: 1, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' },
        { offset: 0.45, transform: at(ex, ey), opacity: 1 },
        { offset: 0.52, transform: at(ex, ey, 0.8), opacity: 1 },
        { offset: 0.6, transform: at(ex, ey), opacity: 1 },
        { offset: 0.86, transform: at(ex, ey), opacity: 1 },
        { offset: 1, transform: at(ex, ey), opacity: 0 },
      ],
      timing,
    );
    const wave = ripple.animate(
      [
        { offset: 0, transform: 'scale(0.2)', opacity: 0 },
        { offset: 0.5, transform: 'scale(0.2)', opacity: 0 },
        { offset: 0.53, transform: 'scale(0.35)', opacity: 0.95 },
        { offset: 0.82, transform: 'scale(1.8)', opacity: 0 },
        { offset: 1, transform: 'scale(1.8)', opacity: 0 },
      ],
      timing,
    );
    return () => {
      moves.cancel();
      wave.cancel();
    };
  }, [selector]);

  return (
    <div className="fixed inset-0 z-[75] pointer-events-none" style={{ opacity: ready ? 1 : 0 }}>
      <div ref={rippleRef} className="absolute w-11 h-11 rounded-full border-2 border-brand-400 bg-brand-400/20" style={{ opacity: 0 }} />
      <div ref={cursorRef} className="absolute left-0 top-0 origin-top-left" style={{ opacity: 0 }}>
        <CursorIcon />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Démo « signature » : un paraphe se dessine, le curseur suit le tracé */
/* ------------------------------------------------------------------ */
const SIGNATURE_PATH =
  'M18 64 C 30 18, 52 16, 48 58 C 46 78, 66 82, 76 52 C 84 30, 98 34, 100 56 ' +
  'C 102 74, 120 72, 128 50 C 134 34, 146 38, 144 58 C 142 76, 164 74, 172 52 ' +
  'C 180 32, 194 36, 196 56 C 198 74, 222 70, 234 46 C 244 28, 256 70, 284 58';

function DrawDemo({ selector }: { selector: string }) {
  const [box, setBox] = useState<DOMRect | null>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hit = visibleRect(selector);
    if (hit) setBox(hit.r);
  }, [selector]);

  useEffect(() => {
    const path = pathRef.current;
    const cursor = cursorRef.current;
    const layer = layerRef.current;
    if (!box || !path || !cursor || !layer) return;

    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    const DRAW = 2100;
    const HOLD = 900;
    const FADE = 450;
    const GAP = 350;
    const CYCLE = DRAW + HOLD + FADE + GAP;
    const start = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const t = (now - start) % CYCLE;
      const p = Math.min(1, t / DRAW);
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      path.style.strokeDashoffset = `${len * (1 - eased)}`;

      const ctm = path.getScreenCTM();
      if (ctm) {
        const pt = path.getPointAtLength(len * eased);
        const screen = new DOMPoint(pt.x, pt.y).matrixTransform(ctm);
        cursor.style.transform = `translate3d(${screen.x}px, ${screen.y}px, 0)`;
      }

      let alpha = 1;
      if (t > DRAW + HOLD) alpha = Math.max(0, 1 - (t - DRAW - HOLD) / FADE);
      layer.style.opacity = `${alpha}`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [box]);

  if (!box) return null;

  return (
    <div ref={layerRef} className="fixed inset-0 z-[75] pointer-events-none">
      <svg
        className="absolute"
        style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
        viewBox="0 0 300 100"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          ref={pathRef}
          d={SIGNATURE_PATH}
          fill="none"
          stroke="#DEAF4A"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 6px rgba(222,175,74,0.55))' }}
        />
      </svg>
      <div ref={cursorRef} className="absolute left-0 top-0">
        <CursorIcon />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Démo « saisie » : des mots-clés s'écrivent dans le champ de recherche */
/* ------------------------------------------------------------------ */
function TypeDemo({ selector, words }: { selector: string; words: string[] }) {
  const [anchor, setAnchor] = useState<{ left: number; top: number; height: number; font: string } | null>(null);
  const [text, setText] = useState('');

  useEffect(() => {
    const hit = visibleRect(selector);
    if (!hit || !(hit.el instanceof HTMLInputElement) || hit.el.value) return;
    const input = hit.el;
    const cs = getComputedStyle(input);
    // On masque le placeholder le temps de la démo pour ne pas superposer les textes.
    const placeholder = input.placeholder;
    input.placeholder = '';
    setAnchor({
      left: hit.r.left + parseFloat(cs.paddingLeft),
      top: hit.r.top,
      height: hit.r.height,
      font: cs.fontSize,
    });
    return () => {
      input.placeholder = placeholder;
    };
  }, [selector]);

  useEffect(() => {
    if (!anchor) return;
    let word = 0;
    let chars = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const step = () => {
      const current = words[word];
      if (!deleting) {
        chars += 1;
        setText(current.slice(0, chars));
        if (chars === current.length) {
          deleting = true;
          timer = setTimeout(step, 1100);
          return;
        }
        timer = setTimeout(step, 120);
      } else {
        chars -= 1;
        setText(current.slice(0, chars));
        if (chars === 0) {
          deleting = false;
          word = (word + 1) % words.length;
          timer = setTimeout(step, 350);
          return;
        }
        timer = setTimeout(step, 45);
      }
    };
    timer = setTimeout(step, 400);
    return () => clearTimeout(timer);
  }, [anchor, words]);

  if (!anchor) return null;

  return (
    <div
      className="fixed z-[75] pointer-events-none flex items-center text-white font-medium"
      style={{ left: anchor.left, top: anchor.top, height: anchor.height, fontSize: anchor.font }}
    >
      <span>{text}</span>
      <span className="tour-caret ml-px inline-block w-[2px] h-[1.2em] bg-brand-400 rounded-full" />
    </div>
  );
}

export default function GhostCursor({ demo, active }: GhostCursorProps) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(prefersReducedMotion()), []);

  if (!active || reduced) return null;

  switch (demo.kind) {
    case 'click':
      return <ClickDemo selector={demo.selector} />;
    case 'draw':
      return <DrawDemo selector={demo.selector} />;
    case 'type':
      return <TypeDemo selector={demo.selector} words={demo.words} />;
  }
}
