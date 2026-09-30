'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Play,
  Sparkles,
  Video,
  X,
} from 'lucide-react';

type Question = {
  prompt: string;
  answers: string[];
  correct: number;
};

type Module = {
  id: string;
  category: string;
  title: string;
  description: string;
  duration: string;
  color: string;
  questions: Question[];
};

const MODULES: Module[] = [
  {
    id: 'culture',
    category: 'Bienvenue chez Data Insight',
    title: 'Comprendre notre métier',
    description: 'Le rôle de la donnée, nos missions et la valeur créée pour nos clients.',
    duration: '6 min',
    color: 'from-amber-500/25 via-orange-500/10 to-carbon-850',
    questions: [
      {
        prompt: 'Quel est l’objectif principal d’un projet data chez Data Insight ?',
        answers: ['Collecter un maximum de données', 'Aider le client à prendre de meilleures décisions', 'Remplacer tous les outils du client'],
        correct: 1,
      },
      {
        prompt: 'Quand faut-il impliquer le client dans un projet ?',
        answers: ['Dès le cadrage et tout au long du projet', 'Uniquement à la livraison', 'Seulement en cas de blocage'],
        correct: 0,
      },
    ],
  },
  {
    id: 'project',
    category: 'Les bases du métier',
    title: 'Les étapes d’un projet data',
    description: 'Du besoin métier à la mise en production : les étapes et les bons réflexes.',
    duration: '8 min',
    color: 'from-sky-500/25 via-cyan-500/10 to-carbon-850',
    questions: [
      {
        prompt: 'Par quoi commence généralement un projet data ?',
        answers: ['Par le choix d’un outil', 'Par la compréhension du besoin métier', 'Par la création du tableau de bord'],
        correct: 1,
      },
      {
        prompt: 'Que valide-t-on avant de mettre une solution en production ?',
        answers: ['La qualité des données et les résultats avec les utilisateurs', 'Uniquement la mise en page', 'Le nombre de lignes de code'],
        correct: 0,
      },
    ],
  },
  {
    id: 'quality',
    category: 'Qualité & bonnes pratiques',
    title: 'La qualité des données au quotidien',
    description: 'Repérer les anomalies, documenter ses choix et construire des données fiables.',
    duration: '7 min',
    color: 'from-emerald-500/25 via-teal-500/10 to-carbon-850',
    questions: [
      {
        prompt: 'Que faire lorsqu’une donnée semble incohérente ?',
        answers: ['La corriger sans laisser de trace', 'La vérifier, documenter le constat et prévenir l’équipe', 'L’ignorer si le rapport s’affiche'],
        correct: 1,
      },
      {
        prompt: 'Pourquoi documenter un jeu de données ?',
        answers: ['Pour que l’équipe comprenne son origine et son usage', 'Pour augmenter sa taille', 'Pour éviter les échanges avec le métier'],
        correct: 0,
      },
    ],
  },
];

export default function ElearningPage() {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [mode, setMode] = useState<'video' | 'quiz'>('video');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [completedModules, setCompletedModules] = useState<string[]>([]);

  const selectedModule = MODULES.find((module) => module.id === activeModule);
  const correctAnswers = selectedModule
    ? selectedModule.questions.reduce((score, question, index) => score + (answers[index] === question.correct ? 1 : 0), 0)
    : 0;

  const openModule = (moduleId: string, nextMode: 'video' | 'quiz') => {
    setActiveModule(moduleId);
    setMode(nextMode);
    setAnswers({});
    setQuizSubmitted(false);
  };

  const markComplete = (moduleId: string) => {
    setCompletedModules((current) => current.includes(moduleId) ? current : [...current, moduleId]);
  };

  const closeModule = () => {
    setActiveModule(null);
    setAnswers({});
    setQuizSubmitted(false);
  };

  return (
    <div className="space-y-7 py-2">
      <header data-tour="elearning-header" className="glass-panel rounded-3xl border border-white/10 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-300">
              <GraduationCap className="h-3.5 w-3.5" />
              Ton parcours d’apprentissage
            </span>
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white">E-Learning</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Découvre Data Insight, les métiers de la data et les réflexes qui font avancer un projet.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/5 bg-carbon-850/70 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-white">{completedModules.length}<span className="text-slate-500">/{MODULES.length}</span></p>
              <p className="text-[11px] text-slate-400">modules terminés</p>
            </div>
          </div>
        </div>
      </header>

      <section className="space-y-4" aria-labelledby="modules-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand-400">À découvrir</p>
            <h2 id="modules-title" className="mt-1 text-xl font-extrabold text-white">Les modules</h2>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400"><Clock3 className="h-3.5 w-3.5" /> Environ 21 min au total</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {MODULES.map((module, index) => {
            const isComplete = completedModules.includes(module.id);
            return (
              <article key={module.id} className="glass-panel flex flex-col overflow-hidden rounded-3xl border border-white/10 shadow-lg transition-colors hover:border-brand-500/30">
                <div className={`relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br ${module.color}`}>
                  <div className="absolute -right-8 -top-12 h-40 w-40 rounded-full border border-white/10" />
                  <div className="absolute -right-2 -top-6 h-28 w-28 rounded-full border border-white/10" />
                  <div className="absolute left-5 top-4 text-[10px] font-bold uppercase tracking-wider text-white/60">Module 0{index + 1}</div>
                  {isComplete ? (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/30"><Check className="h-5 w-5" /></div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white backdrop-blur-sm"><Play className="ml-0.5 h-5 w-5 fill-current" /></div>
                  )}
                  <span className="absolute bottom-3 right-3 rounded-lg bg-black/30 px-2 py-1 text-[10px] font-semibold text-white/80 backdrop-blur-sm">{module.duration}</span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-brand-300">{module.category}</span>
                    {isComplete && <span className="text-[10px] font-bold text-emerald-300">Terminé</span>}
                  </div>
                  <h3 className="mt-2 text-base font-bold text-white">{module.title}</h3>
                  <p className="mt-1.5 min-h-10 text-xs leading-relaxed text-slate-400">{module.description}</p>

                  <div className="mt-4 flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1"><Video className="h-3.5 w-3.5" /> Vidéo</span>
                    <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> Quiz · {module.questions.length} questions</span>
                    <span className="ml-auto inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {module.duration}</span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button onClick={() => openModule(module.id, 'video')} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-3 py-2.5 text-xs font-bold text-carbon-950 transition hover:bg-brand-400">
                      <Play className="h-3.5 w-3.5 fill-current" /> Voir la vidéo
                    </button>
                    <button onClick={() => openModule(module.id, 'quiz')} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-carbon-850 px-3 py-2.5 text-xs font-bold text-slate-200 transition hover:border-brand-500/30 hover:text-brand-300">
                      Faire le quiz <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {selectedModule && (
        <section className="glass-panel scroll-mt-6 rounded-3xl border border-brand-500/20 p-5 sm:p-7 shadow-xl" aria-live="polite">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-white/5 pb-5">
            <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-400">{mode === 'video' ? 'Vidéo' : 'Questionnaire'}</p>
              <h2 className="mt-1 text-xl font-extrabold text-white">{selectedModule.title}</h2>
            </div>
            <button onClick={closeModule} className="inline-flex items-center gap-1.5 self-start rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:text-white">
              <X className="h-3.5 w-3.5" /> Fermer {mode === 'quiz' ? 'le questionnaire' : 'le module'}
            </button>
          </div>

          {mode === 'video' ? (
            <div className="mt-5 grid gap-5 md:grid-cols-[1.4fr_1fr] md:items-center">
              <div className={`relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br ${selectedModule.color}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.10),transparent_50%)]" />
                <div className="relative flex flex-col items-center gap-3 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20"><Play className="ml-1 h-6 w-6 fill-current" /></div>
                  <span className="text-xs font-semibold text-white/70">{selectedModule.title}</span>
                </div>
                <span className="absolute bottom-3 left-3 rounded-lg bg-black/30 px-2.5 py-1 text-[10px] text-white/80">{selectedModule.duration}</span>
              </div>
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-slate-300">{selectedModule.description}</p>
                <p className="text-xs leading-relaxed text-slate-500">Un module pour acquérir les repères essentiels et les appliquer dans tes missions au quotidien.</p>
                <button onClick={() => markComplete(selectedModule.id)} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-carbon-950 transition hover:bg-brand-400">
                  <Check className="h-4 w-4" /> {completedModules.includes(selectedModule.id) ? 'Module marqué comme vu' : 'Marquer comme vu'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {selectedModule.questions.map((question, questionIndex) => (
                <fieldset key={question.prompt} className="rounded-2xl border border-white/5 bg-carbon-850/50 p-4 sm:p-5">
                  <legend className="max-w-full px-1 text-sm font-bold leading-relaxed text-white">{questionIndex + 1}. {question.prompt}</legend>
                  <div className="mt-3 space-y-2">
                    {question.answers.map((answer, answerIndex) => {
                      const isSelected = answers[questionIndex] === answerIndex;
                      const isCorrect = question.correct === answerIndex;
                      const showResult = quizSubmitted && (isSelected || isCorrect);
                      return (
                        <label key={answer} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-xs transition ${showResult && isCorrect ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : showResult && isSelected ? 'border-red-400/30 bg-red-400/10 text-red-200' : isSelected ? 'border-brand-500/40 bg-brand-500/10 text-white' : 'border-white/5 bg-black/10 text-slate-300 hover:border-white/15'}`}>
                          <input
                            type="radio"
                            name={`question-${questionIndex}`}
                            checked={isSelected}
                            disabled={quizSubmitted}
                            onChange={() => setAnswers((current) => ({ ...current, [questionIndex]: answerIndex }))}
                            className="accent-amber-400"
                          />
                          <span>{answer}</span>
                          {showResult && isCorrect && <Check className="ml-auto h-4 w-4 shrink-0" />}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}

              {quizSubmitted ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-brand-500/15 bg-brand-500/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-bold text-white">Résultat : <span className="text-brand-300">{correctAnswers}/{selectedModule.questions.length}</span><span className="ml-2 text-xs font-normal text-slate-400">{correctAnswers === selectedModule.questions.length ? 'Tout juste, bravo !' : 'Tu peux revoir les réponses ci-dessus.'}</span></p>
                  {correctAnswers === selectedModule.questions.length && <button onClick={() => markComplete(selectedModule.id)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-carbon-950 transition hover:bg-brand-400"><Check className="h-4 w-4" /> Valider le module</button>}
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[11px] text-slate-500">Choisis une réponse par question pour voir ton résultat.</p>
                  <button disabled={Object.keys(answers).length < selectedModule.questions.length} onClick={() => setQuizSubmitted(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-carbon-950 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-40">Voir mon résultat <ArrowRight className="h-3.5 w-3.5" /></button>
                </div>
              )}
            </div>
          )}
        </section>
      )}

    </div>
  );
}
