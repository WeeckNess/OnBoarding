'use client';

import React, { useEffect, useRef } from 'react';
import { prefersReducedMotion, type Rect } from './useTourTarget';

interface SpotlightProps {
  /** Zone à éclairer (déjà agrandie de la marge). null = voile complet. */
  rect: Rect | null;
  onBackdropClick: () => void;
}

function roundedRectPath({ x, y, w, h }: Rect, radius: number) {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  return (
    `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}` +
    `V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}` +
    `H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}` +
    `V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`
  );
}

/**
 * Voile sombre avec une « découpe » lumineuse qui glisse d'un élément à l'autre.
 * L'interpolation est faite à la main (requestAnimationFrame) et écrite
 * directement dans le DOM pour rester fluide sans re-render React.
 */
export default function Spotlight({ rect, onBackdropClick }: SpotlightProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<Rect | null>(rect);
  const currentRef = useRef<Rect | null>(null);

  targetRef.current = rect;

  useEffect(() => {
    let raf = 0;
    let lastTime = performance.now();
    const reduced = prefersReducedMotion();

    const frame = (now: number) => {
      const dt = Math.min(64, now - lastTime);
      lastTime = now;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const target = targetRef.current;
      let cur = currentRef.current;

      if (target) {
        // Première apparition : on part d'un cadre plus large → effet « zoom ».
        if (!cur) cur = { x: target.x - 60, y: target.y - 60, w: target.w + 120, h: target.h + 120 };
        const k = reduced ? 1 : 1 - Math.exp(-dt / 75);
        cur = {
          x: cur.x + (target.x - cur.x) * k,
          y: cur.y + (target.y - cur.y) * k,
          w: cur.w + (target.w - cur.w) * k,
          h: cur.h + (target.h - cur.h) * k,
        };
      } else if (cur) {
        // Pas de cible : la découpe se referme sur son centre.
        const k = reduced ? 1 : 1 - Math.exp(-dt / 60);
        const cx = cur.x + cur.w / 2;
        const cy = cur.y + cur.h / 2;
        const w = cur.w * (1 - k);
        const h = cur.h * (1 - k);
        cur = w < 1 || h < 1 ? null : { x: cx - w / 2, y: cy - h / 2, w, h };
      }
      currentRef.current = cur;

      const outer = `M0 0H${vw}V${vh}H0Z`;
      pathRef.current?.setAttribute('d', cur ? `${outer}${roundedRectPath(cur, 18)}` : outer);

      const ring = ringRef.current;
      if (ring) {
        if (cur && target) {
          ring.style.opacity = '1';
          ring.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
          ring.style.width = `${cur.w}px`;
          ring.style.height = `${cur.h}px`;
        } else {
          ring.style.opacity = '0';
        }
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[70] animate-fade-in"
      onClick={onBackdropClick}
      aria-hidden="true"
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <path ref={pathRef} fillRule="evenodd" fill="rgba(8, 9, 11, 0.74)" />
      </svg>
      <div
        ref={ringRef}
        className="tour-ring absolute left-0 top-0 rounded-[18px] pointer-events-none transition-opacity duration-300"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
