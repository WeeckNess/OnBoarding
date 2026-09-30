'use client';

import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { CheckCircle2, Clock } from 'lucide-react';

export default function ProgressBar() {
  const { tasks, completedTaskIds, progressPercentage } = useOnboarding();
  const totalTasks = tasks.length;
  const completedCount = completedTaskIds.length;

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-3xl space-y-4 border border-white/10 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-white flex flex-wrap items-center gap-2">
            <span>Progression de l’Intégration</span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/25">
              Pré-arrivée · J+30
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {completedCount} sur {totalTasks} étapes validées avec succès
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-brand-400 via-brand-300 to-accent-sand bg-clip-text text-transparent">
            {progressPercentage}%
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="w-full bg-carbon-900 rounded-full h-3 overflow-hidden p-0.5 border border-white/5">
        <div
          className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-300 h-full rounded-full transition-all duration-500 shadow-sm shadow-brand-500/30"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Mini milestones indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 pt-1 text-center">
        {[
          { label: 'Avant J1', id: 'prearrival' },
          { label: 'J1 : Welcome', id: 'j1' },
          { label: 'S1 : Setup', id: 's1' },
          { label: 'S2 : 1ère PR', id: 's2' },
          { label: 'J15 : Rapport', id: 'j15' },
          { label: 'J30 : Autonomie', id: 'j30' },
        ].map((m) => {
          const milestoneTasks = tasks.filter(t => t.milestoneId === m.id);
          const milestoneCompleted = milestoneTasks.filter(t => completedTaskIds.includes(t.id));
          const isDone = milestoneTasks.length > 0 && milestoneCompleted.length === milestoneTasks.length;
          const isStarted = milestoneCompleted.length > 0;

          return (
            <div
              key={m.id}
              className={`p-2.5 rounded-2xl border text-[11px] transition-all ${
                isDone
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : isStarted
                  ? 'bg-brand-950/40 border-brand-500/30 text-brand-200'
                  : 'bg-carbon-850/60 border-white/5 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-center gap-1 font-medium mb-1 truncate">
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                )}
                <span className="truncate">{m.label}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {milestoneCompleted.length}/{milestoneTasks.length}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
