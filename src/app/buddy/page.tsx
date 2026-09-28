'use client';

import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { 
  UserCheck, 
  MessageSquare, 
  Mail, 
  Phone, 
  Calendar, 
  Coffee, 
  Sparkles, 
  Heart, 
  Clock, 
  CheckCircle2,
  HelpCircle,
  Award
} from 'lucide-react';

export default function BuddyPage() {
  const { currentBuddy, currentUser } = useOnboarding();

  if (!currentBuddy) {
    return null;
  }

  return (
    <div className="space-y-8 py-4">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Système de Parrainage Salarié</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Mon Buddy d’Intégration
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Chez <strong>Data Insight</strong>, chaque nouvel arrivant est jumelé avec un pair expérimenté pour faciliter son arrivée, répondre à ses questions sans tabou et accélérer sa prise en main.
          </p>
        </div>
      </div>

      {/* Main Grid: Profile Card + Sync Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Buddy Bio & Contacts */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Main Profile Box */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col items-center text-center space-y-3 border-b border-white/10 pb-6">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentBuddy.avatarUrl}
                  alt={currentBuddy.name}
                  className="w-24 h-24 rounded-3xl object-cover ring-4 ring-emerald-500/30 shadow-lg"
                />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white" title="En ligne / Disponible">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">{currentBuddy.name}</h2>
                <p className="text-xs font-semibold text-accent-cyan">{currentBuddy.role}</p>
                <p className="text-xs text-slate-400 mt-0.5">{currentBuddy.department} • {currentBuddy.seniority}</p>
              </div>

              {/* Coffee availability badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-white/10 text-xs text-amber-300">
                <Coffee className="w-3.5 h-3.5 text-amber-400" />
                <span>Créneau café : {currentBuddy.coffeeAvailability}</span>
              </div>
            </div>

            {/* Welcome Letter */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Message de bienvenue de ton Buddy
              </span>
              <p className="text-xs text-slate-200 italic leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                "{currentBuddy.welcomeMessage}"
              </p>
            </div>

            {/* Bio & Hobbies */}
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">À propos :</span>
                <p className="text-slate-300 leading-relaxed">{currentBuddy.bio}</p>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-red-400" /> Centres d'intérêt & Passions :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentBuddy.hobbies.map((hobby) => (
                    <span
                      key={hobby}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-white/5 text-[11px]"
                    >
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Direct Contact Buttons */}
            <div className="space-y-2.5 pt-2 border-t border-white/10">
              <a
                href={currentBuddy.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Réserver un café d’accueil (30 min)</span>
              </a>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://slack.com/app_redirect?channel=${currentBuddy.slackHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
                  <span>Slack</span>
                </a>

                <a
                  href={`mailto:${currentBuddy.email}`}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>Email</span>
                </a>
              </div>
            </div>

          </div>

        </div>

        {/* Right: Sync Rituals & Buddy Philosophy */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Rituals Timeline */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent-cyan" />
                <span>Programme des synchronisations avec ton Buddy</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Des rendez-vous réguliers prévus tout au long de tes 30 premiers jours pour faire le point.
              </p>
            </div>

            <div className="space-y-4">
              {currentBuddy.syncRituals.map((ritual, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-white/5 hover:border-emerald-500/30 transition-colors flex items-start gap-4"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-xs shrink-0 mt-0.5">
                    0{idx + 1}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300">
                        {ritual.period}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-white">
                        {ritual.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {ritual.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips for arriving employee */}
          <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-brand-300">
              <HelpCircle className="w-5 h-5 text-accent-cyan" />
              <h3 className="text-sm font-bold text-white">Que peux-tu demander à ton Buddy ?</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
                <strong className="text-white block font-semibold">☕ Vie d’entreprise & Locaux</strong>
                <p className="text-slate-400">Où manger le midi, comment fonctionne la machine à café, les habitudes du bureau.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
                <strong className="text-white block font-semibold">💻 Tech & Outils</strong>
                <p className="text-slate-400">Débloquer un accès GitHub/Snowflake, comprendre la CI/CD ou l’architecture.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
                <strong className="text-white block font-semibold">👥 Relations d’équipe</strong>
                <p className="text-slate-400">Qui contacter pour un sujet précis, comprendre les rôles de chacun dans l’orga.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
                <strong className="text-white block font-semibold">🎯 Retours & Conseils</strong>
                <p className="text-slate-400">Avoir un avis franc et bienveillant sur tes premières contributions.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
