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
} from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { alertsFor, dateOnly, formatDate, readiness } from '@/lib/onboarding';
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
  const nextArrival = upcoming[0];
  const visible = records
    .filter((r) => {
      const matches =
        `${r.employee.firstName} ${r.employee.lastName} ${r.employee.role} ${r.employee.department}`
          .toLocaleLowerCase('fr')
          .includes(search.toLocaleLowerCase('fr'));
      return (
        matches &&
        (filter === 'all' ||
          (filter === 'upcoming' && r.employee.startDate > today) ||
          (filter === 'ongoing' && r.employee.startDate <= today) ||
          (filter === 'attention' && alertsFor(r).length > 0) ||
          (filter === 'ready' && readiness(r).ready))
      );
    })
    .sort((a, b) => a.employee.startDate.localeCompare(b.employee.startDate));
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
              <span className="bg-gradient-to-r from-brand-400 via-brand-300 to-accent-sand bg-clip-text text-transparent">
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
        className="glass-panel grid grid-cols-2 gap-2 rounded-3xl border border-white/10 p-3 shadow-xl lg:grid-cols-4"
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
          title="Actions prioritaires"
          description="Les points à débloquer pour vos collaborateurs"
          icon={Clock}
          className="lg:col-span-7 flex flex-col"
          action={
            <Badge tone={alerts.length ? 'amber' : 'green'}>
              {alerts.length} à traiter
            </Badge>
          }
        >
          <div className="flex-1 space-y-3">
            {alerts.length ? (
              alerts.slice(0, 4).map((a) => (
                <Link
                  key={`${a.employee.id}-${a.id}`}
                  href={`/manager/${a.employee.id}`}
                  className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-carbon-850 p-3.5 transition-colors hover:border-brand-500/40"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${a.urgent ? 'border-red-400/20 bg-red-400/10 text-red-300' : 'border-brand-500/20 bg-brand-500/10 text-brand-400'}`}
                  >
                    <AlertCircle size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold leading-relaxed text-white">
                      {a.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {a.employee.firstName} {a.employee.lastName}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="shrink-0 text-slate-500 transition-colors group-hover:text-brand-400"
                  />
                </Link>
              ))
            ) : (
              <Empty>
                Aucun blocage ni échéance à traiter. Tout est à jour pour votre
                équipe.
              </Empty>
            )}
          </div>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/5 pt-4 text-xs">
            <span className="text-slate-500">
              {alerts.length > 4
                ? `${alerts.length - 4} autres points dans les dossiers`
                : 'Chaque action compte pour le premier jour'}
            </span>
            <button
              onClick={() => showTeam('attention')}
              className="shrink-0 font-bold text-brand-400 hover:text-brand-300"
            >
              Voir les dossiers <ArrowRight size={12} className="inline ml-1" />
            </button>
          </div>
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
        className="scroll-mt-8 space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">
              Les parcours de mon équipe
            </h2>
            <Badge>{records.length}</Badge>
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row">
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
              className={`${inputClass} sm:w-44 !text-xs`}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Tous les parcours</option>
              <option value="upcoming">À venir</option>
              <option value="ongoing">En cours</option>
              <option value="attention">À traiter</option>
              <option value="ready">Arrivées préparées</option>
            </select>
          </div>
        </div>
        {!visible.length ? (
          <Empty>Aucun collaborateur ne correspond à ces critères.</Empty>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {visible.map((r) => {
              const prep = readiness(r);
              const attention = alertsFor(r);
              const done = r.tasks.filter((t) =>
                r.employee.completedTaskIds.includes(t.id)
              ).length;
              return (
                <Link
                  key={r.employee.id}
                  href={`/manager/${r.employee.id}`}
                  className="glass-card group relative overflow-hidden rounded-3xl border border-white/10 p-6"
                >
                  <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-500/[0.04] blur-3xl transition-colors group-hover:bg-brand-500/10" />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Avatar
                        firstName={r.employee.firstName}
                        lastName={r.employee.lastName}
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-white">
                          {r.employee.firstName} {r.employee.lastName}
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                          {r.employee.role}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight
                      size={18}
                      className="shrink-0 text-slate-500 transition-colors group-hover:text-brand-400"
                    />
                  </div>
                  <div className="my-5 flex flex-wrap items-center justify-between gap-2">
                    <Badge
                      tone={
                        prep.ready
                          ? 'green'
                          : attention.some((a) => a.urgent)
                            ? 'red'
                            : 'amber'
                      }
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {prep.ready
                        ? 'Arrivée préparée'
                        : attention.some((a) => a.urgent)
                          ? 'Action nécessaire'
                          : 'En préparation'}
                    </Badge>
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <CalendarDays size={13} />
                      {formatDate(r.employee.startDate)}
                    </span>
                  </div>
                  <ReadinessStrip checks={prep.checks} compact />
                  <div className="mt-5 flex flex-wrap justify-between gap-2 border-t border-white/5 pt-4 text-[11px]">
                    <span className="text-slate-500">
                      {r.employee.department}
                    </span>
                    <span className="font-semibold text-brand-300">
                      {done}/{r.tasks.length} tâches réalisées{' '}
                      <ArrowRight size={12} className="ml-1 inline" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
