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
  CheckCircle2, 
  Circle, 
  Clock, 
  ExternalLink,
  MessageSquare,
  Calendar,
  Coffee,
  AlertCircle,
  ArrowRight,
  Sun
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

  const employeeName = currentUser 
    ? `${currentUser.firstName} ${currentUser.lastName}` 
    : 'Alexandre Moreau';
  const role = currentUser?.role || 'Data Engineer Junior';
  const department = currentUser?.department || 'Data Platform';
  const contractSigned = Boolean(currentUser?.contractSigned);

  const nextTasks = tasks.filter(t => !completedTaskIds.includes(t.id)).slice(0, 4);

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="relative glass-panel p-6 sm:p-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/15 text-brand-300 text-xs font-bold border border-brand-500/25">
              <Sun className="w-3.5 h-3.5 text-brand-400" />
              <span>Espace Salarié • Jour 1</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ravi de t’accueillir, <span className="bg-gradient-to-r from-brand-400 via-brand-300 to-accent-sand bg-clip-text text-transparent">{employeeName}</span> ! 👋
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
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold hover:bg-amber-500/30 transition-all shadow-md"
              >
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Contrat en attente de signature</span>
              </Link>
            ) : (
              <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-md">
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
            <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6 text-brand-400" />
            </div>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1 group-hover:text-brand-300">
              Explorer <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Roadmap J+1 à 30</h2>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Toutes tes actions quotidiennes, installations logicielles et jalons jusqu’au bilan du 1er mois.
          </p>
          <div className="flex items-center gap-2 text-xs text-brand-300 font-bold pt-2 border-t border-white/5">
            <span>{completedTaskIds.length} / {tasks.length} tâches terminées</span>
          </div>
        </Link>

        {/* Card 2: Codex */}
        <Link href="/codex" className="glass-card p-6 rounded-3xl group border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-carbon-800 border border-white/10 flex items-center justify-center text-brand-300 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-brand-400" />
            </div>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1 group-hover:text-brand-300">
              Consulter <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Codex & Documentation</h2>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Culture Data Insight, stack technique (Snowflake, dbt), rituels, politique télétravail et avantages.
          </p>
          <div className="flex items-center gap-2 text-xs text-brand-300 font-bold pt-2 border-t border-white/5">
            <span>5 guides essentiels disponibles</span>
          </div>
        </Link>

        {/* Card 3: Buddy */}
        <Link href="/buddy" className="glass-card p-6 rounded-3xl group border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform">
              <UserCheck className="w-6 h-6 text-brand-400" />
            </div>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1 group-hover:text-brand-300">
              Voir le profil <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Mon Parrain (Buddy)</h2>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            {currentBuddy?.name || 'Camille Reynaud'} est ton interlocuteur dédié pour t’épauler au quotidien.
          </p>
          <div className="flex items-center gap-2 text-xs text-brand-300 font-bold pt-2 border-t border-white/5">
            <Coffee className="w-3.5 h-3.5" />
            <span>Café d’accueil prévu Jour 1</span>
          </div>
        </Link>

      </div>

      {/* Main Grid: Priority Checklist + Buddy Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Next Tasks Checklist */}
        <div className="lg:col-span-8 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-400" />
                <span>Tes prochaines actions prioritaires</span>
              </h2>
              <p className="text-xs text-slate-400">
                Coche les actions au fur et à mesure de ta journée pour mettre à jour ta progression.
              </p>
            </div>
            <Link
              href="/roadmap"
              className="text-xs text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1"
            >
              Voir les 30 jours
            </Link>
          </div>

          <div className="space-y-3">
            {nextTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Sparkles className="w-8 h-8 text-brand-400 mx-auto animate-bounce" />
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
                        ? 'bg-carbon-900/40 border-white/5 opacity-60'
                        : 'bg-carbon-850 border-white/10 hover:border-brand-500/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="mt-0.5 text-slate-400 hover:text-brand-400 transition-colors cursor-pointer"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-brand-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500 hover:text-white" />
                        )}
                      </button>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/15 text-brand-300 border border-brand-500/20">
                            Jour {task.dayNumber}
                          </span>
                          <h4 className={`text-xs sm:text-sm font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
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
                        className="shrink-0 text-xs px-3.5 py-1.5 rounded-xl bg-carbon-900 hover:bg-brand-500 hover:text-carbon-950 text-slate-200 border border-white/5 font-bold transition-all hidden sm:inline-flex items-center gap-1"
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
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-brand-400" />
                  <span>Ton Parrain Attitré</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 font-semibold border border-brand-500/25">
                  Disponible
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentBuddy.avatarUrl}
                  alt={currentBuddy.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-brand-500/30 shadow-md"
                />
                <div>
                  <h3 className="font-bold text-white text-sm">{currentBuddy.name}</h3>
                  <p className="text-xs text-brand-300 font-medium">{currentBuddy.role}</p>
                  <p className="text-[11px] text-slate-500">{currentBuddy.department}</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 italic bg-carbon-900 p-3 rounded-2xl border border-white/5">
                "{currentBuddy.welcomeMessage}"
              </p>

              <div className="space-y-2.5 text-xs">
                <a
                  href={`https://slack.com/app_redirect?channel=${currentBuddy.slackHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-white font-medium border border-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-brand-400" />
                  <span>Envoyer un Slack ({currentBuddy.slackHandle})</span>
                </a>

                <a
                  href={currentBuddy.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 text-carbon-950 font-extrabold flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-500/20 cursor-pointer hover:opacity-95"
                >
                  <Calendar className="w-4 h-4 text-carbon-950" />
                  <span>Planifier notre café d’accueil</span>
                </a>
              </div>
            </div>
          )}

          {/* Quick Help Card */}
          <div className="glass-card p-5 rounded-3xl border border-white/5 space-y-2 text-xs">
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
