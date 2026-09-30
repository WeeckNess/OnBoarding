import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(
  new URL('../src/lib/onboarding.ts', import.meta.url),
  'utf8'
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const { arrivalStage, dateOnly, priorityTasks, automaticReminders } =
  await import(
    'data:text/javascript;base64,' + Buffer.from(outputText).toString('base64')
  );

test('arrival phase uses Paris civil dates across the arrival boundary', () => {
  assert.equal(dateOnly(new Date('2026-09-30T22:30:00Z')), '2026-10-01');
  assert.equal(
    arrivalStage('2026-10-01', '2026-09-30').label,
    'Pré-arrivée · J−1'
  );
  assert.equal(arrivalStage('2026-10-01', '2026-10-01').label, 'Jour 1');
  assert.equal(
    arrivalStage('2026-10-01', '2026-10-08').label,
    'Intégration · J+7'
  );
  assert.equal(arrivalStage('2026-10-01', '2026-11-01').offset, 31);
});
test('employee priorities exclude other owners, completed tasks and future work when work is due', () => {
  const record = {
    employee: { completedTaskIds: ['done'] },
    tasks: [
      { id: 'future', dueDate: '2026-10-05', owner: 'employee' },
      { id: 'manager', dueDate: '2026-09-20', owner: 'manager' },
      { id: 'rh', dueDate: '2026-09-20', owner: 'rh' },
      { id: 'due', dueDate: '2026-10-01', owner: 'employee' },
      { id: 'late', dueDate: '2026-09-29', owner: 'employee' },
      { id: 'done', dueDate: '2026-09-28', owner: 'employee' },
    ],
  };
  assert.deepEqual(
    priorityTasks(record, '2026-10-01').tasks.map((t) => t.id),
    ['late', 'due']
  );
  const future = priorityTasks(record, '2026-09-25');
  assert.equal(future.due, false);
  assert.deepEqual(
    future.tasks.map((t) => t.id),
    ['late', 'due', 'future']
  );
});
test('automatic notices follow due dates and disappear when their action is complete', () => {
  const record = {
    employee: { startDate: '2026-10-01', completedTaskIds: [] },
    documents: [{ status: 'pending' }],
    tasks: [
      {
        id: 'access',
        title: 'Tester le VPN',
        owner: 'employee',
        dueDate: '2026-09-29',
      },
      {
        id: 'manager',
        title: 'Accueil',
        owner: 'manager',
        dueDate: '2026-09-29',
      },
    ],
    meetings: [
      { id: 'j1', title: 'Accueil J1', dueDate: '2026-10-01', done: false },
    ],
  };
  assert.deepEqual(automaticReminders(record, '2026-09-27'), []);
  const reminders = automaticReminders(record, '2026-09-30');
  assert.equal(reminders.length, 3);
  assert.equal(new Set(reminders.map((n) => n.id)).size, 3);
  assert.deepEqual(automaticReminders(record, '2026-09-30'), reminders);
  record.employee.completedTaskIds = ['access'];
  record.documents[0].status = 'signed';
  record.meetings[0].done = true;
  assert.deepEqual(automaticReminders(record, '2026-10-02'), []);
});
