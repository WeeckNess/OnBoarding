import { randomUUID } from 'node:crypto';
import { BUDDIES_DATA } from '../mockData';
import {
  HttpError,
  authorize,
  recordById,
  saveRecord,
  visibleRecord,
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
export async function applyAction(account: Account, id: string, payload: unknown) {
  const body = object(payload);
  if (!Number.isInteger(body.version) || Number(body.version) < 1)
    throw new HttpError(400, 'Version du dossier requise.');
  const action = object(body.action);
  const record = await recordById(id);
  authorize(account, record);
  if (record.version !== body.version)
    throw new HttpError(
      409,
      'Ce dossier a évolué. Actualisez-le avant de réessayer.'
    );
  const managerActions = [
    'welcome',
    'request.save',
    'task.save',
    'task.delete',
    'goal.save',
    'meeting.save',
    'blocker.resolve',
    'reminder',
    'elearning.session.add',
  ];
  const employeeActions = [
    'blocker.create',
    'coffee.reserve',
    'feedback',
    'notification.read',
    'sign',
    'elearning.session.complete',
    'document.sign',
    'reset',
  ];
  if (
    (managerActions.includes(String(action.type)) &&
      account.appRole !== 'manager') ||
    (employeeActions.includes(String(action.type)) &&
      account.appRole !== 'employee') ||
    (action.type === 'hr.compliance.set' && account.appRole !== 'admin')
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
  if (action.type === 'document.add' && !['manager', 'rh', 'admin'].includes(account.appRole))
    throw new HttpError(403, 'L’envoi de documents est réservé au manager et aux RH.');
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
      const request: PreparationRequest = {
        id: existing?.id || randomUUID(),
        kind: option(input.kind, ['hardware', 'access']),
        title: text(input.title, 120),
        details: text(input.details, 1500),
        owner: option(input.owner, ['IT', 'RH', 'Manager']),
        dueDate: date(input.dueDate),
        status: option(input.status, [
          'requested',
          'in_progress',
          'ready',
          'blocked',
        ]),
        blocking: bool(input.blocking),
        note: text(input.note, 1000, false),
      };
      if (request.status === 'blocked' && !request.note)
        throw new HttpError(400, 'Précisez la cause du blocage.');
      if (existing) Object.assign(existing, request);
      else record.requests.push(request);
      label = `${existing ? 'Suivi actualisé' : 'Demande créée'} : ${request.title}`;
      break;
    }
    case 'task.save': {
      const input = object(action.task);
      const existing =
        input.id === undefined ? null : find(record.tasks, input.id);
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
        owner: option(input.owner, ['manager', 'employee']),
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
    case 'document.add': {
      if (record.documents.length >= 100) throw new HttpError(400, 'Limite de documents atteinte.');
      const title = text(action.title, 150);
      const description = text(action.description, 5000, false);
      const resourceUrl = text(action.resourceUrl, 1000, false);
      if (!description && !resourceUrl)
        throw new HttpError(400, 'Ajoutez le contenu du document ou un lien vers celui-ci.');
      if (resourceUrl) {
        let parsed: URL;
        try { parsed = new URL(resourceUrl); } catch { throw new HttpError(400, 'Lien invalide.'); }
        if (!['http:', 'https:'].includes(parsed.protocol))
          throw new HttpError(400, 'Le lien doit commencer par http:// ou https://.');
      }
      record.documents.push({
        id: randomUUID(), title, description, resourceUrl,
        requestedBy: `${account.firstName} ${account.lastName}`.trim(),
        status: 'pending',
      });
      label = `Document envoyé pour signature : ${title}`;
      break;
    }
    case 'document.sign': {
      const document = find(record.documents, action.id);
      if (['contract', 'nda'].includes(document.id))
        throw new HttpError(400, 'Utilisez la signature du contrat prérempli.');
      if (document.status === 'signed') throw new HttpError(400, 'Ce document est déjà signé.');
      const signature = text(action.signatureImage, 180000);
      if (!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(signature))
        throw new HttpError(400, 'Signature PNG invalide.');
      document.status = 'signed';
      document.signedAt = now;
      document.signatureData = signature;
      label = `Document signé : ${document.title}`;
      break;
    }
    case 'elearning.session.add': {
      const input = object(action.session);
      const resourceUrl = text(input.resourceUrl, 1000, false);
      if (resourceUrl) {
        let parsed: URL;
        try { parsed = new URL(resourceUrl); } catch { throw new HttpError(400, 'Lien invalide.'); }
        if (!['http:', 'https:'].includes(parsed.protocol))
          throw new HttpError(400, 'Le lien doit commencer par http:// ou https://.');
      }
      const duration = input.durationMinutes;
      if (duration !== null && (!Number.isInteger(duration) || Number(duration) < 1 || Number(duration) > 1440))
        throw new HttpError(400, 'Durée invalide (1 à 1440 minutes).');
      record.elearningSessions ||= [];
      const session = {
        id: randomUUID(),
        title: text(input.title, 150),
        description: text(input.description, 2000, false),
        category: text(input.category, 100),
        durationMinutes: duration === null ? null : Number(duration),
        resourceUrl,
        dueDate: input.dueDate ? date(input.dueDate) : '',
        createdAt: now,
      };
      record.elearningSessions.push(session);
      label = `Session e-learning ajoutée : ${session.title}`;
      break;
    }
    case 'elearning.session.complete': {
      const session = find(record.elearningSessions || [], action.id);
      if (!session.completedAt) session.completedAt = now;
      label = `Session e-learning terminée : ${session.title}`;
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
    case 'coffee.reserve': {
      const time = text(action.time, 5);
      if (!['09:30', '10:30', '14:00', '15:30'].includes(time))
        throw new HttpError(400, 'Ce créneau café n’est pas disponible.');
      const reservation = record.meetings.find(
        (meeting) => meeting.id === 'coffee-reservation'
      );
      const coffee = {
        id: 'coffee-reservation',
        title: 'Café d’accueil avec ton buddy',
        dueDate: record.employee.startDate,
        done: false,
        notes: `${time} · 30 min`,
      };
      if (reservation) Object.assign(reservation, coffee);
      else record.meetings.push(coffee);
      label = `Café d’accueil réservé à ${time}`;
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
      find(record.notifications, action.id).read = true;
      label = 'Rappel lu';
      break;
    }
    case 'hr.compliance.set': {
      const key = option(action.key, [
        'dpae',
        'mutuelle',
        'rib',
        'identity',
        'socialSecurity',
        'itCharter',
      ] as const);
      const status = option(action.status, ['pending', 'complete'] as const);
      record.hrCompliance ||= {
        dpae: 'pending',
        mutuelle: 'pending',
        rib: 'pending',
        identity: 'pending',
        socialSecurity: 'pending',
        itCharter: 'pending',
      };
      record.hrCompliance[key] = status;
      const labelText: Record<typeof key, string> = {
        dpae: 'DPAE',
        mutuelle: 'Mutuelle',
        rib: 'RIB',
        identity: 'Pièce d’identité',
        socialSecurity: 'Attestation Sécurité sociale',
        itCharter: 'Charte informatique',
      };
      label = `${labelText[key]} ${status === 'complete' ? 'validée' : 'rouverte'}`;
      break;
    }
    case 'sign': {
      const signature = text(action.signatureImage, 180000);
      if (!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(signature))
        throw new HttpError(400, 'Signature PNG invalide.');
      record.employee.contractSigned = true;
      record.employee.signatureImage = signature;
      record.employee.signatureDate = now;
      record.documents
        .filter((document) => ['contract', 'nda'].includes(document.id))
        .forEach((document) => {
          document.status = 'signed';
          document.signedAt = now;
          document.signatureData = signature;
        });
      record.employee.completedTaskIds = [
        ...new Set([...record.employee.completedTaskIds, 'task-j1-1']),
      ];
      label = 'Signature de démonstration enregistrée (contrat et NDA)';
      break;
    }
    case 'reset': {
      // Reset only the entrant's own progression; retain manager preparation and other users.
      record.employee.completedTaskIds =
        record.employee.completedTaskIds.filter((id) =>
          record.tasks.some((t) => t.id === id && t.owner === 'manager')
        );
      record.employee.contractSigned = false;
      delete record.employee.signatureImage;
      delete record.employee.signatureDate;
      record.documents.forEach((d) => {
        d.status = 'pending';
        delete d.signedAt;
        delete d.signatureData;
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
  await saveRecord(record, Number(body.version));
  return visibleRecord(account, record);
}
