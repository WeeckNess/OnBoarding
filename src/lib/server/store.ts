import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { INITIAL_EMPLOYEES, ROADMAP_TASKS, BUDDIES_DATA } from '../mockData';
import { DEMO_STAFF } from '../demoAccounts';
import { addDays, automaticReminders } from '../onboarding';
import type { Account, OnboardingRecord } from '@/types/manager';

const globalDb = globalThis as typeof globalThis & {
  onboardingDb?: DatabaseSync;
};
export function database() {
  if (globalDb.onboardingDb) return globalDb.onboardingDb;
  const path = resolve(
    process.env.ONBOARDING_DB_PATH || '.data/onboarding.sqlite'
  );
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS onboardings (id TEXT PRIMARY KEY, manager_id TEXT NOT NULL, version INTEGER NOT NULL, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, account_id TEXT NOT NULL, expires_at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS onboardings_manager ON onboardings(manager_id);
    CREATE TABLE IF NOT EXISTS schema_updates (id TEXT PRIMARY KEY);
    CREATE TABLE IF NOT EXISTS notification_reads (account_id TEXT NOT NULL, notification_id TEXT NOT NULL, PRIMARY KEY (account_id, notification_id));`);
  const insert = db.prepare(
    'INSERT OR IGNORE INTO onboardings (id, manager_id, version, data) VALUES (?, ?, ?, ?)'
  );
  for (const employee of INITIAL_EMPLOYEES) {
    const record: OnboardingRecord = {
      employee: structuredClone(employee),
      managerId:
        employee.id === 'emp-02' ? 'manager-claire' : 'manager-antoine',
      version: 1,
      welcome: { host: '', location: '', time: '09:00', message: '' },
      requests: [
        {
          id: `${employee.id}-laptop`,
          kind: 'hardware',
          title: 'Ordinateur portable',
          details: 'Poste de travail et chargeur à préparer avant l’arrivée.',
          owner: 'IT',
          dueDate: addDays(employee.startDate, -2),
          status: 'in_progress',
          blocking: true,
          note: '',
        },
        {
          id: `${employee.id}-vpn`,
          kind: 'access',
          title: 'VPN et dépôts de code',
          details: 'Préciser les projets et dépôts autorisés avec le manager.',
          owner: 'IT',
          dueDate: addDays(employee.startDate, -1),
          status: employee.id === 'emp-01' ? 'blocked' : 'requested',
          blocking: true,
          note:
            employee.id === 'emp-01'
              ? 'Liste des projets à confirmer au service IT.'
              : '',
        },
      ],
      documents: [
        { id: 'contract', title: 'Contrat de travail', status: 'pending' },
        { id: 'nda', title: 'Accord de confidentialité', status: 'pending' },
      ],
      tasks: ROADMAP_TASKS.map((t) => ({
        ...t,
        owner: 'employee',
        ...(t.id === 'task-j1-1'
          ? { milestoneId: 'prearrival' as const, dayNumber: 0 }
          : {}),
        dueDate: addDays(
          employee.startDate,
          t.id === 'task-j1-1' ? -3 : t.dayNumber - 1
        ),
      })),
      goals: [],
      meetings: [1, 7, 30].map((day) => ({
        id: `meeting-${day}`,
        title: day === 1 ? 'Accueil J1' : `Point J+${day}`,
        dueDate: addDays(employee.startDate, day === 1 ? 0 : day),
        done: false,
        notes: '',
      })),
      blockers: [],
      feedback: null,
      notifications: [],
      activity: [
        {
          id: randomUUID(),
          actor: 'Midi Agency',
          label: 'Dossier de démonstration initialisé',
          createdAt: new Date().toISOString(),
        },
      ],
    };
    insert.run(
      employee.id,
      record.managerId,
      record.version,
      JSON.stringify(record)
    );
  }
  if (
    !db
      .prepare('SELECT id FROM schema_updates WHERE id = ?')
      .get('role-boundaries-v1')
  ) {
    db.exec('BEGIN IMMEDIATE');
    try {
      for (const row of db.prepare('SELECT id, data FROM onboardings').all()) {
        const record: OnboardingRecord = JSON.parse(row.data as string);
        let changed = false;
        const signatureTask = record.tasks.find((t) => t.id === 'task-j1-1');
        if (
          signatureTask?.milestoneId === 'j1' &&
          signatureTask.dueDate === record.employee.startDate
        ) {
          signatureTask.milestoneId = 'prearrival';
          signatureTask.dayNumber = 0;
          signatureTask.dueDate = addDays(record.employee.startDate, -3);
          changed = true;
        }
        for (const request of record.requests) {
          if (request.status === 'ready' && !request.validatedAt) {
            request.status = 'requested';
            request.note =
              'Disponibilité à reconfirmer par le service responsable. ' +
              request.note;
            changed = true;
          }
        }
        if (changed) {
          record.version++;
          record.activity.unshift({
            id: randomUUID(),
            actor: 'Midi Agency',
            label:
              'Signature placée en pré-arrivée ; disponibilités historiques à confirmer par le responsable',
            createdAt: new Date().toISOString(),
          });
          db.prepare(
            'UPDATE onboardings SET data = ?, version = ? WHERE id = ?'
          ).run(JSON.stringify(record), record.version, row.id);
        }
      }
      db.prepare('INSERT INTO schema_updates VALUES (?)').run(
        'role-boundaries-v1'
      );
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
  if (
    !db
      .prepare('SELECT id FROM schema_updates WHERE id = ?')
      .get('prototype-role-content-v1')
  ) {
    db.exec('BEGIN IMMEDIATE');
    try {
      for (const row of db.prepare('SELECT id, data FROM onboardings').all()) {
        const record: OnboardingRecord = JSON.parse(row.data as string);
        let changed = false;
        const finalTask = record.tasks.find((t) => t.id === 'task-j30-3');
        if (
          finalTask?.category === 'admin' &&
          finalTask.title ===
            'Célébration du 1er Mois & Clôture de l’Onboarding'
        ) {
          finalTask.category = 'team';
          if (
            finalTask.description ===
            'Point final d’onboarding, validation de la période d’essai initiale et apéro d’équipe ! 🎉'
          )
            finalTask.description =
              'Faire le bilan d’intégration avec ton manager, définir les prochaines étapes et célébrer avec l’équipe. 🎉';
          changed = true;
        }
        const badgeTask = record.tasks.find((t) => t.id === 'task-j1-5');
        if (
          badgeTask?.description ===
          'Passer voir Julie aux RH pour valider ton badge physique et mettre ta photo sur Slack / Notion.'
        ) {
          badgeTask.description =
            'Contacter les RH pour valider ton badge physique et mettre à jour ta photo de profil.';
          changed = true;
        }
        if (changed) {
          record.version++;
          record.activity.unshift({
            id: randomUUID(),
            actor: 'Midi Agency',
            label:
              'Libellés du prototype alignés sur les responsabilités RH et manager',
            createdAt: new Date().toISOString(),
          });
          db.prepare(
            'UPDATE onboardings SET data = ?, version = ? WHERE id = ?'
          ).run(JSON.stringify(record), record.version, row.id);
        }
      }
      db.prepare('INSERT INTO schema_updates VALUES (?)').run(
        'prototype-role-content-v1'
      );
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
  globalDb.onboardingDb = db;
  return db;
}
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
export function recordById(id: string): OnboardingRecord {
  const row = database()
    .prepare('SELECT data FROM onboardings WHERE id = ?')
    .get(id);
  if (!row) throw new HttpError(404, 'Dossier introuvable.');
  return JSON.parse(row.data as string);
}
export function authorize(account: Account, record: OnboardingRecord) {
  const allowed =
    account.appRole === 'manager'
      ? record.managerId === account.id
      : account.appRole === 'employee'
        ? record.employee.id === account.id
        : account.appRole === 'rh'
          ? true
          : account.appRole === 'it'
            ? record.requests.some((r) => r.owner === 'IT')
            : false;
  if (!allowed)
    throw new HttpError(403, 'Ce dossier ne fait pas partie de votre espace.');
}
export function visibleRecord(
  account: Account,
  record: OnboardingRecord
): OnboardingRecord {
  const result = structuredClone(record);
  if (account.appRole !== 'employee') delete result.employee.signatureImage;
  const buddy = BUDDIES_DATA[result.employee.buddyId];
  const buddyTask = result.tasks.find((t) => t.id === 'task-j1-3');
  if (
    buddyTask &&
    [
      'Café d’accueil avec Camille (Ton Buddy)',
      'Café d’accueil avec ton buddy',
    ].includes(buddyTask.title)
  )
    buddyTask.title = buddy
      ? `Café d’accueil avec ${buddy.name}`
      : 'Café d’accueil avec ton buddy';
  if (account.appRole === 'employee') {
    const reminders = automaticReminders(result);
    const read = new Set(
      database()
        .prepare(
          'SELECT notification_id FROM notification_reads WHERE account_id = ?'
        )
        .all(account.id)
        .map((row) => row.notification_id)
    );
    result.notifications = [
      ...reminders.map((n) => ({ ...n, read: read.has(n.id) })),
      ...result.notifications,
    ];
  }
  if (account.appRole === 'rh' || account.appRole === 'it') {
    result.goals = [];
    result.meetings = [];
    result.feedback = null;
    result.blockers = [];
    result.notifications = [];
    result.activity = [];
    result.welcome = {
      host: '',
      location: record.welcome.location,
      time: '',
      message: '',
    };
    result.employee.buddyId = '';
    if (account.appRole === 'it') {
      result.requests = result.requests.filter((r) => r.owner === 'IT');
      result.documents = [];
      result.tasks = [];
      result.employee.completedTaskIds = [];
      result.employee.contractSigned = false;
      delete result.employee.signatureDate;
    } else {
      result.tasks = result.tasks.filter((t) => t.category === 'admin');
      result.employee.completedTaskIds =
        result.employee.completedTaskIds.filter((id) =>
          result.tasks.some((t) => t.id === id)
        );
    }
  }
  return result;
}
export function recordsFor(account: Account) {
  const rows =
    account.appRole === 'manager'
      ? database()
          .prepare(
            'SELECT data FROM onboardings WHERE manager_id = ? ORDER BY id'
          )
          .all(account.id)
      : account.appRole === 'employee'
        ? database()
            .prepare('SELECT data FROM onboardings WHERE id = ?')
            .all(account.id)
        : database().prepare('SELECT data FROM onboardings ORDER BY id').all();
  return rows
    .filter(
      (row) =>
        account.appRole !== 'it' ||
        JSON.parse(row.data as string).requests.some(
          (r: { owner: string }) => r.owner === 'IT'
        )
    )
    .map((row) => visibleRecord(account, JSON.parse(row.data as string)));
}
export function saveRecord(record: OnboardingRecord, expectedVersion: number) {
  record.version = expectedVersion + 1;
  const result = database()
    .prepare(
      'UPDATE onboardings SET data = ?, version = ? WHERE id = ? AND version = ?'
    )
    .run(
      JSON.stringify(record),
      record.version,
      record.employee.id,
      expectedVersion
    );
  if (Number(result.changes) !== 1)
    throw new HttpError(
      409,
      'Ce dossier a été modifié dans un autre espace. Actualisez-le puis réessayez.'
    );
}
function hash(value: string) {
  return createHash('sha256').update(value).digest('hex');
}
export function createSession(email: string) {
  if (process.env.DEMO_ACCESS_ENABLED === 'false')
    throw new HttpError(503, 'Les accès de démonstration sont désactivés.');
  const account =
    DEMO_STAFF.find((a) => a.email === email) ||
    INITIAL_EMPLOYEES.find((a) => a.email === email);
  if (!account)
    throw new HttpError(
      400,
      'Choisissez un des profils de démonstration proposés.'
    );
  const db = database();
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
  const token = randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions VALUES (?, ?, ?)').run(
    hash(token),
    account.id,
    Date.now() + 8 * 60 * 60 * 1000
  );
  return token;
}
export function sessionAccount(token: string | undefined): Account | null {
  if (!token || process.env.DEMO_ACCESS_ENABLED === 'false') return null;
  const row = database()
    .prepare(
      'SELECT account_id FROM sessions WHERE token_hash = ? AND expires_at > ?'
    )
    .get(hash(token), Date.now());
  if (!row) return null;
  const manager = DEMO_STAFF.find((a) => a.id === row.account_id);
  return (
    manager || {
      ...recordById(row.account_id as string).employee,
      appRole: 'employee',
    }
  );
}
export function deleteSession(token: string | undefined) {
  if (token)
    database()
      .prepare('DELETE FROM sessions WHERE token_hash = ?')
      .run(hash(token));
}

export function markAutomaticReminderRead(
  account: Account,
  record: OnboardingRecord,
  id: string
) {
  if (!automaticReminders(record).some((n) => n.id === id))
    throw new HttpError(404, 'Rappel introuvable.');
  database()
    .prepare('INSERT OR IGNORE INTO notification_reads VALUES (?, ?)')
    .run(account.id, id);
}
