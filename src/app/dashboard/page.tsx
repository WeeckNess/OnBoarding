'use client';

import React from 'react';
import Link from 'next/link';
import { useOnboarding } from '@/context/OnboardingContext';
import ProgressBar from '@/components/ProgressBar';
import { 
  Sparkles, 
  MapPin, 
  BookOpen, 
  UserCheck, 
  FileCheck2, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ExternalLink,
  MessageSquare,
  Calendar,
  Coffee,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  const { 
    currentUser, 
    currentBuddy, 
    tasks, 
    completedTaskIds, 
    toggleTask,
    progressPercentage 
  } = useOnboarding();

  // If no user is logged in, use fallback or mock
  const employeeName = currentUser 
    ? `${currentUser.firstName} ${currentUser.lastName}` 
    : 'Alexandre Moreau';
  const role = currentUser?.role || 'Data Engineer Junior';
  const department = currentUser?.department || 'Data Platform';
  const contractSigned = Boolean(currentUser?.contractSigned);

  // Day 1 / Priority tasks
  const dayOneTasks = tasks.filter(t => t.dayNumber === 1);
  const nextTasks = tasks.filter(t => !completedTaskIds.includes(t.id)).slice(0, 4);

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="relative glass-panel p-6 sm:p-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-accent-cyan/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Espace Onboarding Salarié • Jour 1</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ravi de t’accueillir, <span className="bg-gradient-to-r from-brand-400 to-accent-cyan bg-clip-text text-transparent">{employeeName}</span> ! 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Bienvenue chez <strong>Data Insight</strong> au sein de l’équipe <strong>{department}</strong>. Ton parcours d’intégration est prêt.
            </p>
          </div>

          {/* Status summary pill */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {!contractSigned ? (
              <Link
                href="/contracts"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold hover:bg-amber-500/30 transition-all"
              >
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Contrat en attente de signature</span>
              </Link>
            ) : (
              <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Contrat de travail signé</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar Widget */}
      <ProgressBar />

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Roadmap */}
        <Link href="/roadmap" className="glass-card p-6 rounded-3xl group border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6 text-accent-cyan" />
            </div>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1 group-hover:text-brand-300">
              Explorer <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Roadmap J+1 à 30</h2>
          <p className="text-xs text-slate-400 mb-4">
            Toutes tes actions quotidiennes, installations logicielles et jalons jusqu’au bilan du 1er mois.
          </p>
          <div className="flex items-center gap-2 text-xs text-brand-300 font-medium pt-2 border-t border-white/5">
            <span>{completedTaskIds.length} / {tasks.length} tâches terminées</span>
          </div>
        </Link>

        {/* Card 2: Codex */}
        <Link href="/codex" className="glass-card p-6 rounded-3xl group border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-purple-300" />
            </div>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1 group-hover:text-purple-300">
              Consulter <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Codex & Documentation</h2>
          <p className="text-xs text-slate-400 mb-4">
            Culture Data Insight, stack technique (Snowflake, dbt), rituels, politique télétravail et avantages.
          </p>
          <div className="flex items-center gap-2 text-xs text-purple-300 font-medium pt-2 border-t border-white/5">
            <span>5 guides essentiels disponibles</span>
          </div>
        </Link>

        {/* Card 3: Buddy */}
        <Link href="/buddy" className="glass-card p-6 rounded-3xl group border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <UserCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1 group-hover:text-emerald-300">
              Voir le profil <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Mon Parrain (Buddy)</h2>
          <p className="text-xs text-slate-400 mb-4">
            {currentBuddy?.name || 'Camille Reynaud'} est ton interlocuteur dédié pour t’épauler au quotidien.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium pt-2 border-t border-white/5">
            <Coffee className="w-3.5 h-3.5" />
            <span>Café d’accueil prévu Jour 1</span>
          </div>
        </Link>

      </div>

      {/* Main Grid: Priority Checklist + Buddy Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Next Tasks Checklist */}
        <div className="lg:col-span-8 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent-cyan" />
                <span>Tes prochaines actions prioritaires</span>
              </h2>
              <p className="text-xs text-slate-400">
                Coche les actions au fur et à mesure de ta journée pour mettre à jour ta progression.
              </p>
            </div>
            <Link
              href="/roadmap"
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
            >
              Voir les 30 jours
            </Link>
          </div>

          <div className="space-y-3">
            {nextTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Sparkles className="w-8 h-8 text-accent-cyan mx-auto animate-bounce" />
                <p className="font-bold text-white">Félicitations ! Toutes les tâches sont complétées 🎉</p>
                <p className="text-xs">Tu es désormais 100% autonome sur la plateforme.</p>
              </div>
            ) : (
              nextTasks.map((task) => {
                const isCompleted = completedTaskIds.includes(task.id);
                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                      isCompleted
                        ? 'bg-slate-900/30 border-white/5 opacity-60'
                        : 'bg-slate-900/80 border-white/10 hover:border-brand-500/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="mt-0.5 text-slate-400 hover:text-accent-cyan transition-colors"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500 hover:text-white" />
                        )}
                      </button>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300">
                            Jour {task.dayNumber}
                          </span>
                          <h4 className={`text-xs sm:text-sm font-semibold ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                            {task.title}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    {task.actionUrl && (
                      <Link
                        href={task.actionUrl}
                        className="shrink-0 text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5 font-medium transition-colors hidden sm:inline-flex items-center gap-1"
                      >
                        <span>{task.actionLabel || 'Ouvrir'}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Quick Buddy Widget */}
        <div className="lg:col-span-4 space-y-6">
          {currentBuddy && (
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Ton Parrain Attitré</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                  Disponible
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentBuddy.avatarUrl}
                  alt={currentBuddy.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/30"
                />
                <div>
                  <h3 className="font-bold text-white text-sm">{currentBuddy.name}</h3>
                  <p className="text-xs text-slate-300">{currentBuddy.role}</p>
                  <p className="text-[11px] text-slate-500">{currentBuddy.department}</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 italic bg-slate-900/60 p-3 rounded-xl border border-white/5">
                "{currentBuddy.welcomeMessage}"
              </p>

              <div className="space-y-2 text-xs">
                <a
                  href={`https://slack.com/app_redirect?channel=${currentBuddy.slackHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium border border-white/10 flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-brand-400" />
                  <span>Envoyer un Slack ({currentBuddy.slackHandle})</span>
                </a>

                <a
                  href={currentBuddy.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold flex items-center justify-center gap-2 transition-colors shadow-md shadow-brand-600/20"
                >
                  <Calendar className="w-4 h-4 text-accent-cyan" />
                  <span>Planifier notre café d’accueil</span>
                </a>
              </div>
            </div>
          )}

          {/* Quick Help Card */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-2 text-xs">
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <span>Besoin d’aide supplémentaire ?</span>
            </h3>
            <p className="text-slate-400">
              L’équipe support RH et l’équipe IT sont joignables sur le canal Slack <strong className="text-white">#ask-hr-it</strong> à tout moment.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
