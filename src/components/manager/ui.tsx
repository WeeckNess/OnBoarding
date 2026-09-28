'use client';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export const inputClass =
  'w-full rounded-xl border border-white/15 bg-carbon-900 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-400/70';
export const buttonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-carbon-950 hover:bg-brand-400 disabled:opacity-50 disabled:cursor-wait transition-colors';
export const secondaryClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-50 transition-colors';
export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'green' | 'amber' | 'red';
}) {
  const colors = {
    neutral: 'bg-white/5 text-slate-300 border-white/10',
    green: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
    amber: 'bg-amber-400/10 text-amber-200 border-amber-400/20',
    red: 'bg-red-400/10 text-red-300 border-red-400/20',
  };
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${colors[tone]}`}
    >
      {children}
    </span>
  );
}
export function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-carbon-900/70 p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {description && (
            <p className="mt-1 max-w-xl text-sm text-slate-400">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
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
    <label className="block space-y-2 text-sm text-slate-300">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-slate-400">
      {children}
    </p>
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
      className="w-[calc(100%-2rem)] max-w-xl max-h-[90dvh] rounded-2xl border border-white/15 bg-carbon-850 p-0 text-white shadow-2xl backdrop:bg-black/75"
      aria-labelledby="manager-dialog-title"
    >
      <div className="p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="manager-dialog-title" className="text-xl font-bold">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Fermer le formulaire"
            onClick={onClose}
            className={secondaryClass}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
