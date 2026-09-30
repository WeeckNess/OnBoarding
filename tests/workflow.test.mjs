import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { DatabaseSync } from 'node:sqlite';

// Exercises the real Next API and SQLite store. Requires npm run build first.
test(
  'manager and employee workflow with isolated, persistent storage',
  { timeout: 90000 },
  async (t) => {
    const directory = await mkdtemp(join(tmpdir(), 'midi-onboarding-test-'));
    const reservation = createServer();
    await new Promise((resolve) => reservation.listen(0, '127.0.0.1', resolve));
    const port = reservation.address().port;
    await new Promise((resolve) => reservation.close(resolve));
    const base = `http://127.0.0.1:${port}`;
    let processHandle;
    let logs = '';
    const start = async (demoReset = true) => {
      processHandle = spawn(
        process.execPath,
        [
          'node_modules/next/dist/bin/next',
          'start',
          '-H',
          '127.0.0.1',
          '-p',
          String(port),
        ],
        {
          env: {
            ...process.env,
            DEMO_ACCESS_ENABLED: 'true',
            DEMO_RESET_ENABLED: String(demoReset),
            ONBOARDING_DB_PATH: join(directory, 'test.sqlite'),
            NEXT_TELEMETRY_DISABLED: '1',
          },
          stdio: ['ignore', 'pipe', 'pipe'],
        }
      );
      processHandle.stdout.on('data', (d) => {
        logs += d;
      });
      processHandle.stderr.on('data', (d) => {
        logs += d;
      });
      for (let attempt = 0; attempt < 150; attempt++) {
        if (processHandle.exitCode !== null) throw new Error(logs);
        try {
          const response = await fetch(`${base}/api/workspace`);
          if (response.ok) return;
        } catch {}
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      throw new Error(`Server did not start: ${logs}`);
    };
    const stop = async () => {
      if (processHandle && processHandle.exitCode === null) {
        const ended = new Promise((resolve) =>
          processHandle.once('exit', resolve)
        );
        processHandle.kill('SIGTERM');
        await ended;
      }
    };
    t.after(async () => {
      await stop();
      await rm(directory, { recursive: true, force: true });
    });
    await start();
    const request = async (
      path,
      cookie = '',
      method = 'GET',
      body,
      origin = base
    ) => {
      const response = await fetch(`${base}${path}`, {
        method,
        headers: {
          Cookie: cookie,
          Origin: origin,
          'Content-Type': 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      return {
        status: response.status,
        body: await response.json(),
        cookie: response.headers.get('set-cookie')?.split(';')[0],
        headers: response.headers,
      };
    };
    const login = async (email) => {
      const result = await request('/api/session', '', 'POST', { email });
      assert.equal(result.status, 200);
      assert.match(result.headers.get('set-cookie'), /HttpOnly/i);
      return result.cookie;
    };
    const workspace = async (cookie) =>
      (await request('/api/workspace', cookie)).body;
    const record = async (cookie, id = 'emp-01') =>
      (await workspace(cookie)).records.find((r) => r.employee.id === id);
    const update = async (cookie, action, id = 'emp-01', version) => {
      version ??= (await record(cookie, id))?.version || 1;
      return request(`/api/onboardings/${id}`, cookie, 'PATCH', {
        version,
        action,
      });
    };
    const manager = await login('antoine.laurent@datainsight.io');
    const employee = await login('alexandre.moreau@datainsight.io');
    const otherEmployee = await login('thomas.legros@datainsight.io');
    const rh = await login('rh@datainsight.io');
    const it = await login('it@datainsight.io');
    const requestBrief = ({
      id,
      kind,
      title,
      details,
      owner,
      dueDate,
      blocking,
    }) => ({ id, kind, title, details, owner, dueDate, blocking });
    await t.test(
      'anonymous access, manager scope and employee isolation',
      async () => {
        assert.deepEqual((await workspace('')).records, []);
        assert.equal((await update('', { type: 'reset' })).status, 401);
        assert.deepEqual(
          (await workspace(manager)).records.map((r) => r.employee.id),
          ['emp-01', 'emp-03']
        );
        assert.deepEqual(
          (await workspace(employee)).records.map((r) => r.employee.id),
          ['emp-01']
        );
        assert.equal(
          (
            await update(
              manager,
              { type: 'reminder', message: 'Test' },
              'emp-02'
            )
          ).status,
          403
        );
        assert.equal(
          (await update(otherEmployee, { type: 'reset' }, 'emp-01')).status,
          403
        );
        assert.equal(
          (
            await request('/api/session', '', 'POST', {
              email: 'unknown@example.test',
              appRole: 'manager',
            })
          ).status,
          400
        );
      }
    );
    const welcome = {
      type: 'welcome',
      host: 'Antoine Laurent',
      location: 'Bordeaux, accueil',
      time: '09:30',
      message: 'Bienvenue dans l’équipe, Alexandre.',
      buddyId: 'buddy-julien',
    };
    await t.test(
      'roles, input validation and CSRF are enforced by the server',
      async () => {
        assert.equal((await update(employee, welcome)).status, 403);
        assert.equal(
          (
            await update(manager, {
              type: 'sign',
              signatureImage: 'data:image/png;base64,YQ==',
            })
          ).status,
          403
        );
        assert.equal(
          (await update(manager, { ...welcome, time: '29:99' })).status,
          400
        );
        assert.equal(
          (
            await update(manager, {
              type: 'goal.save',
              title: ' ',
              dueDate: '2026-10-01',
              done: false,
            })
          ).status,
          400
        );
        assert.equal(
          (
            await update(manager, {
              type: 'goal.save',
              title: 'Goal',
              dueDate: '2026-02-30',
              done: false,
            })
          ).status,
          400
        );
        assert.equal(
          (
            await request(
              '/api/onboardings/emp-01',
              manager,
              'PATCH',
              { version: 1, action: welcome },
              'https://foreign.example'
            )
          ).status,
          403
        );
        assert.equal((await record(manager)).version, 1);
      }
    );
    await t.test(
      'manager defines the need and IT confirms readiness in its own workspace',
      async () => {
        assert.equal((await update(manager, welcome)).status, 200);
        assert.equal((await record(employee)).welcome.message, welcome.message);
        assert.equal(
          (await workspace(employee)).account.buddyId,
          'buddy-julien'
        );
        const vpn = (await record(manager)).requests.find(
          (r) => r.kind === 'access'
        );
        assert.equal(
          (
            await update(manager, {
              type: 'request.save',
              request: {
                ...requestBrief(vpn),
                details: 'Projet Atlas, lecture des dépôts.',
              },
            })
          ).status,
          200
        );
        assert.equal(
          (
            await update(manager, {
              type: 'request.status',
              id: vpn.id,
              status: 'ready',
              note: 'Tentative',
            })
          ).status,
          403
        );
        assert.equal(
          (
            await update(rh, {
              type: 'request.status',
              id: vpn.id,
              status: 'ready',
              note: 'Tentative',
            })
          ).status,
          403
        );
        assert.equal(
          (
            await update(manager, {
              type: 'request.save',
              request: { ...requestBrief(vpn), status: 'ready' },
            })
          ).status,
          403
        );
        assert.equal(
          (
            await update(manager, {
              type: 'request.save',
              request: { ...requestBrief(vpn), owner: 'Manager' },
            })
          ).status,
          403
        );
        assert.equal(
          (
            await update(it, {
              type: 'request.status',
              id: vpn.id,
              status: 'ready',
              note: 'Accès confirmé par IT.',
            })
          ).status,
          200
        );
        assert.equal(
          (await record(employee)).requests.find((r) => r.id === vpn.id).status,
          'ready'
        );
        assert.equal(
          (await record(manager)).requests.find((r) => r.id === vpn.id)
            .validatedBy,
          'Équipe IT'
        );
        assert.ok(
          (await record(manager)).requests.find((r) => r.id === vpn.id)
            .validatedAt
        );
        assert.equal(
          (await update(employee, { type: 'request.save', request: vpn }))
            .status,
          403
        );
      }
    );
    let assignedTask;
    await t.test(
      'task assignment, completion and reset remain per employee',
      async () => {
        assert.equal(
          (
            await update(manager, {
              type: 'task.save',
              task: {
                title: 'Découvrir le projet Atlas',
                description: 'Première prise en main',
                owner: 'employee',
                dueDate: '2026-10-03',
                category: 'project',
                milestoneId: 's1',
              },
            })
          ).status,
          200
        );
        assignedTask = (await record(employee)).tasks.find(
          (t) => t.title === 'Découvrir le projet Atlas'
        );
        assert.ok(assignedTask);
        assert.equal(
          (
            await update(manager, {
              type: 'task.toggle',
              id: assignedTask.id,
              done: true,
            })
          ).status,
          403
        );
        assert.equal(
          (
            await update(employee, {
              type: 'task.toggle',
              id: assignedTask.id,
              done: true,
            })
          ).status,
          200
        );
        assert.ok(
          (await record(manager)).employee.completedTaskIds.includes(
            assignedTask.id
          )
        );
        assert.deepEqual(
          (await record(otherEmployee, 'emp-02')).employee.completedTaskIds,
          []
        );
        assert.equal(
          (
            await update(employee, {
              type: 'task.toggle',
              id: 'task-j1-1',
              done: true,
            })
          ).status,
          400
        );
      }
    );
    await t.test(
      'goals and checkpoints are shared, completed meetings need a report',
      async () => {
        assert.equal(
          (
            await update(manager, {
              type: 'goal.save',
              title: 'Présenter un pipeline',
              dueDate: '2026-10-30',
              done: false,
            })
          ).status,
          200
        );
        assert.equal(
          (await record(employee)).goals[0].title,
          'Présenter un pipeline'
        );
        assert.equal(
          (
            await update(manager, {
              type: 'meeting.save',
              id: 'meeting-7',
              dueDate: '2026-10-08',
              done: true,
              notes: '',
            })
          ).status,
          400
        );
        assert.equal(
          (
            await update(manager, {
              type: 'meeting.save',
              id: 'meeting-7',
              dueDate: '2026-10-08',
              done: true,
              notes: 'Accès vérifiés, premier pipeline à préparer.',
            })
          ).status,
          200
        );
        assert.equal(
          (await record(employee)).meetings.find((m) => m.id === 'meeting-7')
            .done,
          true
        );
      }
    );
    await t.test(
      'blockers, feedback and in-app reminders travel in both directions',
      async () => {
        assert.equal(
          (
            await update(employee, {
              type: 'blocker.create',
              title: 'VPN indisponible sur mon poste',
            })
          ).status,
          200
        );
        const blocker = (await record(manager)).blockers[0];
        assert.equal(
          (
            await update(manager, {
              type: 'blocker.resolve',
              id: blocker.id,
              response: 'Le profil VPN a été corrigé.',
            })
          ).status,
          200
        );
        assert.equal(
          (await record(employee)).blockers[0].response,
          'Le profil VPN a été corrigé.'
        );
        assert.equal(
          (
            await update(employee, {
              type: 'feedback',
              rating: 4,
              comment: 'Le suivi est clair.',
            })
          ).status,
          200
        );
        assert.equal((await record(manager)).feedback.rating, 4);
        assert.equal(
          (
            await update(manager, {
              type: 'reminder',
              message: 'Pense au bilan de semaine.',
            })
          ).status,
          200
        );
        const notification = (await record(employee)).notifications.find(
          (n) => !n.source
        );
        assert.equal(notification.read, false);
        assert.equal(
          (
            await update(employee, {
              type: 'notification.read',
              id: notification.id,
            })
          ).status,
          200
        );
        assert.equal((await record(manager)).notifications[0].read, true);
      }
    );
    await t.test(
      'document signature metadata is shared without leaking the image',
      async () => {
        assert.equal(
          (
            await update(employee, {
              type: 'sign',
              signatureImage: 'data:image/png;base64,YQ==',
            })
          ).status,
          200
        );
        const managerRecord = await record(manager);
        assert.equal(managerRecord.employee.signatureImage, undefined);
        assert.equal(
          managerRecord.documents.every((d) => d.status === 'signed'),
          true
        );
        assert.ok((await record(employee)).employee.signatureImage);
      }
    );
    await t.test(
      'services receive only their required data and RH owns administrative tasks',
      async () => {
        const itRecord = await record(it);
        assert.deepEqual(itRecord.goals, []);
        assert.deepEqual(itRecord.tasks, []);
        assert.deepEqual(itRecord.meetings, []);
        assert.deepEqual(itRecord.documents, []);
        assert.deepEqual(itRecord.notifications, []);
        assert.equal(itRecord.feedback, null);
        assert.equal(itRecord.employee.signatureImage, undefined);
        assert.equal((await record(rh)).employee.signatureImage, undefined);
        assert.ok(
          (await record(rh)).tasks.every((t) => t.category === 'admin')
        );
        assert.ok(itRecord.requests.every((r) => r.owner === 'IT'));
        const admin = {
          title: 'Préparer le badge',
          description: 'Accueil',
          owner: 'rh',
          dueDate: '2026-10-01',
          category: 'admin',
          milestoneId: 'prearrival',
        };
        assert.equal(
          (
            await update(manager, {
              type: 'task.save',
              task: { ...admin, owner: 'employee' },
            })
          ).status,
          403
        );
        assert.equal(
          (await update(rh, { type: 'task.save', task: admin })).status,
          200
        );
        const task = (await record(rh)).tasks.find(
          (t) => t.title === admin.title
        );
        assert.equal(
          (
            await update(manager, {
              type: 'task.save',
              task: { ...task, category: 'project', owner: 'manager' },
            })
          ).status,
          403
        );
        assert.equal(
          (await update(manager, { type: 'task.delete', id: task.id })).status,
          403
        );
        assert.equal(
          (
            await update(employee, {
              type: 'task.toggle',
              id: task.id,
              done: true,
            })
          ).status,
          403
        );
        assert.equal(
          (await update(rh, { type: 'task.toggle', id: task.id, done: true }))
            .status,
          200
        );
        assert.equal((await update(it, welcome)).status, 403);
        assert.equal(
          (
            await update(rh, {
              type: 'task.save',
              task: { ...admin, category: 'project', owner: 'employee' },
            })
          ).status,
          403
        );
        const request = {
          kind: 'hardware',
          title: 'Badge physique',
          details: 'Badge du bureau de Bordeaux',
          owner: 'RH',
          dueDate: '2026-10-01',
          blocking: true,
        };
        assert.equal(
          (await update(rh, { type: 'request.save', request })).status,
          200
        );
        const badge = (await record(rh)).requests.find(
          (r) => r.title === request.title
        );
        assert.equal(
          (
            await update(it, {
              type: 'request.status',
              id: badge.id,
              status: 'ready',
              note: '',
            })
          ).status,
          403
        );
        assert.equal(
          (
            await update(rh, {
              type: 'request.status',
              id: badge.id,
              status: 'ready',
              note: 'Badge imprimé.',
            })
          ).status,
          200
        );
        assert.equal(
          (await record(employee)).requests.find((r) => r.id === badge.id)
            .validatedBy,
          'Sonia'
        );
        assert.ok(!(await record(it)).requests.some((r) => r.id === badge.id));
      }
    );
    await t.test(
      'changing an approved brief requires another service validation',
      async () => {
        const vpn = (await record(manager)).requests.find(
          (r) => r.kind === 'access'
        );
        assert.equal(vpn.status, 'ready');
        assert.equal(
          (
            await update(manager, {
              type: 'request.save',
              request: {
                ...requestBrief(vpn),
                details: 'Atlas et Orion, lecture seule.',
              },
            })
          ).status,
          200
        );
        const changed = (await record(manager)).requests.find(
          (r) => r.id === vpn.id
        );
        assert.equal(changed.status, 'requested');
        assert.equal(changed.validatedAt, undefined);
        assert.equal(changed.validatedBy, undefined);
        assert.equal(
          (
            await update(it, {
              type: 'request.status',
              id: vpn.id,
              status: 'blocked',
              note: '',
            })
          ).status,
          400
        );
        assert.equal(
          (
            await update(it, {
              type: 'request.status',
              id: vpn.id,
              status: 'ready',
              note: 'Nouveau périmètre activé.',
            })
          ).status,
          200
        );
      }
    );
    await t.test(
      'automatic reminders are deduplicated, acknowledged persistently and removed on completion',
      async () => {
        const task = {
          title: 'Vérifier les accès de test',
          description: '',
          owner: 'employee',
          dueDate: '2020-01-01',
          category: 'tech',
          milestoneId: 'j1',
        };
        assert.equal(
          (await update(manager, { type: 'task.save', task })).status,
          200
        );
        const first = await record(employee);
        const assigned = first.tasks.find((t) => t.title === task.title);
        const notice = first.notifications.find(
          (n) => n.source === 'automatic' && n.id.includes(assigned.id)
        );
        assert.ok(notice);
        assert.equal(notice.read, false);
        const second = await record(employee);
        assert.deepEqual(second.notifications, first.notifications);
        assert.equal(second.version, first.version);
        assert.equal(
          (await update(employee, { type: 'notification.read', id: notice.id }))
            .status,
          200
        );
        assert.equal(
          (await record(employee)).notifications.find((n) => n.id === notice.id)
            .read,
          true
        );
        assert.equal((await record(employee)).version, first.version);
        assert.equal(
          (
            await update(employee, {
              type: 'notification.read',
              id: 'auto:unknown',
            })
          ).status,
          404
        );
        assert.ok(
          !(await record(manager)).notifications.some(
            (n) => n.source === 'automatic'
          )
        );
        assert.equal(
          (
            await update(employee, {
              type: 'task.toggle',
              id: assigned.id,
              done: true,
            })
          ).status,
          200
        );
        assert.ok(
          !(await record(employee)).notifications.some(
            (n) => n.id === notice.id
          )
        );
      }
    );
    await t.test(
      'stale and simultaneous writes cannot overwrite another change',
      async () => {
        const version = (await record(manager)).version;
        const results = await Promise.all([
          update(
            manager,
            { type: 'reminder', message: 'Premier rappel concurrent' },
            'emp-01',
            version
          ),
          update(
            manager,
            { type: 'reminder', message: 'Second rappel concurrent' },
            'emp-01',
            version
          ),
        ]);
        assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
        assert.equal(
          (await update(manager, welcome, 'emp-01', version)).status,
          409
        );
      }
    );
    await t.test('server restart preserves records and sessions', async () => {
      const before = await record(manager);
      await stop();
      await start();
      assert.deepEqual(await record(manager), before);
    });
    await t.test(
      'entrant reset preserves preparation and other employees; logout revokes session',
      async () => {
        const otherBefore = await record(otherEmployee, 'emp-02');
        const before = await record(employee);
        assert.equal((await update(employee, { type: 'reset' })).status, 200);
        const after = await record(employee);
        assert.equal(after.employee.contractSigned, false);
        assert.equal(after.employee.signatureImage, undefined);
        assert.ok(
          after.employee.completedTaskIds.every(
            (id) => after.tasks.find((t) => t.id === id)?.owner !== 'employee'
          )
        );
        assert.deepEqual(after.requests, before.requests);
        assert.deepEqual(after.goals, before.goals);
        assert.deepEqual(await record(otherEmployee, 'emp-02'), otherBefore);
        assert.equal(
          (await request('/api/session', employee, 'DELETE', {})).status,
          200
        );
        assert.equal((await workspace(employee)).account, null);
      }
    );
    await t.test(
      'reset is rejected when the dedicated demo flag is off',
      async () => {
        await stop();
        await start(false);
        const before = await record(otherEmployee, 'emp-02');
        assert.equal(
          (await workspace(otherEmployee)).features.demoReset,
          false
        );
        assert.equal(
          (await update(otherEmployee, { type: 'reset' }, 'emp-02')).status,
          403
        );
        assert.deepEqual(await record(otherEmployee, 'emp-02'), before);
      }
    );
    await t.test(
      'existing dossiers migrate once without losing preparation or feedback',
      async () => {
        await stop();
        const db = new DatabaseSync(join(directory, 'test.sqlite'));
        const row = db
          .prepare('SELECT data FROM onboardings WHERE id = ?')
          .get('emp-01');
        const legacy = JSON.parse(row.data);
        const signature = legacy.tasks.find((t) => t.id === 'task-j1-1');
        signature.milestoneId = 'j1';
        signature.dayNumber = 1;
        signature.dueDate = legacy.employee.startDate;
        legacy.tasks.find((t) => t.id === 'task-j30-3').category = 'admin';
        const vpn = legacy.requests.find((r) => r.kind === 'access');
        vpn.status = 'ready';
        delete vpn.validatedBy;
        delete vpn.validatedAt;
        db.prepare('UPDATE onboardings SET data = ? WHERE id = ?').run(
          JSON.stringify(legacy),
          'emp-01'
        );
        db.prepare('DELETE FROM schema_updates WHERE id = ?').run(
          'role-boundaries-v1'
        );
        db.prepare('DELETE FROM schema_updates WHERE id = ?').run(
          'prototype-role-content-v1'
        );
        db.close();
        await start(false);
        const after = await record(manager);
        assert.equal(after.version, legacy.version + 2);
        assert.equal(
          after.tasks.find((t) => t.id === 'task-j30-3').category,
          'team'
        );
        assert.equal(
          after.tasks.find((t) => t.id === 'task-j1-1').milestoneId,
          'prearrival'
        );
        assert.ok(
          after.tasks.find((t) => t.id === 'task-j1-1').dueDate <
            after.employee.startDate
        );
        assert.equal(
          after.requests.find((r) => r.id === vpn.id).status,
          'requested'
        );
        assert.deepEqual(after.welcome, legacy.welcome);
        assert.deepEqual(after.feedback, legacy.feedback);
        assert.deepEqual(after.goals, legacy.goals);
        await stop();
        await start(false);
        assert.deepEqual(await record(manager), after);
      }
    );
  }
);
