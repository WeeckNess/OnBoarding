'use client';

import Link from 'next/link';
import {
  ArrowRight,
  AlertTriangle,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { alertsFor, dateOnly, formatDate } from '@/lib/onboarding';
import { addMonths, daysBetween, missingComplianceCount, openBlockingRequests } from '@/lib/admin';
import { Avatar, Badge, Empty, Panel } from '@/components/manager/ui';

export default function AdminPage() {
  const { currentUser, records } = useOnboarding();
  const today = dateOnly();
  if (currentUser?.appRole !== 'admin') return null;

  const upcoming = records.filter((record) => record.employee.startDate >= today);
  const atRisk = upcoming.filter((record) => openBlockingRequests(record).length > 0);
  const missingDocs = records.reduce((sum, record) => sum + missingComplianceCount(record), 0);
  const totalChecks = records.length * 6;
  const completion = totalChecks ? Math.round(((totalChecks - missingDocs) / totalChecks) * 100) : 0;
  const probation = records
    .map((record) => ({ record, date: addMonths(record.employee.startDate, 6) }))
    .map((item) => ({ ...item, days: daysBetween(item.date, today) }))
    .filter((item) => item.days >= 0 && item.days <= 30)
    .sort((a, b) => a.days - b.days);

  const managers = new Map<string, { managerId: string; managerName: string; department: string; total: number; ready: number; blocked: number }>();
  records.forEach((record) => {
    const manager = managers.get(record.managerId) || {
      managerId: record.managerId,
      managerName: record.employee.managerName || 'Manager non renseigné',
      department: record.employee.department,
      total: 0,
      ready: 0,
      blocked: 0,
    };
    manager.total++;
    if (!openBlockingRequests(record).length) manager.ready++;
    if (record.requests.some((request) => request.status === 'blocked')) manager.blocked++;
    managers.set(record.managerId, manager);
  });
  const teamRows = [...managers.values()].sort((a, b) => b.blocked - a.blocked || b.total - a.total);

  return (
    <div className="space-y-8 pb-10">
      <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#1b1c20] p-6 shadow-2xl sm:p-9">
        <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-200"><ShieldCheck size={14} />Portail RH / Admin · Vue globale</div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Bonjour, {currentUser.firstName}</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-400">Un point de contrôle sur les formalités, les équipes et les risques d’onboarding de Data Insight.</p>
          </div>
          <Link href="/admin/teams" className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-bold text-slate-200 transition hover:bg-white/[0.08] sm:self-auto">Voir toutes les équipes <ArrowRight size={14} /></Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicateurs RH">
        <Kpi href="/admin/teams" icon={Users} label="Collaborateurs suivis" value={records.length} note="Vue entreprise complète" tone="violet" />
        <Kpi href="/admin/teams?filter=risks" icon={AlertTriangle} label="Arrivées à risque" value={atRisk.length} note="Demandes IT ou matériel bloquantes" tone={atRisk.length ? 'amber' : 'green'} />
        <Kpi href="/admin/compliance" icon={ClipboardCheck} label="Conformité des pièces" value={`${completion}%`} note={`${missingDocs} éléments à compléter`} tone={completion >= 80 ? 'green' : 'amber'} />
        <Kpi href="/admin/teams?filter=probation" icon={CalendarClock} label="Bilan de période d’essai" value={probation.length} note="Échéance dans les 30 jours" tone={probation.length ? 'amber' : 'violet'} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
        <Panel title="Points de vigilance immédiats" description="Les dossiers qui demandent une action RH ou managériale" icon={AlertTriangle} action={<Link className="text-[11px] font-bold text-violet-200 hover:text-white" href="/admin/teams?filter=risks">Tout le suivi <ArrowRight className="ml-1 inline" size={12} /></Link>}>
          <div className="space-y-2">
            {atRisk.slice(0, 5).map((record) => {
              const requests = openBlockingRequests(record);
              const days = daysBetween(record.employee.startDate, today);
              return <Link key={record.employee.id} href={`/admin/people/${record.employee.id}`} className="flex items-center gap-3 rounded-2xl border border-amber-300/10 bg-amber-300/[0.035] p-3 transition hover:bg-amber-300/[0.07]">
                <div className="rounded-xl bg-amber-300/10 p-2 text-amber-200"><AlertTriangle size={15} /></div>
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-white">{record.employee.firstName} {record.employee.lastName} <span className="font-normal text-slate-400">· {record.employee.department}</span></p><p className="mt-1 truncate text-[10px] text-slate-400">{requests.map((request) => request.title).join(' · ')}</p></div>
                <Badge tone={days <= 2 ? 'red' : 'amber'}>{days === 0 ? 'J0' : `J−${days}`}</Badge>
              </Link>;
            })}
            {!atRisk.length && <Empty>Aucune demande bloquante sur les prochaines arrivées.</Empty>}
          </div>
        </Panel>

        <Panel title="Périodes d’essai à venir" description="Échéances à six mois calculées depuis la date d’arrivée" icon={CalendarClock} action={<Link className="text-[11px] font-bold text-violet-200 hover:text-white" href="/admin/teams?filter=probation">Calendrier complet <ArrowRight className="ml-1 inline" size={12} /></Link>}>
          <div className="space-y-2">
            {probation.slice(0, 5).map(({ record, date, days }) => <Link key={record.employee.id} href={`/admin/people/${record.employee.id}`} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/15 p-3 transition hover:bg-white/[0.04]">
              <Avatar firstName={record.employee.firstName} lastName={record.employee.lastName} />
              <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-white">{record.employee.firstName} {record.employee.lastName}</p><p className="mt-0.5 truncate text-[10px] text-slate-400">{record.employee.managerName}</p></div>
              <div className="text-right"><Badge tone={days <= 7 ? 'red' : 'amber'}>{days === 0 ? 'Aujourd’hui' : `J−${days}`}</Badge><p className="mt-1 text-[9px] text-slate-500">{formatDate(date)}</p></div>
            </Link>)}
            {!probation.length && <Empty>Aucune échéance dans les 30 prochains jours.</Empty>}
          </div>
        </Panel>
      </section>

      <Panel title="Préparation par équipe" description="Taux de demandes bloquantes prêtes et dossiers nécessitant un suivi" icon={BriefcaseBusiness} action={<Link className="text-[11px] font-bold text-violet-200 hover:text-white" href="/admin/teams">Ouvrir le pilotage <ArrowRight className="ml-1 inline" size={12} /></Link>}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {teamRows.slice(0, 6).map((team) => {
            const rate = team.total ? Math.round((team.ready / team.total) * 100) : 0;
            return <Link key={team.managerId} href={`/admin/teams?manager=${encodeURIComponent(team.managerId)}`} className="rounded-2xl border border-white/[0.07] bg-black/10 p-4 transition hover:border-violet-300/20 hover:bg-white/[0.035]">
              <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-xs font-bold text-white">{team.managerName.split(' (')[0]}</p><p className="mt-1 truncate text-[10px] text-slate-500">{team.department} · {team.total} dossiers</p></div><Badge tone={team.blocked ? 'amber' : 'green'}>{team.blocked ? `${team.blocked} bloqué${team.blocked > 1 ? 's' : ''}` : 'À jour'}</Badge></div>
              <div className="mt-4 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-violet-300" style={{ width: `${rate}%` }} /></div><span className="font-mono text-[10px] text-slate-400">{rate}%</span></div>
            </Link>;
          })}
        </div>
        {!teamRows.length && <Empty>Aucun manager ou équipe à afficher.</Empty>}
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2">
        <QuickLink href="/admin/compliance" icon={FileCheck2} title="Ouvrir la conformité RH" description="Vérifier et actualiser les pièces de chaque dossier." />
        <QuickLink href="/admin/teams" icon={CheckCircle2} title="Ouvrir le suivi des équipes" description="Consulter la préparation J1 à J+30 et les bilans managers." />
      </div>
    </div>
  );
}

function Kpi({ href, icon: Icon, label, value, note, tone }: { href: string; icon: typeof Users; label: string; value: string | number; note: string; tone: 'violet' | 'amber' | 'green' }) {
  const styles = { violet: 'border-violet-300/10 bg-violet-300/[0.04] text-violet-200', amber: 'border-amber-300/10 bg-amber-300/[0.04] text-amber-200', green: 'border-emerald-300/10 bg-emerald-300/[0.04] text-emerald-200' };
  return <Link href={href} className="glass-panel rounded-2xl border border-white/10 p-4 transition hover:border-white/20 hover:bg-white/[0.025] sm:p-5">
    <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 text-3xl font-black tracking-tight text-white">{value}</p></div><span className={`rounded-xl border p-2.5 ${styles[tone]}`}><Icon size={17} /></span></div>
    <p className="mt-3 flex items-center justify-between gap-2 text-[10px] text-slate-400"><span>{note}</span><ArrowRight size={13} /></p>
  </Link>;
}

function QuickLink({ href, icon: Icon, title, description }: { href: string; icon: typeof Users; title: string; description: string }) {
  return <Link href={href} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-violet-300/20 hover:bg-white/[0.04]"><span className="rounded-xl border border-violet-300/10 bg-violet-300/[0.06] p-2.5 text-violet-200"><Icon size={17} /></span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-white">{title}</span><span className="mt-1 block text-[10px] text-slate-400">{description}</span></span><ArrowRight size={15} className="text-slate-500" /></Link>;
}
