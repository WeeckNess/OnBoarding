import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { BUDDIES_DATA, ROADMAP_TASKS } from '../mockData';
import { MOCK_ADMINS, MOCK_MANAGERS } from '../mockAccounts';
import {
  LUCCA_MOCK_DIRECTORY,
  type LuccaMockPerson,
} from '../integrations/lucca/mockDirectory';
import { addDays, dateOnly } from '../onboarding';
import { alertsFor } from '../onboarding';
import type { Account, OnboardingRecord } from '@/types/manager';
import { supabaseAdmin, supabaseIsConfigured } from './supabase';

const globalDb = globalThis as typeof globalThis & {
  /** Versioned cache key prevents Next dev HMR from reusing the prototype DB handle. */
  dataInsightOnboardingDbV3?: { path: string; connection: DatabaseSync };
};

function newRecord(person: LuccaMockPerson): OnboardingRecord {
  const today = dateOnly();
  const daysSinceStart = Math.max(
    0,
    Math.floor(
      (Date.parse(`${today}T12:00:00Z`) -
        Date.parse(`${person.startDate}T12:00:00Z`)) /
        86_400_000
    )
  );
  const contractSigned =
    daysSinceStart > 1 && Number(person.id.slice(-2)) % 5 !== 0;
  const completedTaskIds = ROADMAP_TASKS.filter(
    (task) =>
      task.dayNumber <= Math.min(daysSinceStart, 30) &&
      (task.id !== 'task-j1-1' || contractSigned)
  ).map((task) => task.id);
  const requestsReady = daysSinceStart > 5;

  return {
    employee: {
      ...person,
      contractSigned,
      ...(contractSigned
        ? { signatureDate: addDays(person.startDate, -1) }
        : {}),
      completedTaskIds,
    },
    managerId: person.managerId,
    version: 1,
    hrCompliance: {
      dpae: Number(person.id.slice(-2)) % 6 === 0 ? 'pending' : 'complete',
      mutuelle: Number(person.id.slice(-3)) % 4 === 0 ? 'pending' : 'complete',
      rib: Number(person.id.slice(-2)) % 5 === 0 ? 'pending' : 'complete',
      identity: Number(person.id.slice(-2)) % 7 === 0 ? 'pending' : 'complete',
      socialSecurity: Number(person.id.slice(-2)) % 8 === 0 ? 'pending' : 'complete',
      itCharter: contractSigned ? 'complete' : 'pending',
    },
    welcome: {
      host: daysSinceStart > 0 ? person.managerName.split(' (')[0] : '',
      location: daysSinceStart > 0 ? person.office : '',
      time: '09:00',
      message:
        daysSinceStart > 0
          ? `Bienvenue chez Data Insight, ${person.firstName} !`
          : '',
    },
    requests: [
      {
        id: `${person.id}-laptop`,
        kind: 'hardware',
        title: 'Ordinateur portable',
        details: 'Poste de travail et chargeur à préparer avant l’arrivée.',
        owner: 'IT',
        dueDate: addDays(person.startDate, -2),
        status: requestsReady ? 'ready' : 'in_progress',
        blocking: true,
        note: '',
      },
      {
        id: `${person.id}-access`,
        kind: 'access',
        title: 'Accès aux outils et dépôts',
        details: 'Préparer les accès correspondant au poste du collaborateur.',
        owner: 'IT',
        dueDate: addDays(person.startDate, -1),
        status:
          requestsReady
            ? 'ready'
            : Number(person.id.slice(-2)) % 7 === 0
              ? 'blocked'
              : 'requested',
        blocking: true,
        note:
          !requestsReady && Number(person.id.slice(-2)) % 7 === 0
            ? 'Droits à confirmer avec le manager.'
            : '',
      },
    ],
    documents: [
      {
        id: 'contract',
        title: 'Contrat de travail',
        status: contractSigned ? 'signed' : 'pending',
        ...(contractSigned ? { signedAt: addDays(person.startDate, -1) } : {}),
      },
      {
        id: 'nda',
        title: 'Accord de confidentialité',
        status: contractSigned ? 'signed' : 'pending',
        ...(contractSigned ? { signedAt: addDays(person.startDate, -1) } : {}),
      },
    ],
    tasks: ROADMAP_TASKS.map((task) => ({
      ...task,
      owner: 'employee' as const,
      dueDate: addDays(person.startDate, task.dayNumber - 1),
    })),
    elearningSessions: [],
    goals: [],
    meetings: [1, 7, 30].map((day) => ({
      id: `meeting-${day}`,
      title: day === 1 ? 'Accueil J1' : `Point J+${day}`,
      dueDate: addDays(person.startDate, day === 1 ? 0 : day),
      done: daysSinceStart >= day,
      notes: daysSinceStart >= day ? 'Point réalisé dans le scénario fictif.' : '',
    })),
    blockers: [],
    feedback: null,
    notifications: [],
    activity: [
      {
        id: randomUUID(),
        actor: 'Lucca · annuaire simulé',
        label: 'Fiche salariée importée dans le scénario',
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

/** Local Supabase emulator: SQLite keeps the app usable without external credentials. */
export function database() {
  const path = resolve(
    process.env.ONBOARDING_DB_PATH || '.data/onboarding-supabase-mock.sqlite'
  );
  const cached = globalDb.dataInsightOnboardingDbV3;
  if (cached?.path === path) return cached.connection;
  cached?.connection.close();
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS onboardings (id TEXT PRIMARY KEY, manager_id TEXT NOT NULL, version INTEGER NOT NULL, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, account_id TEXT NOT NULL, expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS lucca_mock_people (person_id TEXT PRIMARY KEY, employee_id TEXT UNIQUE NOT NULL, manager_id TEXT NOT NULL, employment_status TEXT NOT NULL, payload TEXT NOT NULL, imported_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS workspace_settings (setting_key TEXT PRIMARY KEY, setting_value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS notification_reads (account_id TEXT NOT NULL, notification_id TEXT NOT NULL, PRIMARY KEY (account_id, notification_id));
    CREATE INDEX IF NOT EXISTS onboardings_manager ON onboardings(manager_id);
    CREATE INDEX IF NOT EXISTS lucca_people_manager ON lucca_mock_people(manager_id);`);
  db.exec('DROP TABLE IF EXISTS account_credentials;');

  const importPerson = db.prepare(
    `INSERT OR IGNORE INTO lucca_mock_people
      (person_id, employee_id, manager_id, employment_status, payload, imported_at)
      VALUES (?, ?, ?, ?, ?, ?)`
  );
  const addOnboarding = db.prepare(
    'INSERT OR IGNORE INTO onboardings (id, manager_id, version, data) VALUES (?, ?, ?, ?)'
  );
  for (const person of LUCCA_MOCK_DIRECTORY) {
    importPerson.run(
      person.sourcePersonId,
      person.id,
      person.managerId,
      person.employmentStatus,
      JSON.stringify(person),
      new Date().toISOString()
    );
    const imported = db
      .prepare('SELECT payload FROM lucca_mock_people WHERE employee_id = ?')
      .get(person.id) as { payload: string } | undefined;
    if (!imported) continue;
    const sourcePerson = JSON.parse(imported.payload) as LuccaMockPerson;
    const record = newRecord(sourcePerson);
    addOnboarding.run(
      sourcePerson.id,
      sourcePerson.managerId,
      record.version,
      JSON.stringify(record)
    );
  }
  db.prepare(
    'INSERT OR IGNORE INTO workspace_settings (setting_key, setting_value) VALUES (?, ?)'
  ).run('headcount_projection', JSON.stringify({ baseline: 50, target: 70, targetDate: '2027-12-31' }));

  globalDb.dataInsightOnboardingDbV3 = { path, connection: db };
  return db;
}

function automaticReminders(record: OnboardingRecord) {
  return alertsFor(record).map((alert) => ({
    id: `automatic-${record.employee.id}-${alert.id}`,
    message: alert.title,
    createdAt: new Date().toISOString(),
    read: false,
    source: 'automatic' as const,
  }));
}

export class HttpError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
function remoteEmployee(row: Record<string, any>, record: Record<string, any>, signature?: Record<string, any>): OnboardingRecord['employee'] {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    role: row.role,
    department: row.department,
    startDate: row.start_date,
    contractSigned: Boolean(signature),
    ...(signature ? { signatureDate: signature.signed_at, signatureImage: signature.signature_data } : {}),
    buddyId: row.buddy_id,
    managerName: row.manager_name,
    completedTaskIds: record.completed_task_ids || [],
  };
}

function remoteRecord(row: Record<string, any>, signature?: Record<string, any>): OnboardingRecord {
  const employeeRow = Array.isArray(row.employees) ? row.employees[0] : row.employees;
  if (!employeeRow) throw new HttpError(500, 'Salarié associé au parcours introuvable.');
  return {
    employee: remoteEmployee(employeeRow, row, signature),
    managerId: row.manager_id,
    version: row.version,
    hrCompliance: row.hr_compliance || undefined,
    welcome: row.welcome,
    requests: row.requests || [],
    documents: row.documents || [],
    tasks: row.tasks || [],
    elearningSessions: row.elearning_sessions || [],
    goals: row.goals || [],
    meetings: row.meetings || [],
    blockers: row.blockers || [],
    feedback: row.feedback,
    notifications: row.notifications || [],
    activity: row.activity || [],
  };
}

let warnedMissingNotificationReads = false;

function isMissingNotificationReads(error: { message: string; code?: string } | null) {
  if (!error) return false;
  return (
    error.code === 'PGRST205' ||
    error.code === '42P01' ||
    (error.message.toLowerCase().includes('notification_reads') &&
      /schema cache|does not exist|could not find/i.test(error.message))
  );
}

function warnMissingNotificationReads() {
  if (warnedMissingNotificationReads) return;
  warnedMissingNotificationReads = true;
  console.warn(
    'Supabase table notification_reads is missing; automatic reminder reads will not persist until migrations are applied.'
  );
}

function throwSupabase(error: { message: string; code?: string } | null): asserts error is null {
  if (error) {
    console.error('Supabase data error', error.code || 'unknown', error.message);
    throw new HttpError(503, 'Le stockage Supabase est indisponible. Vérifiez la migration et réessayez.');
  }
}

export async function recordById(id: string): Promise<OnboardingRecord> {
  if (supabaseIsConfigured()) {
    const client = supabaseAdmin();
    const { data, error } = await client.from('onboarding_records').select('*, employees(*)').eq('employee_id', id).maybeSingle();
    throwSupabase(error);
    if (!data) throw new HttpError(404, 'Dossier introuvable.');
    const { data: signature, error: signatureError } = await client.from('employee_signatures').select('*').eq('employee_id', id).maybeSingle();
    throwSupabase(signatureError);
    return remoteRecord(data, signature || undefined);
  }
  const row = database()
    .prepare('SELECT data FROM onboardings WHERE id = ?')
    .get(id) as { data: string } | undefined;
  if (!row) throw new HttpError(404, 'Dossier introuvable.');
  return JSON.parse(row.data) as OnboardingRecord;
}
export function authorize(account: Account, record: OnboardingRecord) {
  if (
    account.appRole === 'admin'
      ? false
      : account.appRole === 'manager'
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
  // Non-employee portals receive document status only, never signature images.
  if (account.appRole !== 'employee') delete result.employee.signatureImage;
  if (account.appRole !== 'employee')
    result.documents.forEach((document) => delete document.signatureData);
  const buddy = BUDDIES_DATA[result.employee.buddyId];
  const buddyTask = result.tasks.find((task) => task.id === 'task-j1-3');
  if (buddyTask && ['Café d’accueil avec Camille (Ton Buddy)', 'Café d’accueil avec ton buddy'].includes(buddyTask.title))
    buddyTask.title = buddy ? `Café d’accueil avec ${buddy.name}` : 'Café d’accueil avec ton buddy';
  if (account.appRole === 'employee') {
    const reminders = automaticReminders(result);
    const read = new Set<string>(supabaseIsConfigured() ? [] :
      database().prepare('SELECT notification_id FROM notification_reads WHERE account_id = ?')
        .all(account.id).map((row) => (row as { notification_id: string }).notification_id));
    result.notifications = [...reminders.map((notification) => ({ ...notification, read: read.has(notification.id) })), ...result.notifications];
  }
  if (account.appRole === 'rh' || account.appRole === 'it') {
    result.goals = [];
    result.meetings = [];
    result.feedback = null;
    result.blockers = [];
    result.notifications = [];
    result.activity = [];
    result.welcome = { host: '', location: record.welcome.location, time: '', message: '' };
    result.employee.buddyId = '';
    if (account.appRole === 'it') {
      result.requests = result.requests.filter((request) => request.owner === 'IT');
      result.documents = [];
      result.tasks = [];
      result.employee.completedTaskIds = [];
      result.employee.contractSigned = false;
      delete result.employee.signatureDate;
    } else {
      result.tasks = result.tasks.filter((task) => task.category === 'admin');
      result.employee.completedTaskIds = result.employee.completedTaskIds.filter((id) => result.tasks.some((task) => task.id === id));
    }
  }
  return result;
}
export async function recordsFor(account: Account): Promise<OnboardingRecord[]> {
  if (supabaseIsConfigured()) {
    const client = supabaseAdmin();
    let query = client.from('onboarding_records').select('*, employees(*)');
    query = account.appRole === 'admin'
      ? query
      : account.appRole === 'manager'
        ? query.eq('manager_id', account.id)
        : query.eq('employee_id', account.id);
    const { data, error } = await query.order('employee_id');
    throwSupabase(error);
    const ids = (data || []).map((row) => row.employee_id);
    const signatures = ids.length
      ? await client.from('employee_signatures').select('*').in('employee_id', ids)
      : { data: [], error: null };
    throwSupabase(signatures.error);
    const byEmployee = new Map((signatures.data || []).map((row) => [row.employee_id, row]));
    const visible = (data || [])
      .map((row) => remoteRecord(row, byEmployee.get(row.employee_id)))
      .filter((record) => account.appRole !== 'it' || record.requests.some((request) => request.owner === 'IT'))
      .map((record) => visibleRecord(account, record));
    if (account.appRole === 'employee') {
      const { data: readRows, error: readError } = await client.from('notification_reads')
        .select('notification_id').eq('account_id', account.id);
      if (isMissingNotificationReads(readError)) warnMissingNotificationReads();
      else throwSupabase(readError);
      const read = new Set((readRows || []).map((row) => row.notification_id));
      return visible.map((record) => ({
        ...record,
        notifications: record.notifications.map((notification) =>
          notification.source === 'automatic'
            ? { ...notification, read: read.has(notification.id) }
            : notification
        ),
      }));
    }
    return visible;
  }
  const rows =
    account.appRole === 'admin'
      ? database()
          .prepare('SELECT data FROM onboardings ORDER BY id')
          .all()
      : account.appRole === 'manager'
        ? database()
          .prepare(
            'SELECT data FROM onboardings WHERE manager_id = ? ORDER BY id'
          )
          .all(account.id)
        : database()
          .prepare('SELECT data FROM onboardings WHERE id = ?')
          .all(account.id);
  return rows.map((row) =>
    visibleRecord(account, JSON.parse((row as { data: string }).data))
  );
}
export async function saveRecord(record: OnboardingRecord, expectedVersion: number) {
  if (supabaseIsConfigured()) {
    const client = supabaseAdmin();
    const employeeId = record.employee.id;
    const { data, error } = await client.from('onboarding_records').update({
      manager_id: record.managerId,
      version: expectedVersion + 1,
      hr_compliance: record.hrCompliance || null,
      welcome: record.welcome,
      requests: record.requests,
      documents: record.documents,
      tasks: record.tasks,
      ...((record.elearningSessions || []).length
        ? { elearning_sessions: record.elearningSessions }
        : {}),
      completed_task_ids: record.employee.completedTaskIds,
      goals: record.goals,
      meetings: record.meetings,
      blockers: record.blockers,
      feedback: record.feedback,
      notifications: record.notifications,
      activity: record.activity,
      updated_at: new Date().toISOString(),
    }).eq('employee_id', employeeId).eq('version', expectedVersion).select('employee_id').maybeSingle();
    throwSupabase(error);
    if (!data) throw new HttpError(409, 'Ce dossier a été modifié dans un autre espace. Actualisez-le puis réessayez.');
    const { error: employeeError } = await client.from('employees').update({ buddy_id: record.employee.buddyId }).eq('id', employeeId);
    throwSupabase(employeeError);
    if (record.employee.signatureImage && record.employee.signatureDate) {
      const { error: signatureError } = await client.from('employee_signatures').upsert({
        employee_id: employeeId,
        signature_data: record.employee.signatureImage,
        signed_at: record.employee.signatureDate,
      });
      throwSupabase(signatureError);
    } else {
      const { error: signatureError } = await client.from('employee_signatures').delete().eq('employee_id', employeeId);
      throwSupabase(signatureError);
    }
    record.version = expectedVersion + 1;
    return;
  }
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
export async function createSession(email: string) {
  if (supabaseIsConfigured()) {
    const client = supabaseAdmin();
    const adminResult = await client.from('admins').select('*').eq('email', email).maybeSingle();
    throwSupabase(adminResult.error);
    let accountId = adminResult.data?.id;
    if (!accountId) {
      const managerResult = await client.from('managers').select('*').eq('email', email).maybeSingle();
      throwSupabase(managerResult.error);
      accountId = managerResult.data?.id;
    }
    if (!accountId) {
      const employeeResult = await client.from('employees').select('id').eq('email', email).maybeSingle();
      throwSupabase(employeeResult.error);
      accountId = employeeResult.data?.id;
    }
    if (!accountId) throw new HttpError(404, 'Aucune fiche ne correspond à cette adresse email.');
    const token = randomBytes(32).toString('hex');
    const { error } = await client.from('app_sessions').insert({
      token_hash: hash(token),
      account_id: accountId,
      expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    });
    throwSupabase(error);
    return token;
  }
  const account =
    MOCK_ADMINS.find((candidate) => candidate.email === email) ||
    MOCK_MANAGERS.find((candidate) => candidate.email === email) ||
    LUCCA_MOCK_DIRECTORY.find((person) => person.email === email);
  if (!account)
    throw new HttpError(404, 'Aucune fiche ne correspond à cette adresse email.');
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
export async function sessionAccount(token: string | undefined): Promise<Account | null> {
  if (!token) return null;
  if (supabaseIsConfigured()) {
    const client = supabaseAdmin();
    const { data: session, error } = await client.from('app_sessions').select('account_id').eq('token_hash', hash(token)).gt('expires_at', new Date().toISOString()).maybeSingle();
    throwSupabase(error);
    if (!session) return null;
    const { data: admin, error: adminError } = await client.from('admins').select('*').eq('id', session.account_id).maybeSingle();
    throwSupabase(adminError);
    if (admin) return {
      id: admin.id,
      appRole: 'admin',
      firstName: admin.first_name,
      lastName: admin.last_name,
      email: admin.email,
      role: admin.role,
      department: admin.department,
      startDate: '',
      contractSigned: false,
      buddyId: '',
      managerName: '',
      completedTaskIds: [],
    };
    const { data: manager, error: managerError } = await client.from('managers').select('*').eq('id', session.account_id).maybeSingle();
    throwSupabase(managerError);
    if (manager) return {
      id: manager.id,
      appRole: 'manager',
      firstName: manager.first_name,
      lastName: manager.last_name,
      email: manager.email,
      role: manager.role,
      department: manager.department,
      startDate: '',
      contractSigned: false,
      buddyId: '',
      managerName: '',
      completedTaskIds: [],
    };
    const { data: employee, error: employeeError } = await client.from('employees').select('*').eq('id', session.account_id).maybeSingle();
    throwSupabase(employeeError);
    if (!employee) return null;
    const { data: signature, error: signatureError } = await client.from('employee_signatures').select('*').eq('employee_id', employee.id).maybeSingle();
    throwSupabase(signatureError);
    const { data: record, error: recordError } = await client.from('onboarding_records').select('completed_task_ids').eq('employee_id', employee.id).maybeSingle();
    throwSupabase(recordError);
    return { ...remoteEmployee(employee, record || {}, signature || undefined), appRole: 'employee' };
  }
  const row = database()
    .prepare(
      'SELECT account_id FROM sessions WHERE token_hash = ? AND expires_at > ?'
    )
    .get(hash(token), Date.now()) as { account_id: string } | undefined;
  if (!row) return null;
  const manager = MOCK_MANAGERS.find((candidate) => candidate.id === row.account_id);
  if (manager) return manager;
  const admin = MOCK_ADMINS.find((candidate) => candidate.id === row.account_id);
  if (admin) return admin;
  const record = database()
    .prepare('SELECT data FROM onboardings WHERE id = ?')
    .get(row.account_id) as { data: string } | undefined;
  return record
    ? { ...(JSON.parse(record.data) as OnboardingRecord).employee, appRole: 'employee' }
    : null;
}
export async function deleteSession(token: string | undefined) {
  if (token && supabaseIsConfigured()) {
    const { error } = await supabaseAdmin().from('app_sessions').delete().eq('token_hash', hash(token));
    throwSupabase(error);
  } else if (token)
    database()
      .prepare('DELETE FROM sessions WHERE token_hash = ?')
      .run(hash(token));
}

export async function markAutomaticReminderRead(account: Account, record: OnboardingRecord, id: string) {
  if (!automaticReminders(record).some((notification) => notification.id === id))
    throw new HttpError(404, 'Rappel introuvable.');
  if (supabaseIsConfigured()) {
    const { error } = await supabaseAdmin().from('notification_reads').upsert({
      account_id: account.id,
      notification_id: id,
    });
    if (isMissingNotificationReads(error)) {
      warnMissingNotificationReads();
      return;
    }
    throwSupabase(error);
    return;
  }
  database().prepare('INSERT OR IGNORE INTO notification_reads VALUES (?, ?)').run(account.id, id);
}
