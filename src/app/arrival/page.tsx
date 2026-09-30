'use client';
import { useState } from 'react';
import { Bell, Check, MessageSquare, Send } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { formatDate, REQUEST_LABELS } from '@/lib/onboarding';
import {
  Badge,
  buttonClass,
  Empty,
  Field,
  inputClass,
  Panel,
  secondaryClass,
} from '@/components/manager/ui';
export default function ArrivalPage() {
  const {
    currentRecord: record,
    currentBuddy,
    mutate,
    saving,
  } = useOnboarding();
  const [blocker, setBlocker] = useState('');
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState('');
  if (!record) return null;
  const id = record.employee.id;
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-brand-400 mb-3">
          Avant et après le premier jour
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold">
          Mon arrivée & mon suivi
        </h1>
        <p className="text-slate-400 mt-3">
          Tes informations pratiques et tes échanges avec{' '}
          {record.employee.managerName}.
        </p>
      </header>
      {sent && (
        <p role="status" className="text-sm text-emerald-300">
          {sent}
        </p>
      )}
      {record.notifications.some((n) => !n.read) && (
        <Panel title="Mes rappels">
          <div className="space-y-3">
            {record.notifications
              .filter((n) => !n.read)
              .map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 rounded-xl border border-brand-400/20 bg-brand-400/5 p-4"
                >
                  <Bell size={18} className="text-brand-400 shrink-0 mt-1" />
                  <p className="flex-1 text-sm whitespace-pre-wrap">
                    {n.source === 'automatic' && (
                      <span className="block mb-1 text-[10px] uppercase tracking-wider text-brand-300">
                        Rappel automatique
                      </span>
                    )}
                    {n.message}
                  </p>
                  <button
                    aria-label={`Marquer comme lu : ${n.message}`}
                    disabled={saving}
                    className={secondaryClass}
                    onClick={() =>
                      void mutate(id, { type: 'notification.read', id: n.id })
                    }
                  >
                    <Check size={16} />
                    Lu
                  </button>
                </div>
              ))}
          </div>
        </Panel>
      )}
      <Panel
        title="Ton premier jour"
        description={`Arrivée le ${formatDate(record.employee.startDate)}`}
      >
        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          {[
            { label: 'Accueil par', value: record.welcome.host },
            {
              label: 'Rendez-vous',
              value: record.welcome.location
                ? `${record.welcome.location} · ${record.welcome.time}`
                : '',
            },
            { label: 'Ton buddy', value: currentBuddy?.name },
          ].map((info) => (
            <div key={info.label}>
              <p className="text-xs text-slate-500 mb-1">{info.label}</p>
              <p className="text-sm break-words">
                {info.value || 'Ton manager prépare cette information.'}
              </p>
            </div>
          ))}
        </div>
        {record.welcome.message ? (
          <p className="rounded-xl bg-white/5 p-4 text-slate-300 text-sm whitespace-pre-wrap">
            {record.welcome.message}
          </p>
        ) : (
          <Empty>
            Le message de bienvenue sera disponible ici dès sa préparation.
          </Empty>
        )}
      </Panel>
      <Panel title="Ton matériel et tes accès">
        <div className="space-y-3">
          {record.requests.map((r) => (
            <div key={r.id} className="rounded-xl border border-white/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">{r.title}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {r.owner} · Prévu pour le {formatDate(r.dueDate)}
                  </p>
                </div>
                <Badge
                  tone={
                    r.status === 'ready'
                      ? 'green'
                      : r.status === 'blocked'
                        ? 'red'
                        : 'amber'
                  }
                >
                  {REQUEST_LABELS[r.status]}
                </Badge>
              </div>
              {r.note && (
                <p className="text-sm text-slate-400 mt-3">{r.note}</p>
              )}
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Tes objectifs">
        {record.goals.length ? (
          <div className="space-y-3">
            {record.goals.map((g) => (
              <div
                key={g.id}
                className="flex items-start gap-3 rounded-xl border border-white/10 p-4"
              >
                <Badge tone={g.done ? 'green' : 'neutral'}>
                  {g.done ? 'Atteint' : 'En cours'}
                </Badge>
                <div>
                  <p className="text-sm">{g.title}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Pour le {formatDate(g.dueDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty>Tu définiras tes premiers objectifs avec ton manager.</Empty>
        )}
      </Panel>
      <Panel title="Tes points d’étape">
        <div className="space-y-3">
          {record.meetings.map((m) => (
            <div key={m.id} className="rounded-xl border border-white/10 p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">{m.title}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDate(m.dueDate)}
                  </p>
                </div>
                <Badge tone={m.done ? 'green' : 'neutral'}>
                  {m.done ? 'Réalisé' : 'Planifié'}
                </Badge>
              </div>
              {m.notes && (
                <p className="mt-3 text-sm text-slate-300 whitespace-pre-wrap">
                  {m.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      </Panel>
      <div className="grid lg:grid-cols-2 gap-5">
        <Panel
          title="Quelque chose te bloque ?"
          description="Ton manager retrouvera ton signalement dans son espace."
        >
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                await mutate(id, { type: 'blocker.create', title: blocker })
              ) {
                setBlocker('');
                setSent('Ton blocage a été partagé avec ton manager.');
              }
            }}
          >
            <Field label="Décris ton blocage">
              <textarea
                required
                maxLength={500}
                rows={3}
                value={blocker}
                onChange={(e) => setBlocker(e.target.value)}
                placeholder="Ex. Le VPN refuse ma connexion…"
                className={inputClass}
              />
            </Field>
            <button disabled={saving} className={buttonClass}>
              <MessageSquare size={16} />
              Signaler le blocage
            </button>
          </form>
          <div className="mt-5 space-y-3">
            {record.blockers.map((b) => (
              <div key={b.id} className="border-t border-white/10 pt-3">
                <Badge tone={b.resolvedAt ? 'green' : 'amber'}>
                  {b.resolvedAt ? 'Résolu' : 'Signalé'}
                </Badge>
                <p className="mt-2 text-sm text-slate-300 break-words">
                  {b.title}
                </p>
                {b.response && (
                  <p className="mt-2 text-sm text-emerald-200 whitespace-pre-wrap">
                    Réponse du manager : {b.response}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Panel>
        <Panel
          title="Comment se passe ton intégration ?"
          description="Un retour partagé avec ton manager pour adapter ton accompagnement."
        >
          {record.feedback && (
            <p className="mb-4 text-sm text-slate-400">
              Dernier retour : {record.feedback.rating}/5 —{' '}
              {record.feedback.comment || 'Sans commentaire'}
            </p>
          )}
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                await mutate(id, {
                  type: 'feedback',
                  rating: Number(rating),
                  comment,
                })
              ) {
                setSent('Merci, ton ressenti a été partagé.');
              }
            }}
          >
            <Field label="Ton ressenti">
              <select
                required
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className={inputClass}
              >
                <option value="">Choisis une note</option>
                <option value="1">1 — Très difficile</option>
                <option value="2">2 — Difficile</option>
                <option value="3">3 — Mitigé</option>
                <option value="4">4 — Bien</option>
                <option value="5">5 — Très bien</option>
              </select>
            </Field>
            <Field label="Ton commentaire (facultatif)">
              <textarea
                rows={3}
                maxLength={1500}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className={inputClass}
              />
            </Field>
            <button disabled={saving} className={buttonClass}>
              <Send size={16} />
              Partager mon ressenti
            </button>
          </form>
        </Panel>
      </div>
    </div>
  );
}
