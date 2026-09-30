import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { INITIAL_EMPLOYEES, ROADMAP_TASKS } from '../mockData';
import { DEMO_MANAGERS } from '../demoAccounts';
import { addDays } from '../onboarding';
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
    CREATE INDEX IF NOT EXISTS onboardings_manager ON onboardings(manager_id);`);
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
        dueDate: addDays(employee.startDate, t.dayNumber - 1),
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
  if (
    account.appRole === 'manager'
      ? record.managerId !== account.id
      : record.employee.id !== account.id
  )
    throw new HttpError(403, 'Ce dossier ne fait pas partie de votre espace.');
}
export function visibleRecord(
  account: Account,
  record: OnboardingRecord
): OnboardingRecord {
  const result = structuredClone(record);
  // Managers receive document status only, never the employee's signature image.
  if (account.appRole === 'manager') delete result.employee.signatureImage;
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
      : database()
          .prepare('SELECT data FROM onboardings WHERE id = ?')
          .all(account.id);
  return rows.map((row) =>
    visibleRecord(account, JSON.parse(row.data as string))
  );
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
    DEMO_MANAGERS.find((a) => a.email === email) ||
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
  const manager = DEMO_MANAGERS.find((a) => a.id === row.account_id);
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
