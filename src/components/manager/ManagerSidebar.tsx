'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Users,
} from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
export default function ManagerSidebar() {
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const first = menu.current?.querySelector<HTMLElement>('a, button');
    first?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const elements = Array.from(
        menu.current?.querySelectorAll<HTMLElement>('a, button') || []
      ).filter((element) => getComputedStyle(element).display !== 'none');
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      opener.current?.focus();
    };
  }, [open]);
  const { currentUser, logoutUser } = useOnboarding();
  const path = usePathname();
  const links = [
    { href: '/manager', label: 'Mon équipe', icon: LayoutDashboard },
    { href: '/codex', label: 'Documentation', icon: BookOpen },
  ];
  return (
    <>
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-carbon-950/95 px-4 py-3">
        <span className="font-semibold text-brand-300">
          DataInsight · Manager
        </span>
        <button
          ref={opener}
          aria-expanded={open}
          aria-controls="manager-sidebar"
          aria-label="Ouvrir le menu"
          onClick={() => setOpen(true)}
          className="p-2"
        >
          <Menu size={22} />
        </button>
      </header>
      {open && (
        <button
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        ref={menu}
        id="manager-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-carbon-950 p-5 transition-transform ${open ? 'translate-x-0 visible' : '-translate-x-full invisible md:translate-x-0 md:visible'}`}
      >
        <div className="flex items-center justify-between">
          <Link
            href="/manager"
            className="flex items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <Image
              src="/logo-midi.png"
              alt="Midi Agency"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <div>
              <strong className="block text-white">DataInsight</strong>
              <span className="text-xs text-slate-400">par Midi Agency</span>
            </div>
          </Link>
          <button
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="md:hidden p-2"
          >
            <X size={20} />
          </button>
        </div>
        <div className="my-8 rounded-xl border border-brand-400/20 bg-brand-400/5 p-4">
          <Users className="mb-3 text-brand-400" size={22} />
          <p className="text-xs font-bold uppercase tracking-widest text-brand-300">
            Espace manager
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Préparer. Accueillir.
            <br />
            Accompagner.
          </p>
        </div>
        <nav aria-label="Navigation manager" className="space-y-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={path.startsWith(href) ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${path.startsWith(href) ? 'bg-brand-500 text-carbon-950 font-semibold' : 'text-slate-300 hover:bg-white/5'}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-white/10 pt-5">
          <p className="text-xs text-slate-500 mb-4">
            Environnement de démonstration
          </p>
          <p className="font-semibold text-sm">
            {currentUser?.firstName} {currentUser?.lastName}
          </p>
          <p className="mt-1 text-xs text-slate-400">{currentUser?.role}</p>
          <button
            onClick={() => void logoutUser()}
            className="mt-4 flex items-center gap-2 text-sm text-slate-300 hover:text-white"
          >
            <LogOut size={16} />
            Changer de profil
          </button>
        </div>
      </aside>
    </>
  );
}
