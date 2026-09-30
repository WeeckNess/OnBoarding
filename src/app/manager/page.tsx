'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock,
  Search,
  Users,
  RefreshCw,
  Sun,
  ArrowUpRight,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { alertsFor, dateOnly, formatDate, readiness } from '@/lib/onboarding';
import { HEADCOUNT_PROJECTION } from '@/lib/integrations/lucca/mockDirectory';
import {
  Avatar,
  Badge,
  buttonClass,
  Empty,
  inputClass,
  Panel,
  ReadinessStrip,
  secondaryClass,
} from '@/components/manager/ui';

function daysFromToday(date: string, today: string) {
  return Math.round(
    (Date.parse(`${date.slice(0, 10)}T12:00:00Z`) -
      Date.parse(`${today}T12:00:00Z`)) /
      86400000
  );
}

export default function ManagerPage() {
  const { currentUser, records, refresh } = useOnboarding();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const today = dateOnly();
  const alerts = records.flatMap((r) =>
    alertsFor(r).map((a) => ({ ...a, employee: r.employee }))
  );
  const upcoming = records
    .filter((r) => r.employee.startDate > today)
    .sort((a, b) => a.employee.startDate.localeCompare(b.employee.startDate));
  const ready = records.filter((r) => readiness(r).ready);
  const inProgress = records.filter((r) => {
    const days = daysFromToday(r.employee.startDate, today);
    return days <= 0 && days > -30;
  });
  const completed = records.filter(
    (r) => daysFromToday(r.employee.startDate, today) <= -30
  );
  const nextArrival = upcoming[0];
  const upcomingTasks = records
    .flatMap((record) =>
      record.tasks
        .filter(
          (task) =>
            task.dueDate > today &&
            !record.employee.completedTaskIds.includes(task.id)
        )
        .map((task) => ({ task, employee: record.employee }))
    )
    .sort((a, b) => a.task.dueDate.localeCompare(b.task.dueDate))
    .slice(0, 5);
  const upcomingTaskCount = records.reduce(
    (count, record) =>
      count +
      record.tasks.filter(
        (task) =>
          task.dueDate > today &&
          !record.employee.completedTaskIds.includes(task.id)
      ).length,
    0
  );
  const visible = records
    .filter((r) => {
      const daysSinceStart = daysFromToday(r.employee.startDate, today);
      const matches =
        `${r.employee.firstName} ${r.employee.lastName} ${r.employee.role} ${r.employee.department}`
          .toLocaleLowerCase('fr')
          .includes(search.toLocaleLowerCase('fr'));
      return (
        matches &&
        (filter === 'all' ||
          (filter === 'upcoming' && r.employee.startDate > today) ||
          (filter === 'ongoing' && daysSinceStart <= 0 && daysSinceStart > -30) ||
          (filter === 'completed' && daysSinceStart <= -30) ||
          (filter === 'attention' && alertsFor(r).length > 0) ||
          (filter === 'ready' && readiness(r).ready))
      );
    })
    .sort((a, b) => {
      const aUpcoming = a.employee.startDate > today;
      const bUpcoming = b.employee.startDate > today;
      if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
      const byDate = a.employee.startDate.localeCompare(b.employee.startDate);
      return aUpcoming ? byDate : -byDate;
    });
  const showTeam = (value: string) => {
    setFilter(value);
    document
      .getElementById('team-onboardings')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  if (currentUser?.appRole !== 'manager') return null;
  return (
    <div className="space-y-8">
      <header className="relative glass-panel overflow-hidden rounded-3xl border border-white/10 p-6 shadow-2xl sm:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/15 px-3.5 py-1 text-xs font-bold text-brand-300">
              <Sun size={14} className="text-brand-400" />
              Espace Manager · Mon équipe
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Bonjour,{' '}
              <span className="text-white">
                {currentUser.firstName}
              </span>{' '}
              <span className="inline-block text-3xl">👋</span>
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-300">
              Une arrivée bien préparée, une équipe prête à l’accueillir.
              <br className="hidden sm:block" /> Retrouvez vos collaborateurs et
              les prochaines actions à réaliser.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-slate-400 hidden xl:block">
              {formatDate(today)}
            </span>
            <button
              className={secondaryClass}
              disabled={refreshing}
              onClick={async () => {
                setRefreshing(true);
                await refresh();
                setRefreshing(false);
              }}
            >
              <RefreshCw
                size={14}
                className={refreshing ? 'animate-spin' : ''}
              />
              Actualiser
            </button>
          </div>
        </div>
      </header>

      <div
        className="glass-panel grid grid-cols-2 gap-2 rounded-3xl border border-white/10 p-3 shadow-xl lg:grid-cols-5"
        aria-label="Vue d’ensemble de l’équipe"
      >
        {[
          {
            label: 'Collaborateurs suivis',
            value: records.length,
            icon: Users,
            filter: 'all',
            note: 'Dans votre équipe',
          },
          {
            label: 'Arrivées à venir',
            value: upcoming.length,
            icon: CalendarDays,
            filter: 'upcoming',
            note: 'À préparer ensemble',
          },
          {
            label: 'Arrivées préparées',
            value: ready.length,
            icon: CheckCircle2,
            filter: 'ready',
            note: 'Prêtes pour le premier jour',
          },
          {
            label: 'Points d’attention',
            value: alerts.length,
            icon: Bell,
            filter: 'attention',
            note: 'Actions et blocages',
          },
          {
            label: 'Effectif visé fin 2027',
            value: HEADCOUNT_PROJECTION.target,
            icon: TrendingUp,
            filter: 'all',
            note: `${HEADCOUNT_PROJECTION.baseline} fiches dans la base · +${HEADCOUNT_PROJECTION.target - HEADCOUNT_PROJECTION.baseline} visées`,
          },
        ].map(({ label, value, icon: Icon, filter: valueFilter, note }) => (
          <button
            key={label}
            onClick={() => showTeam(valueFilter)}
            className={`group rounded-2xl border p-3.5 text-left transition-colors sm:p-4 ${filter === valueFilter ? 'border-brand-500/20 bg-brand-500/[0.06]' : 'border-transparent hover:bg-white/[0.03]'}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-400">
                {label}
              </span>
              <Icon size={15} className="shrink-0 text-brand-400/80" />
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
              <strong className="text-3xl font-extrabold tracking-tight text-white">
                {value.toString().padStart(2, '0')}
              </strong>
              <span className="mb-1 text-[10px] text-slate-500 hidden sm:block">
                {note}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
        <Panel
          title="Prochaines tâches à faire"
          description="Échéances à venir dans les parcours de votre équipe"
          icon={CalendarDays}
          className="lg:col-span-7 flex flex-col border-brand-400/20"
          action={<Badge tone={upcomingTaskCount ? 'amber' : 'green'}>{upcomingTaskCount} à venir</Badge>}
        >
          <div className="flex-1 space-y-2">
            {upcomingTasks.length ? (
              upcomingTasks.map(({ task, employee }) => {
                const days = daysFromToday(task.dueDate, today);
                return (
                  <Link
                    key={`${employee.id}-${task.id}`}
                    href={`/manager/${employee.id}?tab=parcours`}
                    className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-carbon-850/80 p-3.5 transition-colors hover:border-brand-400/40 hover:bg-carbon-800"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-400/20 bg-brand-400/10 text-brand-300">
                      <Clock size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-white">
                        {task.title}
                      </span>
                      <span className="mt-1 block text-[11px] text-slate-400">
                        {employee.firstName} {employee.lastName} · {task.owner === 'manager' ? 'À faire par vous' : 'Étape collaborateur'}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className={`block text-xs font-bold ${days <= 2 ? 'text-amber-300' : 'text-brand-300'}`}>
                        {days === 1 ? 'Demain' : `Dans ${days} j`}
                      </span>
                      <span className="mt-1 block text-[10px] text-slate-500">{formatDate(task.dueDate)}</span>
                    </span>
                    <ArrowUpRight size={15} className="shrink-0 text-slate-500 transition-colors group-hover:text-brand-400" />
                  </Link>
                );
              })
            ) : (
              <Empty>Aucune tâche à venir pour le moment. Les échéances apparaîtront ici dès qu’un parcours sera planifié.</Empty>
            )}
          </div>
          {alerts.length > 0 && (
            <button
              onClick={() => showTeam('attention')}
              className="mt-4 flex w-full items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.07] px-3.5 py-3 text-left text-xs transition-colors hover:bg-amber-400/10"
            >
              <AlertCircle size={15} className="shrink-0 text-amber-300" />
              <span className="flex-1 font-semibold text-amber-100">{alerts.length} point{alerts.length > 1 ? 's' : ''} déjà à traiter</span>
              <span className="font-bold text-amber-300">Voir <ArrowRight size={12} className="ml-1 inline" /></span>
            </button>
          )}
        </Panel>
        <Panel
          title="Prochaine arrivée"
          description="Un premier jour à préparer"
          icon={CalendarDays}
          className="lg:col-span-5 flex flex-col"
          action={nextArrival && <Badge tone="amber">À venir</Badge>}
        >
          {nextArrival ? (
            <>
              <div className="flex items-center gap-4">
                <Avatar
                  firstName={nextArrival.employee.firstName}
                  lastName={nextArrival.employee.lastName}
                />
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-white">
                    {nextArrival.employee.firstName}{' '}
                    {nextArrival.employee.lastName}
                  </h2>
                  <p className="mt-1 text-xs text-brand-300">
                    {nextArrival.employee.role}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {nextArrival.employee.department}
                  </p>
                </div>
              </div>
              <div className="my-5 flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-carbon-850/80 px-4 py-3">
                <span className="flex items-center gap-2 text-xs text-slate-400">
                  <CalendarDays size={14} className="text-brand-400" />
                  {formatDate(nextArrival.employee.startDate)}
                </span>
                <span className="text-xs font-bold text-brand-300">
                  J−
                  {Math.ceil(
                    (Date.parse(nextArrival.employee.startDate) -
                      Date.parse(today)) /
                      86400000
                  )}
                </span>
              </div>
              <div className="mb-4">
                <div className="mb-3 flex justify-between text-[11px]">
                  <span className="text-slate-400">
                    Préparation du premier jour
                  </span>
                  <span className="font-mono text-brand-300">
                    {readiness(nextArrival).count}/4
                  </span>
                </div>
                <ReadinessStrip
                  checks={readiness(nextArrival).checks}
                  compact
                />
              </div>
              <Link
                className={`${buttonClass} mt-auto w-full`}
                href={`/manager/${nextArrival.employee.id}`}
              >
                Préparer son arrivée <ArrowRight size={14} />
              </Link>
            </>
          ) : (
            <Empty>
              Aucune nouvelle arrivée prévue. Retrouvez les intégrations en
              cours ci-dessous.
            </Empty>
          )}
        </Panel>
      </div>

      <section
        id="team-onboardings"
        aria-label="Liste des onboardings"
        className="scroll-mt-8 space-y-4"
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-white">
                Les parcours de mon équipe
              </h2>
              <Badge>{records.length} profils</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="amber">{upcoming.length} à venir</Badge>
              <Badge>{inProgress.length} en cours</Badge>
              <Badge tone="neutral">{completed.length} terminés</Badge>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-64">
              <Search
                size={15}
                className="absolute left-3.5 top-3.5 text-slate-500"
              />
              <input
                aria-label="Rechercher un collaborateur"
                className={`${inputClass} pl-10 !text-xs`}
                placeholder="Rechercher un collaborateur…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              aria-label="Filtrer les onboardings"
              className={`${inputClass} sm:w-48 !text-xs`}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Tous les parcours</option>
              <option value="upcoming">À venir</option>
              <option value="ongoing">En cours</option>
              <option value="completed">Terminés · J+30</option>
              <option value="attention">À traiter</option>
              <option value="ready">Arrivées préparées</option>
            </select>
          </div>
        </div>
        {!visible.length ? (
          <Empty>Aucun collaborateur ne correspond à ces critères.</Empty>
        ) : (
          <div className="glass-panel overflow-hidden rounded-3xl border border-white/10 shadow-xl">
            <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(150px,1fr)_minmax(145px,0.9fr)_minmax(155px,1fr)] gap-4 border-b border-white/10 bg-carbon-850/70 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 lg:grid">
              <span>Collaborateur</span>
              <span>Arrivée</span>
              <span>Essentiels J1</span>
              <span>À préparer</span>
            </div>
            <div className="divide-y divide-white/5">
              {visible.map((r) => {
                const prep = readiness(r);
                const alertsForRecord = alertsFor(r);
                const daysUntil = daysFromToday(r.employee.startDate, today);
                const isComplete = daysUntil <= -30;
                const tasksBeforeDayOne = r.tasks.filter(
                  (task) =>
                    task.dueDate <= r.employee.startDate &&
                    !r.employee.completedTaskIds.includes(task.id)
                ).length;
                const needsBeforeArrival = daysUntil > 0 && tasksBeforeDayOne > 0;
                const urgent = alertsForRecord.some((alert) => alert.urgent);
                const statusLabel = isComplete
                  ? 'Onboarding terminé'
                  : prep.ready
                    ? 'Prêt pour J1'
                    : urgent
                      ? 'Action nécessaire'
                      : 'En préparation';
                const statusTone = isComplete
                  ? 'neutral'
                  : prep.ready
                    ? 'green'
                    : urgent
                      ? 'red'
                      : 'amber';
                return (
                  <Link
                    key={r.employee.id}
                    href={`/manager/${r.employee.id}`}
                    className={`group grid min-w-0 grid-cols-1 gap-3 px-4 py-4 transition-colors hover:bg-white/[0.035] sm:px-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(150px,1fr)_minmax(145px,0.9fr)_minmax(155px,1fr)] lg:items-center ${isComplete ? 'opacity-50 hover:opacity-80' : ''}`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar firstName={r.employee.firstName} lastName={r.employee.lastName} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">
                          {r.employee.firstName} {r.employee.lastName}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-400">
                          {r.employee.role} · {r.employee.department}
                        </p>
                      </div>
                      <ArrowUpRight size={15} className="ml-auto shrink-0 text-slate-600 transition-colors group-hover:text-brand-400 lg:hidden" />
                    </div>
                    <div className="flex items-center justify-between gap-3 lg:block">
                      <div className={`inline-flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-[11px] font-semibold ${needsBeforeArrival ? 'border-dashed border-amber-400/50 bg-amber-400/[0.06] text-amber-200' : isComplete ? 'border-white/5 bg-white/[0.025] text-slate-500' : 'border-white/10 bg-carbon-850 text-slate-300'}`}>
                        {needsBeforeArrival && <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full border-2 border-dashed border-amber-300" />}
                        <CalendarDays size={13} />
                        {daysUntil > 0
                          ? daysUntil === 1 ? 'J−1 · Demain' : `J−${daysUntil}`
                          : daysUntil === 0 ? 'J0 · Aujourd’hui' : `J+${Math.abs(daysUntil)}`}
                      </div>
                      <p className="text-[11px] text-slate-500 lg:mt-1">{formatDate(r.employee.startDate)}</p>
                    </div>
                    <div>
                      <div className="flex gap-1" aria-label={`${prep.count} essentiels sur 4 préparés`}>
                        {prep.checks.map((check) => (
                          <span key={check.label} title={`${check.label} : ${check.done ? 'prêt' : 'à préparer'}`} className={`h-1.5 flex-1 rounded-full ${check.done ? 'bg-zinc-100' : 'bg-white/10'}`} />
                        ))}
                      </div>
                      <p className="mt-1.5 text-[10px] text-slate-500">{prep.count}/4 essentiels du premier jour</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 lg:block">
                      {needsBeforeArrival ? (
                        <span className="rounded-lg border border-dashed border-amber-400/40 px-2.5 py-1.5 text-[11px] font-semibold text-amber-200">
                          {tasksBeforeDayOne} tâche{tasksBeforeDayOne > 1 ? 's' : ''} avant J1
                        </span>
                      ) : (
                        <Badge tone={statusTone}>{statusLabel}</Badge>
                      )}
                      <ArrowUpRight size={15} className="hidden shrink-0 text-slate-600 transition-colors group-hover:text-brand-400 lg:block" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
