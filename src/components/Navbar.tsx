'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { 
  LayoutDashboard, 
  MapPin, 
  BookOpen, 
  UserCheck, 
  FileCheck2, 
  LogOut, 
  Sparkles,
  RotateCcw
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logoutUser, progressPercentage, resetProgress } = useOnboarding();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/roadmap', label: 'Roadmap J+1 à 30', icon: MapPin },
    { href: '/codex', label: 'Codex / Doc', icon: BookOpen },
    { href: '/buddy', label: 'Mon Buddy', icon: UserCheck },
    { href: '/contracts', label: 'Contrat de travail', icon: FileCheck2 },
  ];

  const handleLogout = () => {
    logoutUser();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Co-branding */}
          <div className="flex items-center space-x-4">
            <Link href={currentUser ? '/dashboard' : '/'} className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center font-bold text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                DI
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 font-bold text-white tracking-tight text-sm">
                  <span>Data Insight</span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    Onboarding
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  par <strong className="text-slate-300 font-medium">Midi Agency</strong>
                </span>
              </div>
            </Link>
          </div>

          {/* Center Navigation Links when logged in */}
          {currentUser && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-sm shadow-brand-600/30 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Action / User Profile */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                {/* Progress Pill */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950/60 border border-brand-500/30 text-xs text-brand-200">
                  <Sparkles className="w-3.5 h-3.5 text-accent-cyan animate-pulse" />
                  <span>Onboarding : <strong className="text-white font-bold">{progressPercentage}%</strong></span>
                </div>

                {/* User avatar & name */}
                <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-brand-500/40">
                    {currentUser.firstName?.[0] || 'U'}{currentUser.lastName?.[0] || ''}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold text-white leading-tight">
                      {currentUser.firstName} {currentUser.lastName}
                    </span>
                    <span className="text-[10px] text-slate-400 leading-tight truncate max-w-[130px]">
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                {/* Reset Progress Button */}
                <button
                  onClick={resetProgress}
                  title="Réinitialiser l'onboarding pour la démo"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Se déconnecter"
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                Espace Collaborateur
              </div>
            )}
          </div>

        </div>

        {/* Mobile Navigation Row when logged in */}
        {currentUser && (
          <div className="flex md:hidden items-center justify-between overflow-x-auto py-2 gap-1 border-t border-white/5 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md whitespace-nowrap ${
                    isActive
                      ? 'bg-brand-600 text-white font-medium'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
