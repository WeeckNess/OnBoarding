'use client';

import { useState } from 'react';
import { ClipboardList, Laptop, Plus, RefreshCw } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import {
  dateOnly,
  formatDate,
  OWNER_LABELS,
  REQUEST_LABELS,
} from '@/lib/onboarding';
import {
  Badge,
  buttonClass,
  Empty,
  inputClass,
  Panel,
  secondaryClass,
} from '@/components/manager/ui';
import RecordEditor, {
  type EditState,
} from '@/components/manager/RecordEditor';
import DocumentDispatch from '@/components/manager/DocumentDispatch';
import type { OnboardingRecord } from '@/types/manager';

export default function OperationsPage() {
  const { currentUser, records, mutate, saving, refresh, clearError } =
    useOnboarding();
  const [edit, setEdit] = useState<EditState | null>(null);
  const [filter, setFilter] = useState('pending');
  const [saved, setSaved] = useState(false);
  if (currentUser?.appRole !== 'rh' && currentUser?.appRole !== 'it')
    return null;
  const isRH = currentUser.appRole === 'rh';
  const service = isRH ? 'RH' : 'IT';
  const today = dateOnly();
  const requests = records
    .flatMap((record) =>
      record.requests
        .filter((r) => r.owner === service)
        .map((request) => ({ record, request }))
    )
    .filter(
      ({ request }) =>
        filter === 'all' ||
        (filter === 'pending'
          ? request.status !== 'ready'
          : request.status === 'blocked' ||
            (request.status !== 'ready' && request.dueDate < today))
    )
    .sort((a, b) => a.request.dueDate.localeCompare(b.request.dueDate));
  const open = (
    record: OnboardingRecord,
    kind: EditState['kind'],
    id?: string
  ) => {
    clearError();
    setSaved(false);
    setEdit({ record: structuredClone(record), kind, id });
  };
  return (
    <div className="space-y-8">
      <header className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 shadow-xl">
        <div className="flex flex-wrap justify-between items-start gap-5">
          <div>
            <p className="text-xs text-brand-300 font-bold mb-3">
              ESPACE {service}
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold">
              {isRH
                ? 'Préparer et suivre l’administratif'
                : 'Préparer le matériel et les accès'}
            </h1>
            <p className="text-sm text-slate-400 mt-3 max-w-2xl">
              {isRH
                ? 'Pilotez les tâches administratives et confirmez les demandes confiées aux RH.'
                : 'Retrouvez les besoins précisés pour chaque arrivée et confirmez leur disponibilité.'}
            </p>
          </div>
          <button className={secondaryClass} onClick={() => void refresh()}>
            <RefreshCw size={14} />
            Actualiser
          </button>
        </div>
      </header>
      {saved && (
        <p
          role="status"
          className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200"
        >
          Enregistré. Le manager et le collaborateur retrouvent cet avancement
          dans leur espace.
        </p>
      )}
      <Panel
        title={`Demandes à traiter par ${service}`}
        icon={Laptop}
        description="Le besoin reste préparé par le manager ; votre service confirme le statut."
        action={
          <select
            aria-label="Filtrer les demandes"
            className={`${inputClass} !text-xs !py-2`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="pending">À traiter</option>
            <option value="attention">Bloquées ou en retard</option>
            <option value="all">Toutes les demandes</option>
          </select>
        }
      >
        {!requests.length ? (
          <Empty>Aucune demande pour ce filtre.</Empty>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {requests.map(({ record, request }) => (
              <article
                key={`${record.employee.id}-${request.id}`}
                className="rounded-2xl bg-carbon-850 border border-white/10 p-5"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <h2 className="text-sm font-bold">{request.title}</h2>
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
                <p className="text-xs text-brand-300 mt-3">
                  {record.employee.firstName} {record.employee.lastName} ·{' '}
                  {record.employee.department}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Arrivée : {formatDate(record.employee.startDate)} · Demande
                  pour le {formatDate(request.dueDate)}
                  {request.dueDate < today && request.status !== 'ready'
                    ? ' · En retard'
                    : ''}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Manager : {record.employee.managerName}
                  {record.welcome.location
                    ? ` · Accueil : ${record.welcome.location}`
                    : ''}
                </p>
                <p className="text-sm text-slate-300 whitespace-pre-wrap mt-4">
                  {request.details}
                </p>
                {request.note && (
                  <p className="text-xs text-slate-400 whitespace-pre-wrap mt-3">
                    {request.note}
                  </p>
                )}
                {request.validatedAt && (
                  <p className="text-xs text-emerald-300 mt-3">
                    Confirmé par {request.validatedBy} le{' '}
                    {formatDate(request.validatedAt)}
                  </p>
                )}
                <div className="flex flex-wrap justify-between items-center gap-3 mt-5 pt-4 border-t border-white/5">
                  <span className="text-xs text-slate-500">
                    {request.blocking
                      ? 'Indispensable dès J1'
                      : 'Complémentaire'}
                  </span>
                  <button
                    className={buttonClass}
                    onClick={() => open(record, 'requestStatus', request.id)}
                  >
                    Traiter la demande
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
      {isRH &&
        records.map((record) => (
          <Panel
            key={record.employee.id}
            title={`${record.employee.firstName} ${record.employee.lastName}`}
            icon={ClipboardList}
            description={`Administratif · arrivée le ${formatDate(record.employee.startDate)}`}
            action={
              <button
                className={buttonClass}
                onClick={() => open(record, 'task')}
              >
                <Plus size={14} />
                Ajouter une tâche RH
              </button>
            }
          >
            <div className="mb-5 border-b border-white/5 pb-5">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-300">Documents à signer</h3>
              <DocumentDispatch record={record} />
            </div>
            <div className="space-y-3">
              {record.tasks.map((task) => {
                const done = record.employee.completedTaskIds.includes(task.id);
                return (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 rounded-2xl bg-carbon-850 border border-white/10 p-4"
                  >
                    <input
                      type="checkbox"
                      aria-label={`Terminer ${task.title}`}
                      checked={done}
                      disabled={saving || task.owner !== 'rh'}
                      className="mt-1 accent-amber-400"
                      onChange={() =>
                        void mutate(record.employee.id, {
                          type: 'task.toggle',
                          id: task.id,
                          done: !done,
                        })
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{task.title}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {OWNER_LABELS[task.owner]} · {formatDate(task.dueDate)}
                      </p>
                    </div>
                    {task.id !== 'task-j1-1' && (
                      <button
                        className={secondaryClass}
                        onClick={() => open(record, 'task', task.id)}
                      >
                        Adapter
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-white/5 pt-4">
              {record.requests
                .filter((r) => r.owner !== 'RH')
                .map((r) => (
                  <Badge key={r.id}>
                    {r.owner} · {r.title} · {REQUEST_LABELS[r.status]}
                  </Badge>
                ))}
            </div>
            <button
              className={`${secondaryClass} mt-5`}
              onClick={() => open(record, 'request')}
            >
              <Plus size={14} />
              Préparer une demande
            </button>
          </Panel>
        ))}
      {edit && (
        <RecordEditor
          key={`${edit.record.employee.id}-${edit.kind}-${edit.id || 'new'}`}
          edit={edit}
          onClose={(result) => {
            setEdit(null);
            if (result) setSaved(true);
          }}
        />
      )}
    </div>
  );
}
