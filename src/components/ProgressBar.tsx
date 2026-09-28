'use client';

import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { CheckCircle, Clock } from 'lucide-react';

export default function ProgressBar() {
  const { tasks, completedTaskIds, progressPercentage } = useOnboarding();
  const totalTasks = tasks.length;
  const completedCount = completedTaskIds.length;

  return (
    <div className="glass-panel p-5 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Progression de l’Onboarding</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-normal">
              Objectif 30 Jours
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {completedCount} sur {totalTasks} actions réalisées avec succès
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black bg-gradient-to-r from-brand-400 to-accent-cyan bg-clip-text text-transparent">
            {progressPercentage}%
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-white/5">
        <div
          className="bg-gradient-to-r from-brand-600 via-brand-400 to-accent-cyan h-full rounded-full transition-all duration-500 shadow-sm shadow-cyan-500/30"
          style={{ width: `${Math.max(progressPercentage, 4)}%` }}
        />
      </div>

      {/* Mini milestones indicators */}
      <div className="grid grid-cols-5 gap-2 pt-1 text-center">
        {[
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
              className={`p-2 rounded-xl border text-[11px] transition-all ${
                isDone
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : isStarted
                  ? 'bg-brand-950/40 border-brand-500/40 text-brand-200'
                  : 'bg-slate-900/40 border-white/5 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-center gap-1 font-medium mb-1 truncate">
                {isDone ? (
                  <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                ) : (
                  <Clock className="w-3 h-3 text-slate-500 shrink-0" />
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
