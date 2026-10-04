'use client';

import { useState } from 'react';
import { ExternalLink, FileCheck2, Plus } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { formatDate } from '@/lib/onboarding';
import { buttonClass, inputClass } from './ui';
import type { OnboardingRecord } from '@/types/manager';

export default function DocumentDispatch({ record }: { record: OnboardingRecord }) {
  const { mutate, saving } = useOnboarding();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="space-y-5">
      <form className="grid gap-3 rounded-2xl border border-white/10 bg-carbon-900/60 p-4 sm:grid-cols-2" onSubmit={async (event) => {
        event.preventDefault();
        const ok = await mutate(record.employee.id, { type: 'document.add', title, description, resourceUrl }, record.version);
        if (ok) { setTitle(''); setDescription(''); setResourceUrl(''); setSent(true); }
      }}>
        <label className="text-xs text-slate-300">Nom du document *<input required maxLength={150} value={title} onChange={(event) => setTitle(event.target.value)} className={`${inputClass} mt-1`} placeholder="Ex. Charte informatique" /></label>
        <label className="text-xs text-slate-300">Lien vers le document<input type="url" maxLength={1000} value={resourceUrl} onChange={(event) => setResourceUrl(event.target.value)} className={`${inputClass} mt-1`} placeholder="https://…" /></label>
        <label className="text-xs text-slate-300 sm:col-span-2">Contenu ou consigne<textarea maxLength={5000} value={description} onChange={(event) => setDescription(event.target.value)} className={`${inputClass} mt-1`} rows={3} placeholder="Collez le texte à signer ou indiquez les consignes. Un contenu ou un lien est requis." /></label>
        <div className="flex items-center gap-3 sm:col-span-2"><button disabled={saving} className={buttonClass} type="submit"><Plus size={14} /> Envoyer pour signature</button>{sent && <span role="status" className="text-xs text-emerald-300">Document envoyé au salarié.</span>}</div>
      </form>

      <div className="grid gap-3 sm:grid-cols-2">
        {!record.documents.length && <p className="text-xs text-slate-400 sm:col-span-2">Aucun document à signer n’est encore associé à ce dossier.</p>}
        {record.documents.map((document) => (
          <article key={document.id} className="rounded-2xl border border-white/10 bg-carbon-850 p-4">
            <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><FileCheck2 size={16} className="text-brand-300" /><h3 className="text-sm font-bold text-white">{document.title}</h3></div><span className={`shrink-0 text-[10px] font-bold ${document.status === 'signed' ? 'text-emerald-300' : 'text-amber-300'}`}>{document.status === 'signed' ? 'Signé' : 'À signer'}</span></div>
            {document.description && <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-400">{document.description}</p>}
            {document.resourceUrl && <a href={document.resourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-300 hover:text-white">Ouvrir le document <ExternalLink size={12} /></a>}
            <p className="mt-3 text-[10px] text-slate-500">{document.status === 'signed' && document.signedAt ? `Signé le ${formatDate(document.signedAt)}` : document.requestedBy ? `Envoyé par ${document.requestedBy}` : 'Document du parcours'}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
