'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  MessageSquareText,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Avatar, Badge, Empty, inputClass, Panel } from '@/components/manager/ui';
import { useOnboarding } from '@/context/OnboardingContext';
import { alertsFor, dateOnly, formatDate } from '@/lib/onboarding';
import { addMonths, daysBetween, missingComplianceCount, openBlockingRequests } from '@/lib/admin';

type Team = { id: string; managerName: string; department: string; records: ReturnType<typeof useOnboarding>['records'] };

export default function AdminTeamsPage() {
  const { currentUser, records } = useOnboarding();
  const query = useSearchParams();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(query.get('filter') || 'all');
  const [managerFilter, setManagerFilter] = useState(query.get('manager') || 'all');
  const today = dateOnly();

  const teams = useMemo(() => {
    const grouped = new Map<string, Team>();
    records.forEach((record) => {
      const team = grouped.get(record.managerId) || {
        id: record.managerId,
        managerName: record.employee.managerName || 'Manager non renseigné',
        department: record.employee.department,
        records: [],
      };
      team.records.push(record);
      grouped.set(record.managerId, team);
    });
    return [...grouped.values()].sort((a, b) => a.managerName.localeCompare(b.managerName, 'fr'));
  }, [records]);

  const selectedRecords = records.filter((record) => {
    const searchMatch = `${record.employee.firstName} ${record.employee.lastName} ${record.employee.department} ${record.employee.managerName} ${record.employee.role}`.toLocaleLowerCase('fr').includes(search.toLocaleLowerCase('fr'));
    const daysToStart = daysBetween(record.employee.startDate, today);
    const hasRisk = openBlockingRequests(record).length > 0 || alertsFor(record, today).some((alert) => alert.urgent);
    const probationDays = daysBetween(addMonths(record.employee.startDate, 6), today);
    const filterMatch = filter === 'all' ||
      (filter === 'risks' && hasRisk) ||
      (filter === 'probation' && probationDays >= 0 && probationDays <= 30) ||
      (filter === 'upcoming' && daysToStart >= 0);
    return searchMatch && filterMatch;
  });
  const selectedIds = new Set(selectedRecords.map((record) => record.employee.id));
  const atRiskCount = records.filter((record) => openBlockingRequests(record).length > 0 || alertsFor(record, today).some((alert) => alert.urgent)).length;
  const probationCount = records.filter((record) => {
    const days = daysBetween(addMonths(record.employee.startDate, 6), today);
    return days >= 0 && days <= 30;
  }).length;

  if (currentUser?.appRole !== 'admin') return null;

  return (
    <div className="space-y-7 pb-10">
      <header className="space-y-5">
        <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-white"><ArrowLeft size={14} />Retour au tableau de bord RH</Link>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-200"><Users size={14} />Pilotage entreprise</div><h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Suivi des équipes</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">Comparez la préparation des équipes, repérez les blocages avant J1 et consultez le suivi opérationnel de chaque manager.</p></div><div className="grid grid-cols-3 gap-2 sm:min-w-[360px]"><Summary label="Équipes" value={teams.length} /><Summary label="Profils" value={records.length} /><Summary label="À risque" value={atRiskCount} alert={!!atRiskCount} /></div></div>
      </header>

      <Panel title="Filtres du pilotage" description="Affinez la vue par collaborateur, manager ou échéance" icon={Search}>
        <div className="grid gap-2 sm:grid-cols-[minmax(200px,1fr)_220px_220px]">
          <div className="relative"><Search size={14} className="absolute left-3.5 top-3.5 text-slate-500" /><input aria-label="Rechercher une équipe ou un collaborateur" className={`${inputClass} pl-10 !text-xs`} placeholder="Nom, poste, équipe, manager…" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
          <select aria-label="Filtrer le suivi des équipes" className={`${inputClass} !text-xs`} value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">Tous les parcours</option><option value="risks">Dossiers à risque ({atRiskCount})</option><option value="upcoming">Arrivées à venir</option><option value="probation">Bilan J+180 dans 30 jours ({probationCount})</option></select>
          <select aria-label="Filtrer par manager" className={`${inputClass} !text-xs`} value={managerFilter} onChange={(event) => setManagerFilter(event.target.value)}><option value="all">Toutes les équipes</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.managerName.split(' (')[0]}</option>)}</select>
        </div>
      </Panel>

      <div className="space-y-4">
        {teams.map((team, index) => {
          const visible = team.records.filter((record) => selectedIds.has(record.employee.id));
          if (!visible.length || (managerFilter !== 'all' && managerFilter !== team.id)) return null;
          const readyCount = visible.filter((record) => openBlockingRequests(record).length === 0).length;
          const riskCount = visible.filter((record) => openBlockingRequests(record).length > 0 || alertsFor(record, today).some((alert) => alert.urgent)).length;
          const readinessRate = visible.length ? Math.round(readyCount / visible.length * 100) : 0;
          return <details key={team.id} open={managerFilter !== 'all' || index === 0} className="glass-panel group overflow-hidden rounded-3xl border border-white/10 shadow-xl">
            <summary className="flex cursor-pointer list-none flex-col gap-4 p-5 marker:hidden transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:px-6 [&::-webkit-details-marker]:hidden">
              <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-300/10 bg-violet-300/[0.06] text-violet-200"><ShieldCheck size={18} /></span><div><h2 className="text-sm font-bold text-white">{team.managerName.split(' (')[0]}</h2><p className="mt-1 text-[10px] text-slate-400">{team.department} · {visible.length} collaborateur{visible.length > 1 ? 's' : ''}{filter !== 'all' || search ? ` affiché${visible.length > 1 ? 's' : ''} sur ${team.records.length}` : ''}</p></div><ChevronDown size={15} className="ml-1 text-slate-500 transition group-open:rotate-180" /></div>
              <div className="flex flex-wrap items-center gap-2 pl-14 sm:pl-0"><Badge tone={readinessRate === 100 ? 'green' : 'amber'}>{readinessRate}% prêts avant J1</Badge><Badge tone={riskCount ? 'red' : 'green'}>{riskCount ? `${riskCount} à suivre` : 'Aucun blocage'}</Badge></div>
            </summary>
            <div className="border-t border-white/[0.07]">
              <div className="hidden grid-cols-[minmax(180px,1.2fr)_minmax(100px,0.7fr)_minmax(130px,0.9fr)_minmax(150px,1fr)_minmax(120px,0.8fr)] gap-3 bg-black/10 px-5 py-3 text-[9px] font-bold uppercase tracking-wider text-slate-500 lg:grid"><span>Collaborateur</span><span>Jalon</span><span>Préparation J1</span><span>Suivi manager</span><span>RH</span></div>
              <div className="divide-y divide-white/[0.05]">
                {visible.map((record) => {
                  const startDays = daysBetween(record.employee.startDate, today);
                  const blocking = openBlockingRequests(record);
                  const managerTasks = record.tasks.filter((task) => task.owner === 'manager');
                  const managerDone = managerTasks.filter((task) => record.employee.completedTaskIds.includes(task.id)).length;
                  const overdueTasks = managerTasks.filter((task) => !record.employee.completedTaskIds.includes(task.id) && task.dueDate < today).length;
                  const nextMeeting = record.meetings.filter((meeting) => !meeting.done).sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
                  const probationDate = addMonths(record.employee.startDate, 6);
                  const probationDays = daysBetween(probationDate, today);
                  const missing = missingComplianceCount(record);
                  const taskSignal = overdueTasks ? `${overdueTasks} tâche${overdueTasks > 1 ? 's' : ''} en retard` : `${managerDone}/${managerTasks.length} tâches manager`;
                  return <Link key={record.employee.id} href={`/admin/people/${record.employee.id}`} className="grid gap-3 px-4 py-4 transition hover:bg-white/[0.035] sm:px-5 lg:grid-cols-[minmax(180px,1.2fr)_minmax(100px,0.7fr)_minmax(130px,0.9fr)_minmax(150px,1fr)_minmax(120px,0.8fr)] lg:items-center">
                    <div className="flex min-w-0 items-center gap-3"><Avatar firstName={record.employee.firstName} lastName={record.employee.lastName} /><div className="min-w-0"><p className="truncate text-xs font-bold text-white">{record.employee.firstName} {record.employee.lastName}</p><p className="truncate text-[10px] text-slate-500">{record.employee.role}</p></div></div>
                    <div><Badge tone={startDays > 0 ? 'neutral' : startDays >= -30 ? 'amber' : 'neutral'}>{startDays > 0 ? `J−${startDays}` : startDays === 0 ? 'J0 · Arrivée' : `J+${Math.abs(startDays)}`}</Badge><p className="mt-1 text-[9px] text-slate-500">{formatDate(record.employee.startDate)}</p></div>
                    <div><Badge tone={blocking.length ? 'amber' : 'green'}>{blocking.length ? `${blocking.length} demande${blocking.length > 1 ? 's' : ''} ouverte${blocking.length > 1 ? 's' : ''}` : 'Matériel & accès prêts'}</Badge>{blocking.length > 0 && <p className="mt-1 truncate text-[9px] text-slate-500">{blocking.map((request) => request.title).join(', ')}</p>}</div>
                    <div><p className={`text-[10px] ${overdueTasks ? 'text-amber-200' : 'text-slate-300'}`}>{taskSignal}</p><p className="mt-1 truncate text-[9px] text-slate-500">{nextMeeting ? `Prochain point · ${formatDate(nextMeeting.dueDate)}` : record.feedback ? 'Rapport d’étonnement reçu' : 'Aucun point à venir renseigné'}</p></div>
                    <div className="flex flex-wrap gap-1.5"><Badge tone={missing ? 'amber' : 'green'}>{missing ? `${missing} pièces` : 'Conforme'}</Badge>{probationDays >= 0 && probationDays <= 30 && <Badge tone={probationDays <= 7 ? 'red' : 'amber'}>J+180 proche</Badge>}</div>
                  </Link>;
                })}
              </div>
            </div>
          </details>;
        })}
        {!teams.some((team) => team.records.some((record) => selectedIds.has(record.employee.id)) && (managerFilter === 'all' || managerFilter === team.id)) && <Empty>Aucun dossier ne correspond à cette vue. Modifiez vos filtres ou ouvrez le suivi complet.</Empty>}
      </div>

      <Panel title="Lecture du suivi manager" description="Indicateurs calculés à partir des dossiers collaborateurs" icon={ClipboardList}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Explanation icon={CheckCircle2} title="Préparation J1" text="Les demandes bloquantes de matériel et d’accès doivent être marquées comme disponibles avant la date d’arrivée." />
          <Explanation icon={MessageSquareText} title="Suivi opérationnel" text="Les tâches confiées au manager, les points planifiés et le rapport d’étonnement donnent une vue de la montée en compétences." />
          <Explanation icon={CalendarClock} title="Bilan à six mois" text="L’échéance est calculée à six mois de la date d’arrivée et apparaît dans la fenêtre des 30 jours précédents." />
        </div>
      </Panel>
    </div>
  );
}

function Summary({ label, value, alert = false }: { label: string; value: number; alert?: boolean }) {
  return <div className="rounded-2xl border border-white/10 bg-black/15 px-3 py-3"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</p><p className={`mt-1 text-xl font-black ${alert ? 'text-amber-200' : 'text-white'}`}>{value}</p></div>;
}

function Explanation({ icon: Icon, title, text }: { icon: typeof CheckCircle2; title: string; text: string }) {
  return <article className="rounded-2xl border border-white/[0.07] bg-black/10 p-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-300/[0.07] text-violet-200"><Icon size={16} /></span><h3 className="mt-3 text-xs font-bold text-white">{title}</h3><p className="mt-1.5 text-[10px] leading-relaxed text-slate-400">{text}</p></article>;
}
