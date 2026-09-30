import type { OnboardingRecord } from '@/types/manager';

export const REQUEST_LABELS = {
  requested: 'Demandé',
  in_progress: 'En préparation',
  ready: 'Disponible',
  blocked: 'Bloqué',
};
export const OWNER_LABELS = {
  employee: 'Collaborateur',
  manager: 'Manager',
  rh: 'RH',
};
export const ROLE_LABELS = {
  employee: 'Collaborateur',
  manager: 'Manager',
  rh: 'RH',
  it: 'IT',
};
export const homeForRole = (role: string) =>
  role === 'admin'
    ? '/admin'
    : role === 'manager'
    ? '/manager'
    : role === 'rh' || role === 'it'
      ? '/operations'
      : '/dashboard';

export function arrivalStage(startDate: string, today = dateOnly()) {
  const offset = Math.round(
    (Date.parse(today) - Date.parse(startDate)) / 86400000
  );
  return {
    offset,
    label:
      offset < 0
        ? `Pré-arrivée · J−${-offset}`
        : offset === 0
          ? 'Jour 1'
          : offset > 30
            ? `Suivi après J+30 · J+${offset}`
            : `Intégration · J+${offset}`,
  };
}

export function priorityTasks(record: OnboardingRecord, today = dateOnly()) {
  const pending = record.tasks
    .filter(
      (t) =>
        t.owner === 'employee' &&
        !record.employee.completedTaskIds.includes(t.id)
    )
    .sort(
      (a, b) => a.dueDate.localeCompare(b.dueDate) || a.id.localeCompare(b.id)
    );
  const due = pending.filter((t) => t.dueDate <= today);
  return {
    tasks: (due.length ? due : pending).slice(0, 4),
    due: due.length > 0,
  };
}

export function automaticReminders(
  record: OnboardingRecord,
  today = dateOnly()
): OnboardingRecord['notifications'] {
  const items: OnboardingRecord['notifications'] = [];
  const add = (id: string, message: string, date: string) =>
    items.push({
      id: `auto:${id}`,
      message,
      createdAt: `${date}T12:00:00Z`,
      read: false,
      source: 'automatic',
    });
  if (
    record.documents.some((d) => d.status !== 'signed') &&
    today >= addDays(record.employee.startDate, -3)
  )
    add(
      `documents:${record.employee.startDate}`,
      'Tes documents restent à signer. Retrouve-les dans Contrat & Signature avant ton arrivée.',
      addDays(record.employee.startDate, -3)
    );
  record.tasks
    .filter(
      (t) =>
        t.owner === 'employee' &&
        t.id !== 'task-j1-1' &&
        t.dueDate < today &&
        !record.employee.completedTaskIds.includes(t.id)
    )
    .forEach((t) =>
      add(
        `task:${t.id}:${t.dueDate}`,
        `Action en retard depuis le ${formatDate(t.dueDate)} : ${t.title}`,
        t.dueDate
      )
    );
  record.meetings
    .filter((m) => !m.done && m.dueDate <= addDays(today, 1))
    .forEach((m) =>
      add(
        `meeting:${m.id}:${m.dueDate}`,
        `${m.title} ${m.dueDate < today ? 'reste à réaliser avec ton manager' : `est prévu le ${formatDate(m.dueDate)}`}.`,
        addDays(m.dueDate, -1)
      )
    );
  return items;
}
export function dateOnly(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
export function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
export function formatDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date.slice(0, 10)}T12:00:00Z`));
}
export function readiness(record: OnboardingRecord) {
  const checks = [
    {
      label: 'Accueil organisé',
      done: !!(
        record.welcome.host &&
        record.welcome.location &&
        record.welcome.time &&
        record.welcome.message
      ),
    },
    {
      label: 'Matériel disponible',
      done:
        record.requests.some((r) => r.kind === 'hardware') &&
        record.requests
          .filter((r) => r.kind === 'hardware' && r.blocking)
          .every((r) => r.status === 'ready'),
    },
    {
      label: 'Accès disponibles',
      done:
        record.requests.some((r) => r.kind === 'access') &&
        record.requests
          .filter((r) => r.kind === 'access' && r.blocking)
          .every((r) => r.status === 'ready'),
    },
    {
      label: 'Documents signés',
      done:
        record.documents.length > 0 &&
        record.documents.every((d) => d.status === 'signed'),
    },
  ];
  return {
    checks,
    ready:
      checks.every((c) => c.done) &&
      !record.blockers.some((b) => !b.resolvedAt),
    count: checks.filter((c) => c.done).length,
  };
}
export function alertsFor(record: OnboardingRecord, today = dateOnly()) {
  const alerts: { id: string; title: string; urgent: boolean }[] = [];
  record.blockers
    .filter((b) => !b.resolvedAt)
    .forEach((b) => alerts.push({ id: b.id, title: b.title, urgent: true }));
  record.requests
    .filter(
      (r) =>
        r.status !== 'ready' && (r.status === 'blocked' || r.dueDate < today)
    )
    .forEach((r) =>
      alerts.push({
        id: r.id,
        title: `${r.title} · ${r.status === 'blocked' ? 'bloqué' : 'en retard'}`,
        urgent: r.blocking,
      })
    );
  record.tasks
    .filter(
      (t) =>
        t.owner === 'manager' &&
        !record.employee.completedTaskIds.includes(t.id) &&
        t.dueDate <= today
    )
    .forEach((t) =>
      alerts.push({ id: t.id, title: t.title, urgent: t.dueDate < today })
    );
  record.meetings
    .filter((m) => !m.done && m.dueDate <= today)
    .forEach((m) =>
      alerts.push({
        id: m.id,
        title: `${m.title} à réaliser`,
        urgent: m.dueDate < today,
      })
    );
  if (!record.welcome.host || !record.welcome.message)
    alerts.push({
      id: 'welcome',
      title: 'Accueil à préparer',
      urgent: record.employee.startDate <= today,
    });
  return alerts;
}
