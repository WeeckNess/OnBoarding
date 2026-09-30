'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { dateOnly, formatDate } from '@/lib/onboarding';
import { getHrCompliance, HR_COMPLIANCE_ITEMS, missingComplianceCount } from '@/lib/admin';
import type { HrCompliance } from '@/types/manager';
import { Avatar, Badge, Empty, inputClass, Panel } from '@/components/manager/ui';

type Filter = 'all' | 'todo' | 'complete';

export default function AdminCompliancePage() {
  const { currentUser, records, mutate, saving } = useOnboarding();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('todo');
  const [selected, setSelected] = useState('all');
  const today = dateOnly();
  const allItems = useMemo(() => records.flatMap((record) => {
    const compliance = getHrCompliance(record);
    return HR_COMPLIANCE_ITEMS.map((item) => ({
      record,
      ...item,
      status: compliance[item.key],
    }));
  }), [records]);
  const completedCount = allItems.filter((item) => item.status === 'complete').length;
  const filtered = records.filter((record) => {
    const searchMatch = `${record.employee.firstName} ${record.employee.lastName} ${record.employee.department} ${record.employee.managerName}`.toLocaleLowerCase('fr').includes(search.toLocaleLowerCase('fr'));
    if (!searchMatch) return false;
    if (selected !== 'all' && record.managerId !== selected) return false;
    const missing = missingComplianceCount(record);
    return filter === 'all' || (filter === 'todo' && missing > 0) || (filter === 'complete' && missing === 0);
  });
  const managerOptions = [...new Map(records.map((record) => [record.managerId, record.employee.managerName || 'Manager non renseigné'])).entries()];

  if (currentUser?.appRole !== 'admin') return null;

  return (
    <div className="space-y-7 pb-10">
      <header className="space-y-5">
        <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-white"><ArrowLeft size={14} />Retour au tableau de bord RH</Link>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-200"><ShieldCheck size={14} />Pilotage administratif</div><h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Conformité RH</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">Suivez les formalités par salarié, repérez les éléments manquants et actualisez leur statut au fil de leur réception.</p></div>
          <div className="grid grid-cols-2 gap-2 sm:min-w-72"><Summary label="Éléments reçus" value={`${completedCount} / ${allItems.length}`} tone="green" /><Summary label="À traiter" value={allItems.length - completedCount} tone={allItems.length > completedCount ? 'amber' : 'green'} /></div>
        </div>
      </header>

      <Panel title="État par formalité" description="Volume de dossiers complets pour chaque pièce suivie" icon={FileCheck2}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {HR_COMPLIANCE_ITEMS.map((item) => {
            const items = allItems.filter((row) => row.key === item.key);
            const done = items.filter((row) => row.status === 'complete').length;
            const percent = items.length ? Math.round(done / items.length * 100) : 0;
            return <article key={item.key} className="rounded-2xl border border-white/[0.07] bg-black/10 p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="text-sm font-bold text-white">{item.label}</h2><p className="mt-1 text-[10px] text-slate-500">{item.description}</p></div><Badge tone={percent === 100 ? 'green' : 'amber'}>{done}/{items.length}</Badge></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-violet-300" style={{ width: `${percent}%` }} /></div><p className="mt-2 text-right text-[10px] text-slate-500">{percent}% des dossiers</p></article>;
          })}
        </div>
      </Panel>

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div><h2 className="text-lg font-bold text-white">Dossiers collaborateurs</h2><p className="mt-1 text-xs text-slate-400">{filtered.length} dossiers affichés · cliquez sur un nom pour ouvrir le détail RH</p></div>
          <div className="grid gap-2 sm:grid-cols-[minmax(200px,1fr)_190px_180px] lg:min-w-[650px]">
            <div className="relative"><Search size={14} className="absolute left-3.5 top-3.5 text-slate-500" /><input aria-label="Rechercher un collaborateur" className={`${inputClass} pl-10 !text-xs`} placeholder="Nom, pôle, manager…" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
            <select aria-label="Filtrer par manager" className={`${inputClass} !text-xs`} value={selected} onChange={(event) => setSelected(event.target.value)}><option value="all">Tous les managers</option>{managerOptions.map(([id, name]) => <option key={id} value={id}>{name.split(' (')[0]}</option>)}</select>
            <select aria-label="Filtrer les statuts" className={`${inputClass} !text-xs`} value={filter} onChange={(event) => setFilter(event.target.value as Filter)}><option value="todo">À traiter</option><option value="all">Tous les dossiers</option><option value="complete">Conformes</option></select>
          </div>
        </div>

        {filtered.length ? <div className="space-y-3">{filtered.map((record) => {
          const status = getHrCompliance(record);
          const missing = missingComplianceCount(record);
          const contractSigned = record.documents.length > 0 && record.documents.every((document) => document.status === 'signed');
          return <article key={record.employee.id} className="glass-panel overflow-hidden rounded-3xl border border-white/10 shadow-xl">
            <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] bg-white/[0.015] p-4 sm:flex-row sm:items-center sm:px-5">
              <Link href={`/admin/people/${record.employee.id}`} className="group flex min-w-0 items-center gap-3"><Avatar firstName={record.employee.firstName} lastName={record.employee.lastName} /><span className="min-w-0"><span className="block truncate text-sm font-bold text-white group-hover:text-violet-100">{record.employee.firstName} {record.employee.lastName}<ArrowRight size={13} className="ml-1 inline opacity-0 transition group-hover:opacity-100" /></span><span className="mt-1 block truncate text-[10px] text-slate-400">{record.employee.role} · {record.employee.department}</span><span className="mt-0.5 block truncate text-[10px] text-slate-500">Manager : {record.employee.managerName || 'Non renseigné'}</span></span></Link>
              <div className="flex flex-wrap items-center gap-2"><Badge>{record.employee.startDate > today ? `Arrivée le ${formatDate(record.employee.startDate)}` : `Depuis le ${formatDate(record.employee.startDate)}`}</Badge><Badge tone={missing ? 'amber' : 'green'}>{missing ? `${missing} élément${missing > 1 ? 's' : ''} manquant${missing > 1 ? 's' : ''}` : 'Dossier conforme'}</Badge></div>
            </div>
            <div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-3 sm:p-5">
              {HR_COMPLIANCE_ITEMS.map((item) => {
                const done = status[item.key] === 'complete';
                return <div key={item.key} className={`flex min-w-0 items-center gap-3 rounded-2xl border p-3 ${done ? 'border-emerald-400/10 bg-emerald-400/[0.025]' : 'border-amber-300/10 bg-amber-300/[0.025]'}`}>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${done ? 'bg-emerald-400/10 text-emerald-200' : 'bg-amber-300/10 text-amber-200'}`}>{done ? <CheckCircle2 size={16} /> : item.key === 'dpae' ? <Clock3 size={16} /> : <FileText size={16} />}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-white">{item.label}</span><span className="mt-0.5 block truncate text-[9px] text-slate-500">{item.description}</span></span>
                  {item.key === 'itCharter' ? <Badge tone={done ? 'green' : 'amber'}>{done ? 'Signée' : 'À signer'}</Badge> : <button type="button" disabled={saving} onClick={() => void mutate(record.employee.id, { type: 'hr.compliance.set', key: item.key, status: done ? 'pending' : 'complete' }, record.version)} className={`shrink-0 rounded-lg border px-2.5 py-2 text-[9px] font-bold transition disabled:cursor-wait disabled:opacity-50 ${done ? 'border-white/10 text-slate-400 hover:border-amber-300/20 hover:text-amber-200' : 'border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-200 hover:bg-emerald-300/10'}`} title={done ? 'Rouvrir le suivi' : 'Marquer comme reçu'}>{done ? 'Revoir' : <><Check size={12} className="mr-1 inline" />Reçu</>}</button>}
                </div>;
              })}
              <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/10 p-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${contractSigned ? 'bg-emerald-400/10 text-emerald-200' : 'bg-amber-300/10 text-amber-200'}`}><FileCheck2 size={16} /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-white">Contrat & documents à signer</span><span className="mt-0.5 block truncate text-[9px] text-slate-500">{record.documents.filter((document) => document.status === 'signed').length}/{record.documents.length} signatures enregistrées</span></span><Badge tone={contractSigned ? 'green' : 'amber'}>{contractSigned ? 'Signé' : 'En attente'}</Badge></div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-3 sm:px-5"><span className="text-[10px] text-slate-500">Mis à jour avec la fiche RH du collaborateur</span><Link href={`/admin/people/${record.employee.id}`} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-violet-200 hover:text-white">Ouvrir le dossier complet <ArrowRight size={12} /></Link></div>
          </article>;
        })}</div> : <Empty>Aucun dossier ne correspond à ces filtres.</Empty>}
      </section>
      <p className="rounded-2xl border border-violet-300/10 bg-violet-300/[0.035] p-4 text-[10px] leading-relaxed text-slate-400">La validation d’une pièce confirme sa réception dans le suivi RH. Les fichiers eux-mêmes ne sont pas hébergés dans ce prototype. La signature de la charte et du contrat reste rattachée à l’action du salarié.</p>
    </div>
  );
}

function Summary({ label, value, tone }: { label: string; value: string | number; tone: 'green' | 'amber' }) {
  return <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</p><p className={`mt-1 text-xl font-black ${tone === 'green' ? 'text-emerald-200' : 'text-amber-200'}`}>{value}</p></div>;
}
