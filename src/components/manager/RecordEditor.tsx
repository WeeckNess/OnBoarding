'use client';
import { useState } from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { BUDDIES_DATA } from '@/lib/mockData';
import { addDays, OWNER_LABELS, REQUEST_LABELS } from '@/lib/onboarding';
import type {
  OnboardingAction,
  OnboardingRecord,
  PreparationRequest,
  ManagedTask,
} from '@/types/manager';
import { buttonClass, Field, inputClass, Modal, secondaryClass } from './ui';

export type EditorKind =
  | 'welcome'
  | 'request'
  | 'requestStatus'
  | 'task'
  | 'goal'
  | 'meeting'
  | 'resolve'
  | 'reminder';
export interface EditState {
  kind: EditorKind;
  id?: string;
  record: OnboardingRecord;
}
export default function RecordEditor({
  edit,
  onClose,
}: {
  edit: EditState;
  onClose: (saved?: boolean) => void;
}) {
  const { mutate, saving, error, clearError, currentUser } = useOnboarding();
  const [localError, setLocalError] = useState('');
  const { record, kind, id } = edit;
  const request = record.requests.find((r) => r.id === id);
  const task = record.tasks.find((t) => t.id === id);
  const goal = record.goals.find((g) => g.id === id);
  const meeting = record.meetings.find((m) => m.id === id);
  const titles: Record<EditorKind, string> = {
    welcome: 'Organiser le premier jour',
    request: id ? 'Préciser le besoin' : 'Préparer une demande',
    requestStatus: 'Traiter la demande',
    task: id ? 'Adapter la tâche' : 'Attribuer une tâche',
    goal: id ? 'Adapter l’objectif' : 'Définir un objectif',
    meeting: meeting?.title || 'Point de suivi',
    resolve: 'Résoudre le blocage',
    reminder: 'Message pour le collaborateur',
  };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError('');
    clearError();
    const values = new FormData(event.currentTarget);
    const get = (key: string) => String(values.get(key) ?? '');
    let action: OnboardingAction;
    switch (kind) {
      case 'welcome':
        action = {
          type: 'welcome',
          host: get('host'),
          location: get('location'),
          time: get('time'),
          message: get('message'),
          buddyId: get('buddyId'),
        };
        break;
      case 'request':
        action = {
          type: 'request.save',
          request: {
            id,
            title: get('title'),
            details: get('details'),
            kind: get('kind') as PreparationRequest['kind'],
            owner: (request?.owner ||
              get('owner')) as PreparationRequest['owner'],
            dueDate: get('dueDate'),
            blocking: values.has('blocking'),
          },
        };
        break;
      case 'requestStatus':
        action = {
          type: 'request.status',
          id: id!,
          status: get('status') as PreparationRequest['status'],
          note: get('note'),
        };
        break;
      case 'task':
        action = {
          type: 'task.save',
          task: {
            id,
            title: get('title'),
            description: get('description'),
            owner: get('owner') as ManagedTask['owner'],
            dueDate: get('dueDate'),
            category: get('category') as ManagedTask['category'],
            milestoneId: get('milestoneId') as ManagedTask['milestoneId'],
          },
        };
        break;
      case 'goal':
        action = {
          type: 'goal.save',
          id,
          title: get('title'),
          dueDate: get('dueDate'),
          done: goal?.done || false,
        };
        break;
      case 'meeting':
        action = {
          type: 'meeting.save',
          id: id!,
          dueDate: get('dueDate'),
          done: values.has('done'),
          notes: get('notes'),
        };
        break;
      case 'resolve':
        action = {
          type: 'blocker.resolve',
          id: id!,
          response: get('response'),
        };
        break;
      case 'reminder':
        action = { type: 'reminder', message: get('message') };
        break;
    }
    if (await mutate(record.employee.id, action, record.version)) onClose(true);
    else
      setLocalError(
        'Les modifications ne sont pas enregistrées. En cas de conflit, fermez puis rouvrez ce formulaire pour utiliser la dernière version.'
      );
  };
  const dateField = (value: string) => (
    <Field label="Échéance">
      <input
        name="dueDate"
        type="date"
        min="2000-01-01"
        max="2100-12-31"
        required
        defaultValue={value}
        className={inputClass}
      />
    </Field>
  );
  return (
    <Modal
      title={titles[kind]}
      onClose={() => {
        if (!saving) onClose();
      }}
    >
      <form onSubmit={submit}>
        <fieldset disabled={saving} className="space-y-4">
          {kind === 'welcome' && (
            <>
              <Field label="Personne présente à l’accueil">
                <input
                  name="host"
                  required
                  maxLength={120}
                  defaultValue={record.welcome.host}
                  placeholder="Nom du responsable de l’accueil"
                  className={inputClass}
                />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Lieu ou lien de rendez-vous">
                  <input
                    name="location"
                    required
                    maxLength={200}
                    defaultValue={record.welcome.location}
                    className={inputClass}
                  />
                </Field>
                <Field label="Heure d’arrivée">
                  <input
                    name="time"
                    required
                    type="time"
                    defaultValue={record.welcome.time}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Buddy">
                <select
                  name="buddyId"
                  defaultValue={record.employee.buddyId}
                  className={inputClass}
                >
                  {Object.values(BUDDIES_DATA).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Message de bienvenue">
                <textarea
                  name="message"
                  required
                  maxLength={2000}
                  rows={4}
                  defaultValue={record.welcome.message}
                  placeholder="Les informations pratiques à retrouver dans l’espace collaborateur…"
                  className={inputClass}
                />
              </Field>
              <p className="text-xs text-slate-400">
                Ces informations sont visibles dans l’espace du collaborateur
                dès l’enregistrement.
              </p>
            </>
          )}
          {kind === 'request' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Type de demande">
                  <select
                    name="kind"
                    defaultValue={request?.kind || 'hardware'}
                    className={inputClass}
                  >
                    <option value="hardware">Matériel</option>
                    <option value="access">Accès logiciel</option>
                  </select>
                </Field>
                <Field label="Responsable">
                  <select
                    name="owner"
                    defaultValue={request?.owner || 'IT'}
                    disabled={!!request}
                    className={inputClass}
                  >
                    <option>IT</option>
                    {(request?.owner === 'RH' ||
                      currentUser?.appRole === 'rh') && <option>RH</option>}
                    {request?.owner === 'Manager' && <option>Manager</option>}
                  </select>
                </Field>
              </div>
              <Field label="Matériel ou accès demandé">
                <input
                  name="title"
                  required
                  maxLength={120}
                  defaultValue={request?.title}
                  placeholder="Ex. VPN et dépôt du projet Atlas"
                  className={inputClass}
                />
              </Field>
              <Field label="Détails nécessaires au traitement">
                <textarea
                  name="details"
                  required
                  maxLength={1500}
                  rows={3}
                  defaultValue={request?.details}
                  placeholder="Configuration, projets concernés, niveau d’accès, lieu de livraison…"
                  className={inputClass}
                />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                {dateField(
                  request?.dueDate || addDays(record.employee.startDate, -1)
                )}
                <div className="text-xs text-slate-400 pt-7">
                  Le statut est confirmé par{' '}
                  {request?.owner || 'le service responsable'}.
                </div>
              </div>
              <label className="flex gap-3 items-center text-sm">
                <input
                  name="blocking"
                  type="checkbox"
                  defaultChecked={request?.blocking ?? true}
                  className="accent-amber-400"
                />
                Indispensable pour travailler dès J1
              </label>
              <p className="text-xs text-slate-400">
                Le service responsable reçoit ce besoin dans son espace. Toute
                modification du besoin demande une nouvelle confirmation. Aucune
                commande fournisseur n’est passée depuis cet écran.
              </p>
            </>
          )}
          {kind === 'requestStatus' && request && (
            <>
              <p className="text-sm text-white font-semibold">
                {request.title}
              </p>
              <p className="text-sm text-slate-400 whitespace-pre-wrap">
                {request.details}
              </p>
              <Field label="Statut confirmé par votre service">
                <select
                  name="status"
                  defaultValue={request.status}
                  className={inputClass}
                >
                  {Object.entries(REQUEST_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Retour partagé avec le manager et le collaborateur">
                <textarea
                  name="note"
                  defaultValue={request.note}
                  maxLength={1000}
                  rows={3}
                  className={inputClass}
                  placeholder="Précisez l’avancement ou la cause du blocage…"
                />
              </Field>
              <p className="text-xs text-slate-400">
                La confirmation « Disponible » est datée et attribuée à votre
                profil.
              </p>
            </>
          )}
          {kind === 'task' && (
            <>
              <Field label="Intitulé de la tâche">
                <input
                  name="title"
                  required
                  maxLength={150}
                  defaultValue={task?.title}
                  className={inputClass}
                />
              </Field>
              <Field label="Consignes">
                <textarea
                  name="description"
                  rows={3}
                  maxLength={1000}
                  defaultValue={task?.description}
                  className={inputClass}
                />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Responsable de la tâche">
                  <select
                    name="owner"
                    defaultValue={task?.owner || 'employee'}
                    className={inputClass}
                  >
                    {Object.entries(OWNER_LABELS)
                      .filter(
                        ([value]) =>
                          value === 'employee' ||
                          value ===
                            (currentUser?.appRole === 'rh' ? 'rh' : 'manager')
                      )
                      .map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                  </select>
                </Field>
                {dateField(task?.dueDate || record.employee.startDate)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Étape">
                  <select
                    name="milestoneId"
                    defaultValue={task?.milestoneId || 'j1'}
                    className={inputClass}
                  >
                    <option value="prearrival">Avant l’arrivée</option>
                    <option value="j1">Jour 1</option>
                    <option value="s1">Semaine 1</option>
                    <option value="s2">Semaine 2</option>
                    <option value="j15">J+15</option>
                    <option value="j30">J+30</option>
                  </select>
                </Field>
                <Field label="Catégorie">
                  <select
                    name="category"
                    defaultValue={
                      task?.category ||
                      (currentUser?.appRole === 'rh' ? 'admin' : 'project')
                    }
                    className={inputClass}
                  >
                    {currentUser?.appRole === 'rh' ? (
                      <option value="admin">Administratif</option>
                    ) : (
                      <>
                        <option value="tech">Technique</option>
                        <option value="team">Équipe</option>
                        <option value="culture">Culture</option>
                        <option value="project">Projet</option>
                      </>
                    )}
                  </select>
                </Field>
              </div>
              <p className="text-xs text-slate-400">
                Une tâche attribuée au collaborateur apparaît dans sa roadmap.
                Seul son responsable peut la terminer.
              </p>
            </>
          )}
          {kind === 'goal' && (
            <>
              <Field label="Objectif observable">
                <textarea
                  name="title"
                  required
                  maxLength={300}
                  rows={3}
                  defaultValue={goal?.title}
                  placeholder="Ex. Présenter un premier pipeline fonctionnel à l’équipe"
                  className={inputClass}
                />
              </Field>
              {dateField(
                goal?.dueDate || addDays(record.employee.startDate, 30)
              )}
            </>
          )}
          {kind === 'meeting' && (
            <>
              {dateField(meeting!.dueDate)}
              <Field label="Compte rendu partagé avec le collaborateur">
                <textarea
                  name="notes"
                  rows={5}
                  maxLength={2000}
                  defaultValue={meeting!.notes}
                  placeholder="Avancées, difficultés rencontrées et prochaines actions…"
                  className={inputClass}
                />
              </Field>
              <label className="flex gap-3 items-center text-sm">
                <input
                  name="done"
                  type="checkbox"
                  defaultChecked={meeting!.done}
                  className="accent-amber-400"
                />
                Point réalisé (compte rendu requis)
              </label>
            </>
          )}
          {kind === 'resolve' && (
            <>
              <p className="text-sm text-slate-300">
                {record.blockers.find((b) => b.id === id)?.title}
              </p>
              <Field label="Solution apportée">
                <textarea
                  name="response"
                  required
                  maxLength={1000}
                  rows={4}
                  className={inputClass}
                />
              </Field>
              <p className="text-xs text-slate-400">
                La réponse sera visible par le collaborateur.
              </p>
            </>
          )}
          {kind === 'reminder' && (
            <>
              <Field label="Message de rappel">
                <textarea
                  name="message"
                  required
                  maxLength={500}
                  rows={4}
                  defaultValue="Pense à consulter tes actions restantes et tes documents dans ton espace d’intégration."
                  className={inputClass}
                />
              </Field>
              <p className="text-xs text-slate-400">
                Ce rappel apparaît dans l’espace collaborateur. Il ne déclenche
                pas d’email.
              </p>
            </>
          )}
          {(error || localError) && (
            <div
              role="alert"
              className="rounded-xl bg-red-400/10 border border-red-400/30 p-3 text-sm text-red-200"
            >
              {error || localError}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              className={secondaryClass}
              onClick={() => onClose()}
            >
              Annuler
            </button>
            <button type="submit" className={buttonClass}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
