'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import type { TourPlacement, TourStep } from './tourSteps';
import type { Rect } from './useTourTarget';

interface TourPopoverProps {
  step: TourStep;
  index: number;
  total: number;
  /** Élément éclairé ; null = carte centrée. */
  rect: Rect | null;
  visible: boolean;
  shake: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onJump: (index: number) => void;
}

interface Placement {
  x: number;
  y: number;
  side: TourPlacement | 'center';
  arrow: number;
}

const GAP = 18;
const MARGIN = 12;
const MOBILE_BREAKPOINT = 640;

function computePlacement(rect: Rect | null, w: number, h: number, preferred: TourPlacement): Placement {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  if (!rect) {
    return { x: (vw - w) / 2, y: (vh - h) / 2, side: 'center', arrow: 0 };
  }

  // Mobile : carte ancrée en bas (ou en haut si l'élément est en bas).
  if (vw < MOBILE_BREAKPOINT) {
    const targetLow = rect.y + rect.h / 2 > vh / 2;
    return { x: MARGIN, y: targetLow ? MARGIN : vh - h - MARGIN, side: 'center', arrow: 0 };
  }

  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  const opposite: Record<TourPlacement, TourPlacement> = { right: 'left', left: 'right', top: 'bottom', bottom: 'top' };
  const order = Array.from(new Set<TourPlacement>([preferred, opposite[preferred], 'bottom', 'top', 'right', 'left']));

  for (const side of order) {
    let x = 0;
    let y = 0;
    let fits = false;
    if (side === 'right' || side === 'left') {
      x = side === 'right' ? rect.x + rect.w + GAP : rect.x - GAP - w;
      y = clamp(cy - h / 2, MARGIN, vh - h - MARGIN);
      fits = x >= MARGIN && x + w <= vw - MARGIN;
      if (fits) return { x, y, side, arrow: clamp(cy - y, 22, h - 22) };
    } else {
      y = side === 'bottom' ? rect.y + rect.h + GAP : rect.y - GAP - h;
      x = clamp(cx - w / 2, MARGIN, vw - w - MARGIN);
      fits = y >= MARGIN && y + h <= vh - MARGIN;
      if (fits) return { x, y, side, arrow: clamp(cx - x, 22, w - 22) };
    }
  }

  // Rien ne rentre (élément très grand) : on superpose en bas de l'écran.
  return { x: clamp(cx - w / 2, MARGIN, vw - w - MARGIN), y: vh - h - MARGIN, side: 'center', arrow: 0 };
}

function Arrow({ side, offset }: { side: Placement['side']; offset: number }) {
  if (side === 'center') return null;
  const base = 'absolute w-3.5 h-3.5 rotate-45 bg-carbon-900 border-brand-500/40';
  const style: React.CSSProperties =
    side === 'right' || side === 'left' ? { top: offset - 7 } : { left: offset - 7 };
  const cls = {
    right: '-left-[7px] border-l border-b',
    left: '-right-[7px] border-r border-t',
    bottom: '-top-[7px] border-l border-t',
    top: '-bottom-[7px] border-r border-b',
  }[side];
  return <span className={`${base} ${cls}`} style={style} />;
}

export default function TourPopover({
  step,
  index,
  total,
  rect,
  visible,
  shake,
  onNext,
  onPrev,
  onClose,
  onJump,
}: TourPopoverProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [size, setSize] = useState({ w: 360, h: 240 });
  const [placement, setPlacement] = useState<Placement | null>(null);
  const hasPlaced = useRef(false);
  const shakeRef = useRef<HTMLDivElement>(null);

  // Petit « non » de la tête quand on clique à côté.
  useEffect(() => {
    if (!shake || !shakeRef.current) return;
    shakeRef.current.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-7px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(-3px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 380, easing: 'ease-in-out' },
    );
  }, [shake]);

  // Mesure la carte (sa hauteur dépend du texte).
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    setPlacement(computePlacement(rect, size.w, size.h, step.placement ?? 'bottom'));
  }, [rect, size, step.placement]);

  useLayoutEffect(() => {
    if (visible) nextRef.current?.focus({ preventScroll: true });
  }, [visible, index]);

  const Icon = step.icon;
  const isLast = index === total - 1;
  const animate = hasPlaced.current;
  if (placement && visible) hasPlaced.current = true;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      aria-describedby="tour-body"
      className="fixed left-0 top-0 z-[80] w-[calc(100vw-24px)] sm:w-[360px]"
      style={{
        transform: placement ? `translate3d(${placement.x}px, ${placement.y}px, 0)` : undefined,
        transition: animate
          ? 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease'
          : 'opacity 0.25s ease',
        opacity: visible && placement ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div ref={shakeRef}>
        <div
          ref={cardRef}
          className="relative rounded-2xl bg-carbon-900/95 backdrop-blur-xl border border-brand-500/40 shadow-2xl shadow-black/60"
        >
          {placement && <Arrow side={placement.side} offset={placement.arrow} />}

          <div key={step.id} className="tour-pop relative p-5 space-y-4 overflow-hidden rounded-2xl">
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* En-tête */}
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-carbon-950 shadow-lg shadow-brand-500/30 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-400">{step.eyebrow}</p>
                  <h2 id="tour-title" className="text-base font-extrabold text-white leading-tight">
                    {step.title}
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 -mr-1.5 -mt-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Fermer le guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p id="tour-body" className="relative text-[13px] text-slate-300 leading-relaxed">
              {step.body}
            </p>

            {/* Progression segmentée */}
            <div className="relative flex items-center gap-1" aria-label={`Étape ${index + 1} sur ${total}`}>
              {Array.from({ length: total }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => onJump(i)}
                  className="group flex-1 h-3 flex items-center cursor-pointer"
                  aria-label={`Aller à l’étape ${i + 1}`}
                >
                  <span className="relative w-full h-1 rounded-full bg-white/10 overflow-hidden group-hover:bg-white/20 transition-colors">
                    {i < index && <span className="absolute inset-0 bg-brand-500/70" />}
                    {i === index && <span className="tour-fill absolute inset-0 bg-gradient-to-r from-brand-500 to-brand-300" />}
                  </span>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="relative flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-slate-500">
                {index + 1} / {total}
              </span>
              <div className="flex items-center gap-2">
                {index > 0 && (
                  <button
                    onClick={onPrev}
                    className="w-9 h-9 rounded-xl bg-carbon-850 hover:bg-carbon-800 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Étape précédente"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <button
                  ref={nextRef}
                  onClick={onNext}
                  className="h-9 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 text-carbon-950 text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-brand-500/25 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-carbon-900"
                >
                  <span>{isLast ? 'Terminer' : 'Suivant'}</span>
                  {isLast ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
