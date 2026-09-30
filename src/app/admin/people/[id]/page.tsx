'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  FileCheck2,
  MessageSquareText,
  MonitorCog,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { Avatar, Badge, Empty, Panel } from '@/components/manager/ui';
import { useOnboarding } from '@/context/OnboardingContext';
import { formatDate } from '@/lib/onboarding';
import { getHrCompliance, HR_COMPLIANCE_ITEMS, missingComplianceCount, openBlockingRequests } from '@/lib/admin';

export default function AdminPersonPage() {
  const params = useParams<{ id: string }>();
  const { currentUser, records } = useOnboarding();
  const record = records.find((item) => item.employee.id === params.id);

  if (currentUser?.appRole !== 'admin') return null;
  if (!record) return <Empty>Ce dossier collaborateur est introuvable dans le périmètre RH.</Empty>;

  const employee = record.employee;
  const compliance = getHrCompliance(record);
  const managerTasks = record.tasks.filter((task) => task.owner === 'manager');
  const employeeTasks = record.tasks.filter((task) => task.owner === 'employee');
  const managerDone = managerTasks.filter((task) => employee.completedTaskIds.includes(task.id)).length;
  const employeeDone = employeeTasks.filter((task) => employee.completedTaskIds.includes(task.id)).length;
  const blocking = openBlockingRequests(record);

  return (
    <div className="space-y-7 pb-10">
      <header className="space-y-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500"><Link href="/admin" className="hover:text-white">RH / Admin</Link><span>/</span><Link href="/admin/teams" className="hover:text-white">Équipes</Link><span>/</span><span className="text-slate-300">Dossier collaborateur</span></div>
        <div className="flex flex-col justify-between gap-5 rounded-3xl border border-white/10 bg-[#1b1c20] p-5 sm:flex-row sm:items-center sm:p-7">
          <div className="flex min-w-0 items-center gap-4"><Avatar firstName={employee.firstName} lastName={employee.lastName} large /><div className="min-w-0"><div className="mb-2 flex flex-wrap gap-2"><Badge>{employee.department}</Badge><Badge tone={missingComplianceCount(record) ? 'amber' : 'green'}>{missingComplianceCount(record) ? `${missingComplianceCount(record)} pièces à suivre` : 'Conformité complète'}</Badge></div><h1 className="truncate text-2xl font-extrabold text-white sm:text-3xl">{employee.firstName} {employee.lastName}</h1><p className="mt-1 truncate text-sm text-slate-400">{employee.role}</p></div></div>
          <Link href={`/admin/teams?manager=${encodeURIComponent(record.managerId)}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-bold text-slate-200 transition hover:bg-white/[0.08]"><ArrowLeft size={14} />Retour à son équipe</Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Info icon={UserRound} label="Manager direct" value={employee.managerName || 'Non renseigné'} />
        <Info icon={CalendarDays} label="Date d’arrivée" value={formatDate(employee.startDate)} />
        <Info icon={ClipboardList} label="Tâches collaborateur" value={`${employeeDone} / ${employeeTasks.length} terminées`} />
        <Info icon={ShieldCheck} label="Préparation manager" value={`${managerDone} / ${managerTasks.length} terminées`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel title="Dossier administratif" description="État des formalités et signatures enregistrées" icon={FileCheck2}>
          <div className="space-y-2">
            {HR_COMPLIANCE_ITEMS.map((item) => {
              const done = compliance[item.key] === 'complete';
              return <div key={item.key} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/10 p-3"><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${done ? 'bg-emerald-400/10 text-emerald-200' : 'bg-amber-300/10 text-amber-200'}`}>{done ? <CheckCircle2 size={16} /> : <CircleDashed size={16} />}</span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-white">{item.label}</span><span className="mt-0.5 block text-[10px] text-slate-500">{item.description}</span></span><Badge tone={done ? 'green' : 'amber'}>{done ? 'Reçu' : 'À suivre'}</Badge></div>;
            })}
            {record.documents.map((document) => <div key={document.id} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/10 p-3"><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${document.status === 'signed' ? 'bg-emerald-400/10 text-emerald-200' : 'bg-amber-300/10 text-amber-200'}`}><FileCheck2 size={16} /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-white">{document.title}</span><span className="mt-0.5 block text-[10px] text-slate-500">{document.signedAt ? `Signé le ${formatDate(document.signedAt)}` : 'En attente de signature'}</span></span><Badge tone={document.status === 'signed' ? 'green' : 'amber'}>{document.status === 'signed' ? 'Signé' : 'À signer'}</Badge></div>)}
          </div>
          <p className="mt-4 text-[10px] leading-relaxed text-slate-500">Les statuts de pièces sont internes au suivi RH. Les fichiers justificatifs ne sont pas conservés dans ce prototype.</p>
        </Panel>

        <Panel title="Demandes IT & matériel" description="Préparation opérationnelle avant l’arrivée" icon={MonitorCog} action={<Badge tone={blocking.length ? 'amber' : 'green'}>{blocking.length ? `${blocking.length} en attente` : 'Prêt'}</Badge>}>
          <div className="space-y-2">
            {record.requests.map((request) => <article key={request.id} className="rounded-2xl border border-white/[0.07] bg-black/10 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-xs font-bold text-white">{request.title}</p><p className="mt-1 text-[10px] text-slate-400">{request.kind === 'hardware' ? 'Matériel' : 'Accès applicatifs'} · Responsable {request.owner}</p></div><Badge tone={request.status === 'ready' ? 'green' : request.status === 'blocked' ? 'red' : 'amber'}>{request.status === 'ready' ? 'Disponible' : request.status === 'blocked' ? 'Bloqué' : request.status === 'in_progress' ? 'En préparation' : 'Demandé'}</Badge></div><p className="mt-3 text-[11px] leading-relaxed text-slate-400">{request.details}</p><div className="mt-3 flex flex-wrap justify-between gap-2 border-t border-white/5 pt-3 text-[10px] text-slate-500"><span>Échéance : {formatDate(request.dueDate)}</span><span>{request.blocking ? 'Bloquant pour J1' : 'Non bloquant'}</span></div>{request.note && <p className="mt-2 rounded-lg bg-amber-300/[0.05] p-2 text-[10px] text-amber-100">{request.note}</p>}</article>)}
            {!record.requests.length && <Empty>Aucune demande de matériel ou d’accès renseignée.</Empty>}
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Panel title="Jalons et tâches" description="Progression du salarié et actions attendues du manager" icon={ClipboardList}>
          <div className="space-y-5">
            <TaskGroup title="Actions manager" done={managerDone} total={managerTasks.length} tasks={managerTasks} completed={employee.completedTaskIds} />
            <TaskGroup title="Parcours collaborateur" done={employeeDone} total={employeeTasks.length} tasks={employeeTasks} completed={employee.completedTaskIds} />
          </div>
        </Panel>
        <Panel title="Points de suivi & feedback" description="Rendez-vous d’intégration et retours du collaborateur" icon={MessageSquareText}>
          {record.meetings.length ? <div className="space-y-2">{record.meetings.map((meeting) => <article key={meeting.id} className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-black/10 p-3"><span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meeting.done ? 'bg-emerald-400/10 text-emerald-200' : 'bg-amber-300/10 text-amber-200'}`}>{meeting.done ? <CheckCircle2 size={15} /> : <CalendarDays size={15} />}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-bold text-white">{meeting.title}</p><Badge tone={meeting.done ? 'green' : 'amber'}>{meeting.done ? 'Réalisé' : 'À venir'}</Badge></div><p className="mt-1 text-[10px] text-slate-500">{formatDate(meeting.dueDate)}</p>{meeting.notes && <p className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-slate-400">{meeting.notes}</p>}</div></article>)}</div> : <Empty>Aucun point de suivi planifié.</Empty>}
          <div className="mt-4 rounded-2xl border border-violet-300/10 bg-violet-300/[0.035] p-4"><div className="flex items-center gap-2 text-xs font-bold text-white"><MessageSquareText size={14} className="text-violet-200" />Rapport d’étonnement</div>{record.feedback ? <><div className="mt-3 flex items-center gap-2"><Badge tone="green">Note {record.feedback.rating}/5</Badge><span className="text-[10px] text-slate-500">Reçu le {formatDate(record.feedback.updatedAt)}</span></div><p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-slate-300">{record.feedback.comment || 'Aucun commentaire ajouté.'}</p></> : <p className="mt-2 text-[10px] text-slate-400">Le collaborateur n’a pas encore partagé son rapport de retour d’expérience.</p>}</div>
        </Panel>
      </section>

      <Panel title="Activité du dossier" description="Historique des dernières actions réalisées" icon={ClipboardList}>
        {record.activity.length ? <div className="space-y-2">{record.activity.slice(0, 12).map((activity) => <div key={activity.id} className="flex items-start gap-3 rounded-xl border border-white/[0.05] px-3 py-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-300" /><div className="min-w-0 flex-1"><p className="text-xs text-slate-200">{activity.label}</p><p className="mt-1 text-[10px] text-slate-500">{activity.actor} · {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(activity.createdAt))}</p></div></div>)}</div> : <Empty>Aucune activité enregistrée pour le moment.</Empty>}
      </Panel>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><div className="flex items-center gap-2 text-slate-500"><Icon size={14} /><span className="text-[9px] font-bold uppercase tracking-wider">{label}</span></div><p className="mt-2 truncate text-xs font-semibold text-white" title={value}>{value}</p></article>;
}

function TaskGroup({ title, done, total, tasks, completed }: { title: string; done: number; total: number; tasks: { id: string; title: string; dueDate: string; milestoneId: string }[]; completed: string[] }) {
  return <section><div className="mb-2 flex items-center justify-between gap-3"><h3 className="text-xs font-bold text-white">{title}</h3><Badge tone={done === total ? 'green' : 'amber'}>{done}/{total}</Badge></div>{tasks.length ? <div className="space-y-1.5">{tasks.map((task) => { const isDone = completed.includes(task.id); return <div key={task.id} className="flex items-center gap-2 rounded-xl border border-white/[0.05] px-3 py-2"><span className={isDone ? 'text-emerald-300' : 'text-slate-600'}>{isDone ? <CheckCircle2 size={14} /> : <CircleDashed size={14} />}</span><span className="min-w-0 flex-1 truncate text-[10px] text-slate-300">{task.title}</span><span className="shrink-0 text-[9px] text-slate-500">{task.milestoneId.toUpperCase()} · {formatDate(task.dueDate)}</span></div>; })}</div> : <p className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-center text-[10px] text-slate-500">Aucune tâche attribuée.</p>}</section>;
}
