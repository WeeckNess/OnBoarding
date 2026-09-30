import { randomUUID } from 'node:crypto';
import { BUDDIES_DATA } from '../mockData';
import { REQUEST_LABELS } from '../onboarding';
import {
  HttpError,
  authorize,
  recordById,
  saveRecord,
  visibleRecord,
  markAutomaticReminderRead,
} from './store';
import type { Account, ManagedTask, PreparationRequest } from '@/types/manager';

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new HttpError(400, 'Données invalides.');
  return value as Record<string, unknown>;
}
function text(value: unknown, max = 1000, required = true) {
  if (
    typeof value !== 'string' ||
    value.length > max ||
    (required && !value.trim())
  )
    throw new HttpError(400, `Texte requis, limité à ${max} caractères.`);
  return value.trim();
}
function bool(value: unknown) {
  if (typeof value !== 'boolean')
    throw new HttpError(400, 'Valeur oui/non requise.');
  return value;
}
function date(value: unknown) {
  const valueText = text(value, 10);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(valueText) ||
    !Number.isFinite(Date.parse(valueText)) ||
    new Date(valueText).toISOString().slice(0, 10) !== valueText ||
    valueText < '2000-01-01' ||
    valueText > '2100-12-31'
  )
    throw new HttpError(400, 'Date invalide.');
  return valueText;
}
function option<T extends string>(value: unknown, choices: readonly T[]): T {
  if (typeof value !== 'string' || !choices.includes(value as T))
    throw new HttpError(400, 'Choix invalide.');
  return value as T;
}
function find<T extends { id: string }>(items: T[], id: unknown): T {
  const item = items.find((i) => i.id === id);
  if (!item) throw new HttpError(404, 'Élément introuvable.');
  return item;
}
export function applyAction(account: Account, id: string, payload: unknown) {
  const body = object(payload);
  if (!Number.isInteger(body.version) || Number(body.version) < 1)
    throw new HttpError(400, 'Version du dossier requise.');
  const action = object(body.action);
  const record = recordById(id);
  authorize(account, record);
  if (record.version !== body.version)
    throw new HttpError(
      409,
      'Ce dossier a évolué. Actualisez-le avant de réessayer.'
    );
  const managerActions = [
    'welcome',
    'goal.save',
    'meeting.save',
    'blocker.resolve',
    'reminder',
  ];
  const employeeActions = [
    'blocker.create',
    'feedback',
    'notification.read',
    'sign',
    'reset',
  ];
  if (
    (managerActions.includes(String(action.type)) &&
      account.appRole !== 'manager') ||
    (employeeActions.includes(String(action.type)) &&
      account.appRole !== 'employee')
  )
    throw new HttpError(403, 'Cette action ne correspond pas à votre rôle.');
  if (
    ['request.save', 'task.save', 'task.delete'].includes(
      String(action.type)
    ) &&
    !['manager', 'rh'].includes(account.appRole)
  )
    throw new HttpError(
      403,
      'Cette préparation est réservée au manager ou aux RH.'
    );
  if (
    action.type === 'request.status' &&
    !['manager', 'rh', 'it'].includes(account.appRole)
  )
    throw new HttpError(
      403,
      'Seul le service responsable peut traiter une demande.'
    );
  const now = new Date().toISOString();
  let label = '';
  switch (action.type) {
    case 'welcome': {
      const time = text(action.time, 5);
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
        throw new HttpError(400, 'Horaire invalide.');
      const buddyId = text(action.buddyId, 100);
      if (!Object.hasOwn(BUDDIES_DATA, buddyId))
        throw new HttpError(400, 'Buddy inconnu.');
      record.welcome = {
        host: text(action.host, 120),
        location: text(action.location, 200),
        time,
        message: text(action.message, 2000),
      };
      record.employee.buddyId = buddyId;
      label = 'Accueil et buddy mis à jour';
      break;
    }
    case 'request.save': {
      const input = object(action.request);
      const existing =
        input.id === undefined ? null : find(record.requests, input.id);
      if (
        input.status !== undefined ||
        input.note !== undefined ||
        input.validatedBy !== undefined ||
        input.validatedAt !== undefined
      )
        throw new HttpError(
          403,
          'La définition du besoin ne permet pas de valider sa disponibilité.'
        );
      const owner = option(input.owner, ['IT', 'RH', 'Manager']);
      const kind = option(input.kind, ['hardware', 'access']);
      if (existing && owner !== existing.owner)
        throw new HttpError(
          403,
          'Le service responsable ne peut pas être changé depuis une demande existante.'
        );
      if (
        (kind === 'access' && owner !== 'IT') ||
        (!existing &&
          (owner === 'Manager' ||
            (account.appRole === 'manager' && owner !== 'IT')))
      )
        throw new HttpError(
          403,
          'Ces besoins sont transmis à l’IT pour préparation et validation.'
        );
      const request: PreparationRequest = {
        id: existing?.id || randomUUID(),
        kind,
        title: text(input.title, 120),
        details: text(input.details, 1500),
        owner,
        dueDate: date(input.dueDate),
        status: 'requested',
        blocking: bool(input.blocking),
        note: '',
      };
      if (existing) {
        const changed = [
          'kind',
          'title',
          'details',
          'dueDate',
          'blocking',
        ].some(
          (key) =>
            existing[key as keyof PreparationRequest] !==
            request[key as keyof PreparationRequest]
        );
        if (changed) {
          Object.assign(existing, request);
          delete existing.validatedBy;
          delete existing.validatedAt;
        }
      } else record.requests.push(request);
      label = `${existing ? 'Suivi actualisé' : 'Demande créée'} : ${request.title}`;
      break;
    }
    case 'request.status': {
      const request = find(record.requests, action.id);
      const service = { manager: 'Manager', rh: 'RH', it: 'IT', employee: '' }[
        account.appRole
      ];
      if (request.owner !== service)
        throw new HttpError(
          403,
          'Vous ne pouvez valider que les demandes de votre service.'
        );
      request.status = option(action.status, [
        'requested',
        'in_progress',
        'ready',
        'blocked',
      ]);
      request.note = text(action.note, 1000, false);
      if (request.status === 'blocked' && !request.note)
        throw new HttpError(400, 'Précisez la cause du blocage.');
      delete request.validatedBy;
      delete request.validatedAt;
      if (request.status === 'ready') {
        request.validatedBy = `${account.firstName} ${account.lastName}`.trim();
        request.validatedAt = now;
      }
      label = `Traitement ${service} : ${request.title} · ${REQUEST_LABELS[request.status]}`;
      break;
    }
    case 'task.save': {
      const input = object(action.task);
      const existing =
        input.id === undefined ? null : find(record.tasks, input.id);
      if (
        (account.appRole === 'manager' &&
          (existing?.category === 'admin' || input.category === 'admin')) ||
        (account.appRole === 'rh' &&
          ((existing && existing.category !== 'admin') ||
            input.category !== 'admin'))
      )
        throw new HttpError(
          403,
          'Les tâches administratives sont pilotées par les RH ; les tâches d’intégration par le manager.'
        );
      if (existing?.id === 'task-j1-1')
        throw new HttpError(
          400,
          'La tâche de signature est gérée par le document.'
        );
      const milestoneId = option(input.milestoneId, [
        'prearrival',
        'j1',
        's1',
        's2',
        'j15',
        'j30',
      ]);
      const task: ManagedTask = {
        id: existing?.id || randomUUID(),
        title: text(input.title, 150),
        description: text(input.description, 1000, false),
        owner: option(
          input.owner,
          account.appRole === 'rh'
            ? ['rh', 'employee']
            : ['manager', 'employee']
        ),
        dueDate: date(input.dueDate),
        milestoneId,
        dayNumber: { prearrival: 0, j1: 1, s1: 3, s2: 8, j15: 15, j30: 30 }[
          milestoneId
        ],
        category: option(input.category, [
          'admin',
          'tech',
          'team',
          'culture',
          'project',
        ]),
      };
      if (existing) Object.assign(existing, task);
      else record.tasks.push(task);
      label = `Tâche ${existing ? 'adaptée' : 'attribuée'} : ${task.title}`;
      break;
    }
    case 'task.toggle': {
      const task = find(record.tasks, action.id);
      if (
        (account.appRole === 'manager' && task.category === 'admin') ||
        (account.appRole === 'rh' && task.category !== 'admin')
      )
        throw new HttpError(403, 'Cette tâche relève d’un autre périmètre.');
      if (task.owner !== account.appRole)
        throw new HttpError(
          403,
          'Seul le responsable peut terminer cette tâche.'
        );
      if (task.id === 'task-j1-1')
        throw new HttpError(400, 'Utilisez la page Documents pour signer.');
      const done = bool(action.done);
      record.employee.completedTaskIds =
        record.employee.completedTaskIds.filter((id) => id !== task.id);
      if (done) record.employee.completedTaskIds.push(task.id);
      label = `${done ? 'Tâche terminée' : 'Tâche rouverte'} : ${task.title}`;
      break;
    }
    case 'task.delete': {
      const task = find(record.tasks, action.id);
      if (
        (account.appRole === 'manager' && task.category === 'admin') ||
        (account.appRole === 'rh' && task.category !== 'admin')
      )
        throw new HttpError(403, 'Cette tâche relève d’un autre périmètre.');
      if (task.id === 'task-j1-1')
        throw new HttpError(
          400,
          'La tâche de signature ne peut pas être supprimée.'
        );
      record.tasks = record.tasks.filter((t) => t.id !== task.id);
      record.employee.completedTaskIds =
        record.employee.completedTaskIds.filter((id) => id !== task.id);
      label = `Tâche retirée : ${task.title}`;
      break;
    }
    case 'goal.save': {
      const existing =
        action.id === undefined ? null : find(record.goals, action.id);
      const goal = {
        id: existing?.id || randomUUID(),
        title: text(action.title, 300),
        dueDate: date(action.dueDate),
        done: bool(action.done),
      };
      if (existing) Object.assign(existing, goal);
      else record.goals.push(goal);
      label = `Objectif ${goal.done ? 'atteint' : 'actualisé'} : ${goal.title}`;
      break;
    }
    case 'meeting.save': {
      const meeting = find(record.meetings, action.id);
      Object.assign(meeting, {
        dueDate: date(action.dueDate),
        done: bool(action.done),
        notes: text(action.notes, 2000, false),
      });
      if (meeting.done && !meeting.notes)
        throw new HttpError(
          400,
          'Ajoutez un compte rendu avant de terminer le point.'
        );
      label = `${meeting.title} ${meeting.done ? 'réalisé' : 'planifié'}`;
      break;
    }
    case 'blocker.create': {
      const title = text(action.title, 500);
      record.blockers.push({ id: randomUUID(), title, createdAt: now });
      label = `Blocage signalé : ${title}`;
      break;
    }
    case 'blocker.resolve': {
      const blocker = find(record.blockers, action.id);
      if (blocker.resolvedAt)
        throw new HttpError(400, 'Ce blocage est déjà résolu.');
      blocker.response = text(action.response, 1000);
      blocker.resolvedAt = now;
      label = `Blocage résolu : ${blocker.title}`;
      break;
    }
    case 'feedback': {
      if (
        !Number.isInteger(action.rating) ||
        Number(action.rating) < 1 ||
        Number(action.rating) > 5
      )
        throw new HttpError(400, 'Choisissez une note de 1 à 5.');
      record.feedback = {
        rating: Number(action.rating),
        comment: text(action.comment, 1500, false),
        updatedAt: now,
      };
      label = 'Feedback du collaborateur actualisé';
      break;
    }
    case 'reminder': {
      record.notifications.unshift({
        id: randomUUID(),
        message: text(action.message, 500),
        createdAt: now,
        read: false,
      });
      label = 'Rappel ajouté dans l’espace collaborateur';
      break;
    }
    case 'notification.read': {
      if (String(action.id).startsWith('auto:')) {
        markAutomaticReminderRead(account, record, text(action.id, 200));
        return visibleRecord(account, record);
      }
      find(record.notifications, action.id).read = true;
      label = 'Rappel lu';
      break;
    }
    case 'sign': {
      const signature = text(action.signatureImage, 180000);
      if (!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(signature))
        throw new HttpError(400, 'Signature PNG invalide.');
      record.employee.contractSigned = true;
      record.employee.signatureImage = signature;
      record.employee.signatureDate = now;
      record.documents.forEach((d) => {
        d.status = 'signed';
        d.signedAt = now;
      });
      record.employee.completedTaskIds = [
        ...new Set([...record.employee.completedTaskIds, 'task-j1-1']),
      ];
      label = 'Signature de démonstration enregistrée (contrat et NDA)';
      break;
    }
    case 'reset': {
      if (process.env.DEMO_RESET_ENABLED !== 'true')
        throw new HttpError(
          403,
          'La réinitialisation est désactivée hors du mode de démonstration dédié.'
        );
      // Reset only the entrant's own progression; retain manager preparation and other users.
      record.employee.completedTaskIds =
        record.employee.completedTaskIds.filter((id) =>
          record.tasks.some((t) => t.id === id && t.owner !== 'employee')
        );
      record.employee.contractSigned = false;
      delete record.employee.signatureImage;
      delete record.employee.signatureDate;
      record.documents.forEach((d) => {
        d.status = 'pending';
        delete d.signedAt;
      });
      label = 'Progression collaborateur réinitialisée';
      break;
    }
    default:
      throw new HttpError(400, 'Action inconnue.');
  }
  record.activity.unshift({
    id: randomUUID(),
    actor: `${account.firstName} ${account.lastName}`,
    label,
    createdAt: now,
  });
  saveRecord(record, Number(body.version));
  return visibleRecord(account, record);
}
