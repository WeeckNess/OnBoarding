'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
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
  Badge,
  buttonClass,
  Empty,
  Panel,
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
  const { records, currentUser, isLoaded, mutate, saving, clearError } =
    useOnboarding();
  const [tab, setTab] = useState('preparation');
  const [edit, setEdit] = useState<EditState | null>(null);
  const [saved, setSaved] = useState(false);
  const record = records.find((r) => r.employee.id === id);
  if (!isLoaded || currentUser?.appRole !== 'manager') return null;
  if (!record)
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Dossier indisponible</h1>
        <p className="text-slate-400">
          Ce collaborateur ne figure pas dans votre équipe.
        </p>
        <Link href="/manager" className={secondaryClass}>
          Retour à mon équipe
        </Link>
      </div>
    );
  const { employee } = record;
  const prep = readiness(record);
  const alerts = alertsFor(record);
  const today = dateOnly();
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
    <button className={secondaryClass} onClick={() => open(kind, itemId)}>
      <Pencil size={14} />
      {label}
    </button>
  );
  return (
    <div className="space-y-6">
      <Link
        href="/manager"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-brand-300"
      >
        <ArrowLeft size={16} />
        Mon équipe
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {employee.firstName} {employee.lastName}
            </h1>
            <Badge tone={prep.ready ? 'green' : 'amber'}>
              {prep.ready ? 'Arrivée préparée' : 'En préparation'}
            </Badge>
          </div>
          <p className="text-slate-400">
            {employee.role} · {employee.department}
          </p>
          <p className="text-sm text-brand-300 mt-3">
            Arrivée le {formatDate(employee.startDate)}
          </p>
        </div>
        <button className={secondaryClass} onClick={() => open('reminder')}>
          <Bell size={16} />
          Ajouter un rappel
        </button>
      </header>
      {saved && (
        <p
          role="status"
          className="text-sm text-emerald-300 flex gap-2 items-center"
        >
          <Check size={16} />
          Modifications enregistrées.
        </p>
      )}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {prep.checks.map((c) => (
          <div
            key={c.label}
            className={`rounded-xl border p-3 flex items-center gap-3 text-sm ${c.done ? 'border-emerald-400/20 bg-emerald-400/5 text-emerald-300' : 'border-white/10 bg-carbon-900 text-slate-400'}`}
          >
            {c.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
            {c.label}
          </div>
        ))}
      </div>
      <nav
        aria-label="Rubriques du dossier"
        className="flex gap-1 overflow-x-auto border-b border-white/10 pb-2"
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
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm ${tab === t.id ? 'bg-brand-500 text-carbon-950 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}
            onClick={() => {
              setTab(t.id);
              setSaved(false);
            }}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </nav>
      {tab === 'preparation' && (
        <div className="space-y-5">
          {alerts.length > 0 && (
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
              <p className="font-semibold text-sm text-amber-200 mb-2">
                {alerts.length} point{alerts.length > 1 ? 's' : ''} d’attention
              </p>
              <ul className="text-sm text-slate-300 space-y-1">
                {alerts.map((a) => (
                  <li key={a.id}>• {a.title}</li>
                ))}
              </ul>
            </div>
          )}
          <Panel
            title="Le premier jour"
            description="Les informations pratiques partagées avec le collaborateur."
            action={editButton('welcome', undefined, 'Organiser l’accueil')}
          >
            <div className="grid sm:grid-cols-3 gap-5 mb-5">
              {[
                { label: 'Accueil par', value: record.welcome.host },
                {
                  label: 'Rendez-vous',
                  value: record.welcome.location
                    ? `${record.welcome.location} · ${record.welcome.time}`
                    : '',
                },
                { label: 'Buddy', value: BUDDIES_DATA[employee.buddyId]?.name },
              ].map((i) => (
                <div key={i.label}>
                  <p className="text-xs text-slate-500 mb-1">{i.label}</p>
                  <p className="text-sm text-slate-200 break-words">
                    {i.value || 'À préciser'}
                  </p>
                </div>
              ))}
            </div>
            {record.welcome.message ? (
              <p className="rounded-xl bg-white/5 p-4 text-sm whitespace-pre-wrap text-slate-300">
                {record.welcome.message}
              </p>
            ) : (
              <Empty>
                Préparez un message de bienvenue et les informations du premier
                jour.
              </Empty>
            )}
          </Panel>
          <Panel
            title="Matériel & accès"
            description="Anticiper les besoins et suivre les retours des responsables."
            action={
              <button className={buttonClass} onClick={() => open('request')}>
                <Plus size={16} />
                Ajouter une demande
              </button>
            }
          >
            <div className="space-y-3">
              {record.requests.map((request) => (
                <article
                  key={request.id}
                  className="rounded-xl border border-white/10 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2 items-center">
                        <h3 className="font-semibold text-sm">
                          {request.title}
                        </h3>
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
                        {request.blocking && <Badge>Requis à J1</Badge>}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        {request.kind === 'hardware' ? 'Matériel' : 'Accès'} ·{' '}
                        {request.owner} · Pour le {formatDate(request.dueDate)}
                        {request.status !== 'ready' && request.dueDate < today
                          ? ' · En retard'
                          : ''}
                      </p>
                    </div>
                    {editButton('request', request.id, 'Mettre à jour')}
                  </div>
                  <p className="mt-3 text-sm text-slate-300 whitespace-pre-wrap break-words">
                    {request.details}
                  </p>
                  {request.note && (
                    <p className="mt-2 text-sm text-amber-200/90 whitespace-pre-wrap break-words">
                      {request.note}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </Panel>
        </div>
      )}
      {tab === 'parcours' && (
        <div className="space-y-5">
          <Panel
            title="Objectifs d’intégration"
            description="Des résultats observables pour accompagner la montée en autonomie."
            action={
              <button className={buttonClass} onClick={() => open('goal')}>
                <Plus size={16} />
                Ajouter un objectif
              </button>
            }
          >
            {record.goals.length ? (
              <div className="space-y-3">
                {record.goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-start gap-3 rounded-xl border border-white/10 p-4"
                  >
                    <button
                      aria-label={`${goal.done ? 'Rouvrir' : 'Valider'} l’objectif ${goal.title}`}
                      disabled={saving}
                      className="mt-1 text-brand-400 disabled:opacity-50"
                      onClick={() =>
                        void mutate(id, {
                          type: 'goal.save',
                          ...goal,
                          done: !goal.done,
                        })
                      }
                    >
                      {goal.done ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm break-words ${goal.done ? 'line-through text-slate-500' : 'text-white'}`}
                      >
                        {goal.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Pour le {formatDate(goal.dueDate)}
                      </p>
                    </div>
                    {editButton('goal', goal.id)}
                  </div>
                ))}
              </div>
            ) : (
              <Empty>
                Aucun objectif défini. Ajoutez un premier résultat attendu pour
                ce collaborateur.
              </Empty>
            )}
          </Panel>
          <Panel
            title="Checklist partagée"
            description="Adaptez les tâches et leurs échéances. Le responsable valide la réalisation."
            action={
              <button className={buttonClass} onClick={() => open('task')}>
                <Plus size={16} />
                Attribuer une tâche
              </button>
            }
          >
            <div className="divide-y divide-white/10">
              {record.tasks.map((task) => {
                const done = employee.completedTaskIds.includes(task.id);
                return (
                  <div
                    key={task.id}
                    className="py-4 flex flex-wrap sm:flex-nowrap items-start gap-3"
                  >
                    <button
                      aria-label={`${done ? 'Rouvrir' : 'Terminer'} ${task.title}`}
                      disabled={saving || task.owner !== 'manager'}
                      title={
                        task.owner === 'employee'
                          ? 'Cette tâche est validée par le collaborateur'
                          : undefined
                      }
                      className="mt-1 text-brand-400 disabled:text-slate-500"
                      onClick={() =>
                        void mutate(id, {
                          type: 'task.toggle',
                          id: task.id,
                          done: !done,
                        })
                      }
                    >
                      {done ? <CheckCircle2 size={19} /> : <Circle size={19} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${done ? 'text-slate-500 line-through' : 'text-white'}`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {OWNER_LABELS[task.owner]} · {formatDate(task.dueDate)}
                        {!done && task.dueDate < today ? ' · En retard' : ''}
                      </p>
                      {task.description && (
                        <p className="text-xs text-slate-500 mt-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                    {task.id !== 'task-j1-1' && editButton('task', task.id)}
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      )}
      {tab === 'documents' && (
        <Panel
          title="Documents attendus"
          description="Visibilité sur l’avancement administratif. Le contenu et la signature restent dans l’espace collaborateur."
        >
          <div className="space-y-3">
            {record.documents.map((d) => (
              <div
                key={d.id}
                className="flex flex-wrap gap-3 items-center justify-between rounded-xl border border-white/10 p-4"
              >
                <div>
                  <h3 className="text-sm font-medium">{d.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Responsable : RH
                    {d.signedAt
                      ? ` · Enregistré le ${formatDate(d.signedAt)}`
                      : ''}
                  </p>
                </div>
                <Badge tone={d.status === 'signed' ? 'green' : 'amber'}>
                  {d.status === 'signed'
                    ? 'Signé (démo)'
                    : 'En attente de signature'}
                </Badge>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Le MVP simule la signature. Le manager consulte les statuts et peut
            ajouter un rappel ; il ne signe pas à la place du collaborateur.
          </p>
        </Panel>
      )}
      {tab === 'suivi' && (
        <div className="space-y-5">
          <Panel
            title="Blocages remontés"
            description="Les difficultés signalées depuis l’espace collaborateur."
          >
            {record.blockers.length ? (
              <div className="space-y-3">
                {record.blockers.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-xl border border-white/10 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Badge tone={b.resolvedAt ? 'green' : 'red'}>
                          {b.resolvedAt ? 'Résolu' : 'À traiter'}
                        </Badge>
                        <p className="mt-3 text-sm break-words">{b.title}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          Signalé le {formatDate(b.createdAt)}
                        </p>
                      </div>
                      {!b.resolvedAt && (
                        <button
                          className={secondaryClass}
                          onClick={() => open('resolve', b.id)}
                        >
                          Apporter une solution
                        </button>
                      )}
                    </div>
                    {b.response && (
                      <p className="mt-3 text-sm text-emerald-200 whitespace-pre-wrap">
                        {b.response}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Empty>Aucun blocage signalé pour le moment.</Empty>
            )}
          </Panel>
          <Panel
            title="Points d’étape"
            description="Planifiez les échanges et conservez un compte rendu partagé."
          >
            <div className="space-y-3">
              {record.meetings.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-white/10 p-4"
                >
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold mb-2">{m.title}</h3>
                      <Badge
                        tone={
                          m.done
                            ? 'green'
                            : m.dueDate < today
                              ? 'red'
                              : 'neutral'
                        }
                      >
                        {m.done
                          ? 'Réalisé'
                          : m.dueDate < today
                            ? 'En retard'
                            : 'Planifié'}{' '}
                        · {formatDate(m.dueDate)}
                      </Badge>
                    </div>
                    {editButton('meeting', m.id, 'Ouvrir le point')}
                  </div>
                  {m.notes && (
                    <p className="mt-3 text-sm text-slate-300 whitespace-pre-wrap">
                      {m.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Ressenti du collaborateur">
            {record.feedback ? (
              <div>
                <p className="text-3xl text-brand-300 font-bold">
                  {record.feedback.rating}
                  <span className="text-lg text-slate-500"> / 5</span>
                </p>
                <p className="text-sm text-slate-300 mt-3 whitespace-pre-wrap">
                  {record.feedback.comment || 'Aucun commentaire ajouté.'}
                </p>
                <p className="text-xs text-slate-500 mt-3">
                  Actualisé le {formatDate(record.feedback.updatedAt)}
                </p>
              </div>
            ) : (
              <Empty>
                Le collaborateur n’a pas encore partagé son ressenti.
              </Empty>
            )}
          </Panel>
        </div>
      )}
      {tab === 'journal' && (
        <Panel
          title="Historique du dossier"
          description="Les actions partagées entre le manager et le collaborateur."
        >
          <ol className="space-y-5">
            {record.activity.map((a) => (
              <li key={a.id} className="border-l-2 border-brand-400/30 pl-4">
                <p className="text-sm text-slate-200 break-words">{a.label}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {a.actor} · {new Date(a.createdAt).toLocaleString('fr-FR')}
                </p>
              </li>
            ))}
          </ol>
        </Panel>
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
