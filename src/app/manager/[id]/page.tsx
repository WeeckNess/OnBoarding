'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  Check,
  CheckCircle2,
  Circle,
  ClipboardList,
  FileCheck2,
  History,
  Laptop,
  Plus,
  MessageSquare,
  Pencil,
  CalendarDays,
  UserCheck,
  Target,
  MapPin,
  Clock,
  KeyRound,
  AlertCircle,
  ChevronDown,
  Star,
  X,
  Building2,
} from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { BUDDIES_DATA } from '@/lib/mockData';
import {
  alertsFor,
  dateOnly,
  formatDate,
  OWNER_LABELS,
  readiness,
  REQUEST_LABELS,
} from '@/lib/onboarding';
import {
  Avatar,
  Badge,
  buttonClass,
  Empty,
  IconTile,
  Panel,
  ReadinessStrip,
  secondaryClass,
} from '@/components/manager/ui';
import RecordEditor, {
  EditState,
  EditorKind,
} from '@/components/manager/RecordEditor';

export default function ManagerDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const {
    records,
    currentUser,
    isLoaded,
    mutate,
    saving,
    clearError,
    milestones,
  } = useOnboarding();
  const [tab, setTab] = useState(
    searchParams.get('tab') === 'parcours' ? 'parcours' : 'preparation'
  );
  const [edit, setEdit] = useState<EditState | null>(null);
  const [saved, setSaved] = useState(false);
  const [taskOwner, setTaskOwner] = useState('all');
  const record = records.find((r) => r.employee.id === id);
  if (!isLoaded || currentUser?.appRole !== 'manager') return null;
  if (!record)
    return (
      <Panel title="Dossier indisponible" icon={UserCheck}>
        <p className="mb-5 text-sm text-slate-400">
          Ce collaborateur ne figure pas dans votre équipe.
        </p>
        <Link href="/manager" className={secondaryClass}>
          <ArrowLeft size={14} />
          Retour à mon équipe
        </Link>
      </Panel>
    );
  const { employee } = record;
  const prep = readiness(record);
  const alerts = alertsFor(record);
  const today = dateOnly();
  const buddy = BUDDIES_DATA[employee.buddyId];
  const visibleTasks = record.tasks.filter(
    (t) => taskOwner === 'all' || t.owner === taskOwner
  );
  const open = (kind: EditorKind, itemId?: string) => {
    clearError();
    setSaved(false);
    setEdit({ kind, id: itemId, record: structuredClone(record) });
  };
  const editButton = (
    kind: EditorKind,
    itemId?: string,
    label = 'Modifier'
  ) => (
    <button
      className={`${secondaryClass} shrink-0`}
      onClick={() => open(kind, itemId)}
    >
      <Pencil size={12} />
      {label}
    </button>
  );
  return (
    <div className="space-y-6 sm:space-y-8">
      <Link
        href="/manager"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition-colors hover:text-brand-300"
      >
        <ArrowLeft size={14} />
        Tous les collaborateurs
      </Link>
      <header className="glass-panel relative overflow-hidden rounded-3xl border border-white/10 p-6 shadow-2xl sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="relative">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/15 px-3 py-1 text-[11px] font-bold text-brand-300">
              <UserCheck size={13} />
              Parcours d’intégration
            </span>
            <Badge
              tone={
                prep.ready
                  ? 'green'
                  : alerts.some((a) => a.urgent)
                    ? 'red'
                    : 'amber'
              }
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {prep.ready
                ? 'Arrivée préparée'
                : alerts.some((a) => a.urgent)
                  ? 'Action nécessaire'
                  : 'En préparation'}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar
                firstName={employee.firstName}
                lastName={employee.lastName}
                large
              />
              <div className="min-w-0">
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {employee.firstName}{' '}
                  <span className="text-white">
                    {employee.lastName}
                  </span>
                </h1>
                <p className="mt-2 text-sm text-slate-300">{employee.role}</p>
              </div>
            </div>
            <button className={buttonClass} onClick={() => open('reminder')}>
              <MessageSquare size={14} />
              Envoyer un message
            </button>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-5 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <CalendarDays size={14} className="text-brand-400" />
              Arrivée le{' '}
              <strong className="font-semibold text-slate-200">
                {formatDate(employee.startDate)}
              </strong>
            </span>
            <span className="flex items-center gap-2">
              <Building2 size={14} className="text-brand-400" />
              {employee.department}
            </span>
            <span className="flex items-center gap-2">
              <UserCheck size={14} className="text-brand-400" />
              Buddy : {buddy?.name || 'À définir'}
            </span>
          </div>
        </div>
      </header>

      <section
        className="glass-panel rounded-3xl border border-white/10 p-5 shadow-xl sm:p-6"
        aria-label="Préparation du premier jour"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white">
              Prêt pour le premier jour ?
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Les essentiels à préparer avant son arrivée
            </p>
          </div>
          <span className="shrink-0 text-2xl font-extrabold text-brand-300">
            {prep.count}
            <span className="ml-1 text-sm font-medium text-slate-500">/ 4</span>
          </span>
        </div>
        <ReadinessStrip checks={prep.checks} />
      </section>

      <nav
        aria-label="Rubriques du dossier"
        className="glass-panel flex gap-1 overflow-x-auto rounded-2xl border border-white/5 p-1.5"
      >
        {[
          { id: 'preparation', label: 'Préparation', icon: Laptop },
          {
            id: 'parcours',
            label: 'Parcours & objectifs',
            icon: ClipboardList,
          },
          { id: 'documents', label: 'Documents', icon: FileCheck2 },
          { id: 'suivi', label: 'Suivi & feedback', icon: MessageSquare },
          { id: 'journal', label: 'Historique', icon: History },
        ].map((t) => (
          <button
            key={t.id}
            aria-current={tab === t.id ? 'page' : undefined}
            className={`flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-xs font-bold transition-colors sm:flex-1 ${tab === t.id ? 'bg-zinc-100 text-carbon-950 shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            onClick={() => {
              setTab(t.id);
              setSaved(false);
            }}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'preparation' && (
        <div className="space-y-5">
          {alerts.length > 0 && (
            <details className="group rounded-2xl border border-brand-500/20 bg-brand-500/[0.05] px-4 py-3.5">
              <summary className="flex cursor-pointer list-none items-center gap-3 text-xs [&::-webkit-details-marker]:hidden">
                <AlertCircle size={17} className="shrink-0 text-brand-400" />
                <span className="font-bold text-brand-300">
                  {alerts.length} point{alerts.length > 1 ? 's' : ''} à suivre
                </span>
                <span className="min-w-0 flex-1 truncate text-slate-400 hidden sm:block">
                  {alerts[0].title}
                </span>
                <ChevronDown
                  size={14}
                  className="ml-auto text-brand-400 transition-transform group-open:rotate-180"
                />
              </summary>
              <ul className="ml-7 mt-3 space-y-2 border-t border-brand-500/10 pt-3 text-xs text-slate-300">
                {alerts.map((a) => (
                  <li key={a.id} className="flex items-center gap-2">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-zinc-100" />
                    {a.title}
                  </li>
                ))}
              </ul>
            </details>
          )}
          <div className="grid items-start gap-6 xl:grid-cols-12">
            <Panel
              title="Matériel & accès"
              description="Anticiper les besoins avant J1"
              icon={Laptop}
              className="xl:col-span-7"
              action={
                <button className={buttonClass} onClick={() => open('request')}>
                  <Plus size={14} />
                  Ajouter une demande
                </button>
              }
            >
              <div className="space-y-3">
                {record.requests.map((request) => (
                  <article
                    key={request.id}
                    className="rounded-2xl border border-white/10 bg-carbon-850 p-4"
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-carbon-900 text-brand-400">
                        {request.kind === 'hardware' ? (
                          <Laptop size={16} />
                        ) : (
                          <KeyRound size={16} />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-bold leading-relaxed text-white">
                          {request.title}
                        </h3>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {request.owner} · Pour le{' '}
                          {formatDate(request.dueDate)}
                          {request.status !== 'ready' && request.dueDate < today
                            ? ' · En retard'
                            : ''}
                        </p>
                      </div>
                      <Badge
                        tone={
                          request.status === 'ready'
                            ? 'green'
                            : request.status === 'blocked'
                              ? 'red'
                              : 'amber'
                        }
                      >
                        {REQUEST_LABELS[request.status]}
                      </Badge>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-400 whitespace-pre-wrap break-words">
                      {request.details}
                    </p>
                    {request.note && (
                      <p className="mt-3 rounded-xl bg-carbon-900/60 px-3 py-2.5 text-xs leading-relaxed text-brand-200/80 whitespace-pre-wrap break-words">
                        {request.note}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
                      <span className="text-[10px] text-slate-500">
                        {request.blocking
                          ? 'Indispensable dès le premier jour'
                          : 'Préparation complémentaire'}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {editButton(
                          'request',
                          request.id,
                          'Préciser le besoin'
                        )}
                        {request.owner === 'Manager' &&
                          editButton(
                            'requestStatus',
                            request.id,
                            'Confirmer le statut'
                          )}
                      </div>
                    </div>
                    {request.validatedAt && (
                      <p className="mt-3 text-[11px] text-emerald-300">
                        Confirmé par {request.validatedBy} le{' '}
                        {formatDate(request.validatedAt)}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </Panel>
            <Panel
              title="Le premier jour"
              description="Un accueil préparé ensemble"
              icon={UserCheck}
              className="xl:col-span-5"
              action={
                <button
                  className={secondaryClass}
                  title="Organiser l’accueil"
                  aria-label="Organiser l’accueil"
                  onClick={() => open('welcome')}
                >
                  <Pencil size={14} />
                </button>
              }
            >
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-brand-500/25 bg-brand-500/15 text-brand-300">
                    <UserCheck size={21} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {buddy?.name || 'Buddy à définir'}
                    </p>
                    <p className="mt-0.5 text-xs text-brand-300">
                      Buddy du collaborateur
                    </p>
                  </div>
                </div>
                <div className="space-y-3 rounded-2xl border border-white/5 bg-carbon-850/80 p-4">
                  {[
                    {
                      label: 'Accueil par',
                      value: record.welcome.host,
                      icon: UserCheck,
                    },
                    {
                      label: 'Rendez-vous',
                      value: record.welcome.location,
                      icon: MapPin,
                    },
                    {
                      label: 'Heure d’arrivée',
                      value: record.welcome.time,
                      icon: Clock,
                    },
                  ].map((info) => (
                    <div key={info.label} className="flex items-start gap-3">
                      <info.icon
                        size={14}
                        className="mt-1 shrink-0 text-brand-400/80"
                      />
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-500">
                          {info.label}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-300 break-words">
                          {info.value || 'À préciser'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Message de bienvenue
                  </p>
                  {record.welcome.message ? (
                    <p className="rounded-2xl border border-white/5 bg-carbon-850/60 p-4 text-xs italic leading-relaxed text-slate-300 whitespace-pre-wrap">
                      « {record.welcome.message} »
                    </p>
                  ) : (
                    <Empty>
                      Ajoutez quelques mots et les informations pratiques pour
                      son arrivée.
                    </Empty>
                  )}
                </div>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {tab === 'parcours' && (
        <div className="grid items-start gap-6 xl:grid-cols-12">
          <Panel
            title="Checklist partagée"
            description="Les étapes pour avancer vers l’autonomie"
            icon={ClipboardList}
            className="xl:col-span-7"
            action={
              <button className={buttonClass} onClick={() => open('task')}>
                <Plus size={14} />
                Attribuer une tâche
              </button>
            }
          >
            <div className="mb-5 flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Toutes les tâches' },
                { value: 'manager', label: 'Mes tâches' },
                { value: 'employee', label: 'Collaborateur' },
              ].map((option) => (
                <button
                  key={option.value}
                  aria-pressed={taskOwner === option.value}
                  onClick={() => setTaskOwner(option.value)}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${taskOwner === option.value ? 'border-brand-500/25 bg-brand-500/15 text-brand-300' : 'border-white/5 text-slate-500 hover:text-white'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {visibleTasks.length ? (
                milestones
                  .map((milestone) => ({
                    ...milestone,
                    tasks: visibleTasks.filter(
                      (task) => task.milestoneId === milestone.id
                    ),
                  }))
                  .filter((phase) => phase.tasks.length > 0)
                  .map((phase, index) => (
                    <details
                      key={phase.id}
                      open={index === 0}
                      className="group rounded-2xl border border-white/10 bg-carbon-900/40"
                    >
                      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl px-4 py-4 [&::-webkit-details-marker]:hidden">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-brand-500/20 bg-brand-500/10 font-mono text-[10px] text-brand-300">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="flex-1 text-xs font-bold leading-relaxed text-slate-200">
                          {phase.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {
                            phase.tasks.filter((task) =>
                              employee.completedTaskIds.includes(task.id)
                            ).length
                          }
                          /{phase.tasks.length}
                        </span>
                        <ChevronDown
                          size={14}
                          className="shrink-0 text-brand-400 transition-transform group-open:rotate-180"
                        />
                      </summary>
                      <div className="space-y-3 border-t border-white/5 p-3">
                        {phase.tasks.map((task) => {
                          const done = employee.completedTaskIds.includes(
                            task.id
                          );
                          return (
                            <div
                              key={task.id}
                              className={`rounded-2xl border p-4 ${done ? 'border-white/5 bg-carbon-900/40' : 'border-white/10 bg-carbon-850'}`}
                            >
                              <div className="flex items-start gap-3">
                                <button
                                  aria-label={`${done ? 'Rouvrir' : 'Terminer'} ${task.title}`}
                                  disabled={saving || task.owner !== 'manager'}
                                  title={
                                    task.owner === 'employee'
                                      ? 'Cette tâche est validée par le collaborateur'
                                      : undefined
                                  }
                                  className="mt-0.5 shrink-0 text-brand-400 disabled:text-slate-500"
                                  onClick={() =>
                                    void mutate(id, {
                                      type: 'task.toggle',
                                      id: task.id,
                                      done: !done,
                                    })
                                  }
                                >
                                  {done ? (
                                    <CheckCircle2 size={18} />
                                  ) : (
                                    <Circle size={18} />
                                  )}
                                </button>
                                <div className="min-w-0 flex-1">
                                  <h3
                                    className={`text-xs font-bold leading-relaxed ${done ? 'text-slate-500 line-through' : 'text-white'}`}
                                  >
                                    {task.title}
                                  </h3>
                                  {task.description && (
                                    <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                                      {task.description}
                                    </p>
                                  )}
                                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-[10px] text-slate-500">
                                      {OWNER_LABELS[task.owner]} ·{' '}
                                      {formatDate(task.dueDate)}
                                      {!done && task.dueDate < today
                                        ? ' · En retard'
                                        : ''}
                                    </span>
                                    {task.id !== 'task-j1-1' &&
                                      task.category !== 'admin' &&
                                      editButton('task', task.id)}
                                    {task.category === 'admin' && (
                                      <span className="text-[10px] text-slate-500">
                                        Pilotage RH
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  ))
              ) : (
                <Empty>
                  Aucune tâche attribuée à ce responsable pour le moment.
                </Empty>
              )}
            </div>
          </Panel>
          <Panel
            title="Objectifs d’intégration"
            description="Des résultats concrets à atteindre"
            icon={Target}
            className="xl:col-span-5 xl:sticky xl:top-8"
            action={
              <button
                className={secondaryClass}
                title="Ajouter un objectif"
                aria-label="Ajouter un objectif"
                onClick={() => open('goal')}
              >
                <Plus size={14} />
              </button>
            }
          >
            {record.goals.length ? (
              <div className="space-y-3">
                {record.goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="rounded-2xl border border-white/10 bg-carbon-850 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        aria-label={`${goal.done ? 'Rouvrir' : 'Valider'} l’objectif ${goal.title}`}
                        disabled={saving}
                        className="mt-0.5 shrink-0 text-brand-400 disabled:opacity-50"
                        onClick={() =>
                          void mutate(id, {
                            type: 'goal.save',
                            ...goal,
                            done: !goal.done,
                          })
                        }
                      >
                        {goal.done ? (
                          <CheckCircle2 size={19} />
                        ) : (
                          <Circle size={19} />
                        )}
                      </button>
                      <p
                        className={`text-xs font-semibold leading-relaxed break-words ${goal.done ? 'line-through text-slate-500' : 'text-white'}`}
                      >
                        {goal.title}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
                      <span className="text-[10px] text-slate-500">
                        Pour le {formatDate(goal.dueDate)}
                      </span>
                      {editButton('goal', goal.id)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty>
                Définissez un premier résultat attendu pour guider la montée en
                autonomie.
              </Empty>
            )}
          </Panel>
        </div>
      )}

      {tab === 'documents' && (
        <Panel
          title="Documents attendus"
          description="L’avancement administratif du parcours"
          icon={FileCheck2}
          action={
            <Badge>
              {record.documents.filter((d) => d.status === 'signed').length}/
              {record.documents.length} signés
            </Badge>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {record.documents.map((d) => (
              <article
                key={d.id}
                className="rounded-2xl border border-white/10 bg-carbon-850 p-5"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <IconTile icon={FileCheck2} />
                  <Badge tone={d.status === 'signed' ? 'green' : 'amber'}>
                    {d.status === 'signed' ? 'Signé (démo)' : 'En attente'}
                  </Badge>
                </div>
                <h3 className="text-sm font-bold text-white">{d.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {d.status === 'signed'
                    ? d.signedAt
                      ? `Enregistré le ${formatDate(d.signedAt)}`
                      : 'Signature enregistrée'
                    : 'À signer depuis l’espace collaborateur.'}
                </p>
                <div className="mt-5 border-t border-white/5 pt-3 text-[11px] text-slate-500">
                  Suivi administratif · RH
                </div>
              </article>
            ))}
          </div>
          <p className="mt-5 text-[11px] leading-relaxed text-slate-500">
            Signature simulée dans ce MVP. Vous consultez les statuts ; le
            contenu et la signature restent dans l’espace collaborateur.
          </p>
        </Panel>
      )}

      {tab === 'suivi' && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-12">
            <Panel
              title="Blocages remontés"
              description="Apporter une réponse aux difficultés rencontrées"
              icon={MessageSquare}
              className="lg:col-span-7"
              action={
                <Badge
                  tone={
                    record.blockers.some((b) => !b.resolvedAt)
                      ? 'amber'
                      : 'green'
                  }
                >
                  {record.blockers.filter((b) => !b.resolvedAt).length} à
                  traiter
                </Badge>
              }
            >
              {record.blockers.length ? (
                <div className="space-y-3">
                  {record.blockers.map((b) => (
                    <div
                      key={b.id}
                      className="rounded-2xl border border-white/10 bg-carbon-850 p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Badge tone={b.resolvedAt ? 'green' : 'red'}>
                          {b.resolvedAt ? 'Résolu' : 'À traiter'}
                        </Badge>
                        <span className="text-[10px] text-slate-500">
                          {formatDate(b.createdAt)}
                        </span>
                      </div>
                      <p className="mt-3 text-xs font-semibold leading-relaxed break-words text-white">
                        {b.title}
                      </p>
                      {b.response ? (
                        <div className="mt-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-3">
                          <p className="mb-1 text-[10px] font-bold text-emerald-300">
                            Votre réponse
                          </p>
                          <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
                            {b.response}
                          </p>
                        </div>
                      ) : (
                        <button
                          className={`${secondaryClass} mt-4`}
                          onClick={() => open('resolve', b.id)}
                        >
                          <MessageSquare size={13} />
                          Apporter une solution
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Empty>
                  Aucun blocage signalé. Le collaborateur pourra partager ses
                  difficultés depuis son espace.
                </Empty>
              )}
            </Panel>
            <Panel
              title="Ressenti du collaborateur"
              description="Prendre le pouls de son intégration"
              icon={Star}
              className="lg:col-span-5"
            >
              {record.feedback ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <p className="text-4xl font-extrabold text-brand-300">
                      {record.feedback.rating}
                      <span className="ml-1 text-lg font-medium text-slate-500">
                        /5
                      </span>
                    </p>
                    <div className="flex gap-1" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          size={16}
                          className={
                            n <= record.feedback!.rating
                              ? 'fill-brand-400/20 text-brand-400'
                              : 'text-slate-600'
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <p className="rounded-2xl border border-white/5 bg-carbon-850/70 p-4 text-xs italic leading-relaxed text-slate-300 whitespace-pre-wrap">
                    {record.feedback.comment
                      ? `« ${record.feedback.comment} »`
                      : 'Aucun commentaire ajouté.'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Dernier retour le {formatDate(record.feedback.updatedAt)}
                  </p>
                </div>
              ) : (
                <Empty>
                  Le collaborateur n’a pas encore partagé son ressenti.
                </Empty>
              )}
            </Panel>
          </div>
          <Panel
            title="Points d’étape"
            description="Des rendez-vous pour avancer ensemble"
            icon={CalendarDays}
          >
            <div className="grid gap-4 lg:grid-cols-3">
              {record.meetings.map((m) => (
                <article
                  key={m.id}
                  className="flex flex-col rounded-2xl border border-white/10 bg-carbon-850 p-5"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <IconTile icon={CalendarDays} small />
                    <Badge
                      tone={
                        m.done ? 'green' : m.dueDate < today ? 'red' : 'neutral'
                      }
                    >
                      {m.done
                        ? 'Réalisé'
                        : m.dueDate < today
                          ? 'En retard'
                          : 'Planifié'}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-white">{m.title}</h3>
                  <p className="mt-1.5 text-xs text-brand-300">
                    {formatDate(m.dueDate)}
                  </p>
                  <p className="mb-5 mt-4 flex-1 text-xs leading-relaxed text-slate-400 whitespace-pre-wrap">
                    {m.notes ||
                      'Un moment pour faire le point sur les avancées et les prochaines étapes.'}
                  </p>
                  <button
                    className={`${secondaryClass} w-full`}
                    onClick={() => open('meeting', m.id)}
                  >
                    Ouvrir le point <ArrowUpRight size={14} />
                  </button>
                </article>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {tab === 'journal' && (
        <Panel
          title="Historique du parcours"
          description="Les étapes et les échanges, au même endroit"
          icon={History}
        >
          <ol className="relative ml-4 border-l border-white/10">
            {record.activity.map((a) => (
              <li key={a.id} className="relative pb-6 pl-7 last:pb-0">
                <span className="absolute -left-3.5 top-0 flex h-7 w-7 items-center justify-center rounded-full border border-brand-500/20 bg-carbon-900 text-brand-400">
                  <Clock size={12} />
                </span>
                <p className="pt-1 text-xs font-semibold leading-relaxed text-slate-200 break-words">
                  {a.label}
                </p>
                <p className="mt-1.5 text-[10px] text-slate-500">
                  <span className="text-brand-300/70">{a.actor}</span> ·{' '}
                  {new Date(a.createdAt).toLocaleString('fr-FR')}
                </p>
              </li>
            ))}
          </ol>
        </Panel>
      )}

      {saved && (
        <div
          role="status"
          className="fixed bottom-6 right-4 z-40 flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-2xl border border-emerald-400/25 bg-carbon-900 px-4 py-3 text-xs font-semibold text-emerald-300 shadow-xl sm:right-8"
        >
          <Check size={17} />
          Modifications enregistrées.
          <button
            onClick={() => setSaved(false)}
            aria-label="Fermer la confirmation"
            className="ml-2 text-slate-500 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}
      {edit && (
        <RecordEditor
          edit={edit}
          onClose={(success) => {
            setEdit(null);
            setSaved(!!success);
          }}
        />
      )}
    </div>
  );
}
