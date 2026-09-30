'use client';

import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Coffee,
  Heart,
  Mail,
  MessageCircle,
  MessageSquare,
  Sparkles,
  Users,
  Wrench,
} from 'lucide-react';

const TOPICS = [
  {
    icon: Coffee,
    title: 'La vie au bureau',
    description: 'Les habitudes de l’équipe, les bons plans déjeuner et les petits repères du quotidien.',
  },
  {
    icon: Wrench,
    title: 'Les outils et la data',
    description: 'Tes accès, la stack, les méthodes de travail et tes premières contributions.',
  },
  {
    icon: Users,
    title: 'Les bonnes personnes',
    description: 'Savoir qui contacter et comment fonctionne l’équipe.',
  },
  {
    icon: MessageCircle,
    title: 'Toutes tes questions',
    description: 'Partager tes premières impressions et demander un conseil en toute simplicité.',
  },
];

export default function BuddyPage() {
  const { currentBuddy } = useOnboarding();

  if (!currentBuddy) return null;

  return (
    <div className="space-y-7 py-2">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-400">
            <Sparkles className="h-3.5 w-3.5" /> Ton arrivée chez Data Insight
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Mon Buddy</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Une personne de l’équipe à tes côtés pour répondre à tes questions et t’aider à prendre tes marques.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5 text-xs font-medium text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Ton contact dédié
        </div>
      </header>

      <section data-tour="buddy-profile" className="glass-panel relative overflow-hidden rounded-3xl border border-white/10 shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-brand-500/[0.07] blur-3xl" />
        <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_280px] lg:gap-8">
          <div className="min-w-0">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative mx-auto shrink-0 sm:mx-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={currentBuddy.avatarUrl} alt={currentBuddy.name} className="h-24 w-24 rounded-[26px] object-cover ring-1 ring-white/10 sm:h-28 sm:w-28" />
                <span className="absolute -bottom-2 -right-2 inline-flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-[#17181b] bg-emerald-400 text-[#10251a]" aria-label="Disponible">
                  <Check className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-400">Ton Buddy</span>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white">{currentBuddy.name}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-200">{currentBuddy.role}</p>
                <p className="mt-1 text-xs text-slate-500">{currentBuddy.department}<span className="mx-2 text-slate-700">·</span>{currentBuddy.seniority}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/[0.06] bg-black/15 p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Un mot de {currentBuddy.name.split(' ')[0]}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">« {currentBuddy.welcomeMessage} »</p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p className="text-xs leading-relaxed text-slate-400">{currentBuddy.bio}</p>
              </div>
              <div className="sm:max-w-[245px]">
                <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <Heart className="h-3.5 w-3.5 text-brand-400" /> En dehors du travail
                </div>
                <div className="flex flex-wrap gap-1.5 sm:justify-end">
                  {currentBuddy.hobbies.map((hobby) => (
                    <span key={hobby} className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[10px] text-slate-300">{hobby}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="flex flex-col rounded-2xl border border-brand-500/15 bg-carbon-900/60 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-brand-300">
              <Coffee className="h-4 w-4" />
              <h3 className="text-sm font-bold text-white">On fait connaissance ?</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">Réserve un premier moment ensemble. C’est l’occasion de faire le tour de tes questions, sans ordre du jour.</p>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/[0.03] px-3 py-2.5 text-[11px] leading-relaxed text-slate-400">
              <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" />
              <span><strong className="font-semibold text-slate-200">Ses disponibilités</strong><br />{currentBuddy.coffeeAvailability}</span>
            </div>
            <div className="mt-auto space-y-2 pt-4">
              <a data-tour="buddy-coffee" href={currentBuddy.meetingLink} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 px-4 py-3 text-xs font-extrabold text-carbon-950 shadow-lg shadow-brand-500/10 transition hover:brightness-110">
                <CalendarDays className="h-4 w-4" /> Réserver un café · 30 min <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <div className="grid grid-cols-2 gap-2">
                <a href={`https://slack.com/app_redirect?channel=${encodeURIComponent(currentBuddy.slackHandle)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-brand-500/25 hover:text-white">
                  <MessageSquare className="h-3.5 w-3.5 text-brand-400" /> Slack
                </a>
                <a href={`mailto:${currentBuddy.email}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-brand-500/25 hover:text-white">
                  <Mail className="h-3.5 w-3.5 text-brand-400" /> E-mail
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <div className="space-y-5">
        <section className="glass-panel rounded-3xl border border-white/10 p-5 sm:p-6 shadow-lg">
          <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-400">Pendant ton premier mois</span>
              <h2 className="mt-1 text-lg font-extrabold text-white">Vos temps forts</h2>
            </div>
            <CalendarDays className="h-5 w-5 text-slate-500" />
          </div>

          <div className="relative mt-5 space-y-3">
            {currentBuddy.syncRituals.map((ritual, index) => (
              <article key={`${ritual.period}-${ritual.title}`} className={`relative flex gap-3 rounded-2xl border p-2.5 transition sm:gap-4 ${index < currentBuddy.syncRituals.length - 1 ? 'after:absolute after:-bottom-10 after:left-[26px] after:top-7 after:z-0 after:w-px after:bg-gradient-to-b after:from-brand-500/35 after:to-brand-500/15' : ''} ${index === 0 ? 'border-brand-500/20 bg-brand-500/[0.04]' : 'border-transparent hover:bg-white/[0.025]'}`}>
                <div className={`relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-[10px] font-bold ${index === 0 ? 'border-brand-300/60 bg-brand-500/15 text-brand-100 shadow-md shadow-brand-500/10' : 'border-brand-500/20 bg-carbon-900 text-brand-300'}`}>{String(index + 1).padStart(2, '0')}</div>
                <div className="min-w-0 flex-1 pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-brand-500/10 px-2 py-1 text-[10px] font-semibold text-brand-300">{ritual.period}</span>
                    {index === 0 && <span className="rounded-md border border-brand-500/20 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-brand-300">Premier rendez-vous</span>}
                    <h3 className="text-xs font-bold text-white sm:text-sm">{ritual.title}</h3>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{ritual.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-3xl border border-white/10 p-5 sm:p-6 shadow-lg">
          <div className="border-b border-white/[0.06] pb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-400">Un repère tout au long de ton arrivée</span>
            <h2 className="mt-1 text-lg font-extrabold text-white">Les sujets que vous pouvez aborder ensemble</h2>
            <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-slate-400">Pas besoin d’attendre un rendez-vous pour poser une question. Ton Buddy peut t’aider à trouver tes marques, côté équipe comme côté métier.</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {TOPICS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="min-h-36 rounded-2xl border border-white/[0.06] bg-black/10 p-4 transition hover:border-brand-500/20">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400"><Icon className="h-4 w-4" /></div>
                <div>
                  <h3 className="mt-3 text-sm font-bold text-slate-200">{title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
