'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarDays, Check, Clock3, Coffee, MapPin, X } from 'lucide-react';
import type { OnboardingRecord } from '@/types/manager';

const AGENDA = [
  { time: '09:00', title: 'Accueil avec ton manager', place: 'Hall d’accueil' },
  { time: '09:30', slot: true },
  { time: '10:30', slot: true },
  { time: '11:15', title: 'Découverte du bureau et de l’équipe', place: 'Bureaux' },
  { time: '12:30', title: 'Déjeuner avec l’équipe', place: 'À proximité' },
  { time: '14:00', slot: true },
  { time: '15:30', slot: true },
  { time: '16:30', title: 'Questions et fin de journée', place: 'Avec ton buddy' },
];

export default function CoffeeBookingModal({
  record, buddyName, saving, onClose, onReserve,
}: {
  record: OnboardingRecord;
  buddyName: string;
  saving: boolean;
  onClose: () => void;
  onReserve: (time: string) => Promise<boolean>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const reservation = record.meetings.find((meeting) => meeting.id === 'coffee-reservation');
  const reservedTime = reservation?.notes.match(/\b\d{2}:\d{2}\b/)?.[0] || '';
  const [selectedTime, setSelectedTime] = useState(reservedTime);
  const [error, setError] = useState('');
  const firstDayMeeting = record.meetings.find(
    (meeting) => meeting.id === 'meeting-1' && meeting.dueDate.slice(0, 10) === record.employee.startDate
  );
  const otherMeetings = record.meetings.filter((meeting) =>
    meeting.dueDate.slice(0, 10) === record.employee.startDate &&
    meeting.id !== 'meeting-1' && meeting.id !== 'coffee-reservation'
  );

  useEffect(() => {
    dialog.current?.showModal();
    return () => dialog.current?.close();
  }, []);

  async function reserve() {
    if (!selectedTime) return;
    setError('');
    if (!(await onReserve(selectedTime))) setError('La réservation n’a pas pu être enregistrée. Réessaie.');
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="coffee-booking-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className="w-[calc(100%-1.5rem)] max-w-lg max-h-[90dvh] overflow-y-auto rounded-3xl border border-white/10 bg-[#191a1e] p-0 text-white shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      <div className="sticky top-0 z-10 border-b border-white/[0.08] bg-[#191a1e]/95 px-5 py-4 backdrop-blur sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-brand-500/20 bg-brand-500/10 text-brand-300"><Coffee size={19} /></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-400">Café de bienvenue · 30 min</p>
              <h2 id="coffee-booking-title" className="mt-1 text-lg font-extrabold">Choisis ton créneau</h2>
              <p className="mt-1 text-xs text-slate-400">Avec {buddyName}, le jour de ton arrivée</p>
            </div>
          </div>
          <button type="button" aria-label="Fermer" onClick={onClose} className="rounded-xl border border-white/[0.08] p-2 text-slate-400 transition hover:bg-white/[0.05] hover:text-white"><X size={17} /></button>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-black/15 px-3 py-2.5 text-xs text-slate-300">
          <CalendarDays size={15} className="text-brand-400" />
          <span>{new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${record.employee.startDate}T12:00:00`))}</span>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div>
          <div className="mb-3 flex items-center justify-between"><h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Programme de ta journée</h3><span className="text-[10px] text-slate-500">Heure de Paris</span></div>
          <div className="space-y-2">
            {AGENDA.map((item) => (
              <div key={item.time} className="flex gap-3">
                <div className="w-12 shrink-0 pt-3 text-right font-mono text-[11px] text-slate-500">{item.time}</div>
                {item.slot ? (
                  <button type="button" onClick={() => setSelectedTime(item.time)} aria-pressed={selectedTime === item.time} className={`flex min-h-12 flex-1 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition ${selectedTime === item.time ? 'border-brand-400/55 bg-brand-400/10' : 'border-dashed border-brand-500/25 bg-brand-500/[0.035] hover:border-brand-400/45 hover:bg-brand-400/[0.08]'}`}>
                    <span className="flex min-w-0 items-center gap-2"><Coffee size={14} className="shrink-0 text-brand-300" /><span className="truncate text-xs font-semibold text-slate-200">Café avec {buddyName.split(' ')[0]}</span></span>
                    <span className={`shrink-0 text-[10px] font-bold ${selectedTime === item.time ? 'text-brand-200' : 'text-brand-300'}`}>{reservedTime === item.time ? 'Réservé' : selectedTime === item.time ? 'Choisi' : 'Libre'}</span>
                  </button>
                ) : (
                  <div className="flex min-h-12 flex-1 items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2">
                    <span className="min-w-0 truncate text-xs font-medium text-slate-300">{item.time === '09:00' ? firstDayMeeting?.title || item.title : item.title}</span><span className="flex shrink-0 items-center gap-1 text-[10px] text-slate-500"><MapPin size={11} />{item.time === '09:00' ? record.welcome.location || item.place : item.place}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {otherMeetings.length > 0 && <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Autres rendez-vous de ton agenda</p>
          <div className="space-y-2">{otherMeetings.map((meeting) => <div key={meeting.id} className="flex items-center gap-2 text-xs text-slate-300"><CalendarDays size={13} className="text-slate-500" />{meeting.title}{meeting.notes && <span className="text-slate-500">· {meeting.notes}</span>}</div>)}</div>
        </div>}

        <div className="flex items-center gap-2 text-[11px] text-slate-500"><Clock3 size={13} className="text-brand-400" />Tous les créneaux durent 30 minutes.{reservedTime && <span className="text-emerald-300">Ton choix actuel : {reservedTime}</span>}</div>
        {error && <p role="alert" className="text-xs text-rose-300">{error}</p>}
        <button type="button" disabled={!selectedTime || saving} onClick={() => void reserve()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 px-4 py-3 text-xs font-extrabold text-carbon-950 shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"><Check size={15} />{saving ? 'Réservation…' : reservedTime ? 'Modifier ma réservation' : 'Réserver ce créneau'}</button>
      </div>
    </dialog>
  );
}
