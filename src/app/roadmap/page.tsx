'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useOnboarding } from '@/context/OnboardingContext';
import ProgressBar from '@/components/ProgressBar';
import { 
  MapPin, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ExternalLink, 
  Sparkles, 
  Compass, 
  GitPullRequest, 
  TrendingUp, 
  Award,
  Filter,
  Check,
  Sun
} from 'lucide-react';

export default function RoadmapPage() {
  const { tasks, completedTaskIds, toggleTask, milestones, progressPercentage } = useOnboarding();
  const [selectedMilestone, setSelectedMilestone] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTasks = tasks.filter(task => {
    const matchesMilestone = selectedMilestone === 'all' || task.milestoneId === selectedMilestone;
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    return matchesMilestone && matchesCategory;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'admin':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">Administratif</span>;
      case 'tech':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/15 text-brand-300 border border-brand-500/30">Tech & Setup</span>;
      case 'team':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Équipe & Rituels</span>;
      case 'culture':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/15 text-orange-300 border border-orange-500/30">Culture & Codex</span>;
      case 'project':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">Projet & Code</span>;
      default:
        return null;
    }
  };

  const getMilestoneIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sun className="w-5 h-5 text-brand-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-brand-400" />;
      case 'GitPullRequest': return <GitPullRequest className="w-5 h-5 text-brand-300" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-amber-400" />;
      case 'Award': return <Award className="w-5 h-5 text-emerald-400" />;
      default: return <MapPin className="w-5 h-5 text-brand-400" />;
    }
  };

  return (
    <div className="space-y-8 py-2">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/15 text-brand-300 text-xs font-bold mb-2 border border-brand-500/25">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              <span>Programme d’intégration pas à pas</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              Roadmap J+1 à 30 : Actions quotidiennes
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Chaque étape a été pensée avec les équipes de <strong>Data Insight</strong> pour te garantir une montée en compétences progressive, sans surcharge.
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs text-slate-400 block font-mono">Progression Globale</span>
            <span className="text-3xl font-black bg-gradient-to-r from-brand-400 via-brand-300 to-accent-sand bg-clip-text text-transparent">
              {progressPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar Widget */}
      <ProgressBar />

      {/* Milestone Pills Navigation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-brand-400" />
            <span>Filtrer par phase clé :</span>
          </h2>
          {selectedMilestone !== 'all' && (
            <button
              onClick={() => setSelectedMilestone('all')}
              className="text-xs text-brand-400 hover:underline font-semibold cursor-pointer"
            >
              Afficher les 30 jours
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            onClick={() => setSelectedMilestone('all')}
            className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-left cursor-pointer ${
              selectedMilestone === 'all'
                ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-carbon-950 border-brand-400 shadow-md shadow-brand-500/20'
                : 'bg-carbon-850 border-white/5 text-slate-300 hover:bg-carbon-800'
            }`}
          >
            <div className="font-extrabold">Vue Complète</div>
            <div className="text-[10px] opacity-80 font-normal">Tous les 30 jours</div>
          </button>

          {milestones.map((m) => {
            const isSelected = selectedMilestone === m.id;
            const milestoneTasks = tasks.filter(t => t.milestoneId === m.id);
            const doneTasks = milestoneTasks.filter(t => completedTaskIds.includes(t.id));
            const isFinished = milestoneTasks.length > 0 && doneTasks.length === milestoneTasks.length;

            return (
              <button
                key={m.id}
                onClick={() => setSelectedMilestone(m.id)}
                className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-left relative overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'bg-brand-500 text-carbon-950 border-brand-400 shadow-md shadow-brand-500/20'
                    : isFinished
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200 hover:bg-emerald-950/60'
                    : 'bg-carbon-850 border-white/5 text-slate-300 hover:bg-carbon-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold truncate">{m.daysRange}</span>
                  {isFinished && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className={`text-[10px] truncate ${isSelected ? 'text-carbon-950/80' : 'text-slate-400'}`}>
                  {doneTasks.length}/{milestoneTasks.length} terminés
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        <span className="text-slate-500 shrink-0 font-bold">Catégorie :</span>
        {[
          { id: 'all', label: 'Toutes' },
          { id: 'tech', label: '💻 Tech & Setup' },
          { id: 'admin', label: '📋 Administratif' },
          { id: 'team', label: '🤝 Équipe' },
          { id: 'project', label: '🚀 Projets & PR' },
          { id: 'culture', label: '📚 Culture' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap border transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
                : 'bg-carbon-850 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Task List by Milestone */}
      <div className="space-y-8">
        {milestones
          .filter(m => selectedMilestone === 'all' || selectedMilestone === m.id)
          .map((milestone) => {
            const currentMilestoneTasks = filteredTasks.filter(t => t.milestoneId === milestone.id);
            if (currentMilestoneTasks.length === 0) return null;

            return (
              <div key={milestone.id} className="space-y-4">
                {/* Milestone Section Title */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-carbon-850 border border-white/10 flex items-center justify-center">
                      {getMilestoneIcon(milestone.iconName)}
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <span>{milestone.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 font-mono border border-brand-500/20">
                          {milestone.daysRange}
                        </span>
                      </h2>
                      <p className="text-xs text-slate-400">{milestone.description}</p>
                    </div>
                  </div>
                </div>

                {/* Tasks Cards */}
                <div className="grid grid-cols-1 gap-3">
                  {currentMilestoneTasks.map((task) => {
                    const isDone = completedTaskIds.includes(task.id);

                    return (
                      <div
                        key={task.id}
                        className={`glass-panel p-5 rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          isDone
                            ? 'bg-carbon-900/40 border-emerald-500/20 opacity-75'
                            : 'bg-carbon-850 border-white/10 hover:border-brand-500/40'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className="mt-0.5 shrink-0 text-slate-400 hover:text-brand-400 transition-colors cursor-pointer"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-6 h-6 text-brand-400" />
                            ) : (
                              <Circle className="w-6 h-6 text-slate-500 hover:text-white" />
                            )}
                          </button>

                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-carbon-900 text-slate-300 border border-white/5">
                                Jour {task.dayNumber}
                              </span>
                              {getCategoryBadge(task.category)}
                              {task.estimatedMinutes && (
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {task.estimatedMinutes} min
                                </span>
                              )}
                            </div>

                            <h3 className={`text-sm sm:text-base font-bold ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                              {task.title}
                            </h3>

                            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                              {task.description}
                            </p>
                          </div>
                        </div>

                        {/* Action link if available */}
                        {task.actionUrl && (
                          <div className="shrink-0 self-end sm:self-center pl-10 sm:pl-0">
                            <Link
                              href={task.actionUrl}
                              className="text-xs px-4 py-2.5 rounded-2xl bg-carbon-900 hover:bg-brand-500 hover:text-carbon-950 text-slate-200 border border-white/10 font-bold transition-all inline-flex items-center gap-1.5 shadow-sm"
                            >
                              <span>{task.actionLabel || 'Accéder'}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

    </div>
  );
}
