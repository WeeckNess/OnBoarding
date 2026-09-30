'use client';
import { useEffect, useRef } from 'react';
import {
  Check,
  CircleDashed,
  Layers,
  PencilLine,
  X,
  type LucideIcon,
} from 'lucide-react';

export const inputClass =
  'w-full rounded-xl border border-white/10 bg-carbon-850 px-4 py-3 text-sm text-white [color-scheme:dark] placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-colors';
export const buttonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-2.5 text-xs font-bold text-carbon-950 shadow-md hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait transition-all';
export const secondaryClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-carbon-850 px-3.5 py-2.5 text-xs font-bold text-slate-300 hover:bg-carbon-800 hover:text-brand-300 disabled:opacity-50 transition-colors';

export function IconTile({
  icon: Icon,
  small = false,
}: {
  icon: LucideIcon;
  small?: boolean;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center border border-brand-500/25 bg-brand-500/15 text-brand-400 ${small ? 'h-9 w-9 rounded-xl' : 'h-12 w-12 rounded-2xl'}`}
    >
      <Icon size={small ? 17 : 23} strokeWidth={1.8} />
    </span>
  );
}
export function Avatar({
  firstName,
  lastName,
  large = false,
}: {
  firstName: string;
  lastName: string;
  large?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center bg-zinc-100 text-carbon-950 font-extrabold ring-2 ring-brand-500/25 shadow-lg ${large ? 'h-16 w-16 rounded-2xl text-xl' : 'h-11 w-11 rounded-2xl text-sm'}`}
    >
      {firstName[0]}
      {lastName[0]}
    </span>
  );
}
export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'green' | 'amber' | 'red';
}) {
  const colors = {
    neutral: 'bg-white/5 text-slate-400 border-white/10',
    green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    amber: 'bg-brand-500/15 text-brand-300 border-brand-500/25',
    red: 'bg-red-400/10 text-red-300 border-red-400/20',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold leading-4 ${colors[tone]}`}
    >
      {children}
    </span>
  );
}
export function Panel({
  id,
  title,
  description,
  action,
  icon: Icon = Layers,
  className = '',
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`glass-panel rounded-3xl border border-white/10 p-5 sm:p-7 shadow-xl min-w-0 ${className}`}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <IconTile icon={Icon} small />
          <div className="min-w-0">
            <h2 className="text-base font-bold leading-tight text-white">
              {title}
            </h2>
            {description && (
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-400">
                {description}
              </p>
            )}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function ReadinessStrip({
  checks,
  compact = false,
}: {
  checks: { label: string; done: boolean }[];
  compact?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-1.5" aria-hidden="true">
        {checks.map((c) => (
          <div
            key={c.label}
            className={`h-1.5 flex-1 rounded-full ${c.done ? 'bg-zinc-100 shadow-sm' : 'bg-white/[0.06]'}`}
          />
        ))}
      </div>
      <div
        className={`grid grid-cols-2 gap-2 ${compact ? '' : 'sm:grid-cols-4'}`}
      >
        {checks.map((c) => (
          <div
            key={c.label}
            className={`flex items-center gap-2 ${compact ? 'py-1' : 'rounded-2xl border border-white/5 bg-carbon-850/70 px-3 py-3.5'} ${c.done ? 'text-brand-300' : 'text-slate-400'}`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${c.done ? 'border-brand-500/40 bg-brand-500/15 text-brand-400' : 'border-slate-600 text-slate-500'}`}
            >
              {c.done ? (
                <Check size={11} />
              ) : (
                <span className="h-1 w-1 rounded-full bg-current" />
              )}
            </span>
            <span className="text-[11px] leading-relaxed">
              {c.label}
              <span className="sr-only">
                {' '}
                : {c.done ? 'prêt' : 'à préparer'}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}
export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-dashed border-white/10 bg-carbon-850/35 p-5">
      <CircleDashed size={19} className="mt-0.5 shrink-0 text-brand-400/60" />
      <p className="text-xs leading-relaxed text-slate-400">{children}</p>
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => {
      element?.close();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="w-[calc(100%-2rem)] max-w-xl max-h-[90dvh] rounded-3xl border border-white/10 bg-carbon-900 p-0 text-white shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      aria-labelledby="manager-dialog-title"
    >
      <div className="relative overflow-hidden border-b border-white/10 px-6 py-6 sm:px-8">
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <IconTile icon={PencilLine} small />
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-brand-400">
                Accompagner l’intégration
              </p>
              <h2 id="manager-dialog-title" className="text-lg font-bold">
                {title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            aria-label="Fermer le formulaire"
            onClick={onClose}
            className="rounded-xl border border-white/5 bg-carbon-850 p-2 text-slate-400 transition-colors hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      <div className="p-6 sm:p-8">{children}</div>
    </dialog>
  );
}
