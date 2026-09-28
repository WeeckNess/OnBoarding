'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Search,
  Users,
  RefreshCw,
} from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { alertsFor, dateOnly, formatDate, readiness } from '@/lib/onboarding';
import {
  Badge,
  Empty,
  inputClass,
  Panel,
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
  const upcoming = records.filter((r) => r.employee.startDate > today);
  const ready = records.filter((r) => readiness(r).ready);
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
  if (currentUser?.appRole !== 'manager') return null;
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-brand-400 mb-3">
            L’arrivée se prépare aujourd’hui
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Mon équipe
          </h1>
          <p className="mt-3 text-slate-400">
            Bonjour {currentUser.firstName}. Voici les arrivées à préparer et
            les actions à débloquer.
          </p>
        </div>
        <button
          className={secondaryClass}
          disabled={refreshing}
          onClick={async () => {
            setRefreshing(true);
            await refresh();
            setRefreshing(false);
          }}
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </header>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Collaborateurs suivis',
            value: records.length,
            icon: Users,
            filter: 'all',
          },
          {
            label: 'Arrivées à venir',
            value: upcoming.length,
            icon: CalendarDays,
            filter: 'upcoming',
          },
          {
            label: 'Arrivées préparées',
            value: ready.length,
            icon: CheckCircle2,
            filter: 'ready',
          },
          {
            label: 'Points d’attention',
            value: alerts.length,
            icon: Bell,
            filter: 'attention',
          },
        ].map(({ label, value, icon: Icon, filter: valueFilter }) => (
          <button
            key={label}
            onClick={() => setFilter(valueFilter)}
            className="rounded-2xl border border-white/10 bg-carbon-900 p-5 text-left hover:border-brand-400/40 transition-colors"
          >
            <Icon size={19} className="text-brand-400 mb-4" />
            <strong className="block text-3xl tracking-tight">{value}</strong>
            <span className="block text-xs sm:text-sm text-slate-400 mt-2">
              {label}
            </span>
          </button>
        ))}
      </div>
      {alerts.length > 0 && (
        <Panel
          title="À votre attention"
          description="Les blocages et les échéances qui nécessitent une action."
        >
          <div className="grid md:grid-cols-2 gap-3">
            {alerts.slice(0, 6).map((a) => (
              <Link
                key={`${a.employee.id}-${a.id}`}
                href={`/manager/${a.employee.id}`}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-carbon-850 px-4 py-3 hover:border-brand-400/40"
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${a.urgent ? 'bg-red-400' : 'bg-brand-400'}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium break-words">{a.title}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {a.employee.firstName} {a.employee.lastName}
                  </p>
                </div>
                <ArrowRight size={16} className="text-slate-500 shrink-0" />
              </Link>
            ))}
          </div>
          {alerts.length > 6 && (
            <p className="mt-3 text-xs text-slate-400">
              {alerts.length - 6} autres points à retrouver dans les dossiers.
            </p>
          )}
        </Panel>
      )}
      <section aria-label="Liste des onboardings" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-3 text-slate-500"
              size={18}
            />
            <input
              aria-label="Rechercher un collaborateur"
              className={`${inputClass} pl-10`}
              placeholder="Rechercher un nom, un poste, une équipe…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            aria-label="Filtrer les onboardings"
            className={`${inputClass} sm:w-56`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tous les onboardings</option>
            <option value="upcoming">Arrivées à venir</option>
            <option value="ongoing">Intégrations en cours</option>
            <option value="attention">À traiter</option>
            <option value="ready">Arrivées préparées</option>
          </select>
        </div>
        {!visible.length ? (
          <Empty>Aucun collaborateur ne correspond à ces critères.</Empty>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {visible.map((r) => {
              const prep = readiness(r);
              const attention = alertsFor(r);
              const done = r.tasks.filter((t) =>
                r.employee.completedTaskIds.includes(t.id)
              ).length;
              return (
                <Link
                  href={`/manager/${r.employee.id}`}
                  key={r.employee.id}
                  className="group rounded-2xl border border-white/10 bg-carbon-900/80 p-5 sm:p-6 hover:border-brand-400/40 transition-colors"
                >
                  <div className="flex justify-between gap-3">
                    <div className="flex gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-400/15 text-brand-300 font-bold">
                        {r.employee.firstName[0]}
                        {r.employee.lastName[0]}
                      </span>
                      <div>
                        <h2 className="text-lg font-semibold">
                          {r.employee.firstName} {r.employee.lastName}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          {r.employee.role}
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      size={19}
                      className="text-slate-500 group-hover:text-brand-400 shrink-0 mt-1"
                    />
                  </div>
                  <div className="my-5 flex flex-wrap gap-2">
                    <Badge
                      tone={
                        prep.ready
                          ? 'green'
                          : attention.some((a) => a.urgent)
                            ? 'red'
                            : 'amber'
                      }
                    >
                      {prep.ready
                        ? 'Arrivée préparée'
                        : attention.some((a) => a.urgent)
                          ? 'Action nécessaire'
                          : 'En préparation'}
                    </Badge>
                    <Badge>
                      {r.employee.startDate > today ? 'Arrivée' : 'Depuis le'}{' '}
                      {formatDate(r.employee.startDate)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {prep.checks.map((check) => (
                      <span
                        key={check.label}
                        className={`flex gap-2 items-center ${check.done ? 'text-emerald-300' : 'text-slate-400'}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${check.done ? 'bg-emerald-400' : 'bg-slate-600'}`}
                        />
                        {check.label}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 flex justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
                    <span>{r.employee.department}</span>
                    <span>
                      {done}/{r.tasks.length} tâches réalisées
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
      <p className="text-xs text-slate-500">
        Les arrivées sont enregistrées en amont par les RH. Vous pilotez la
        préparation et le suivi de votre équipe.
      </p>
    </div>
  );
}
