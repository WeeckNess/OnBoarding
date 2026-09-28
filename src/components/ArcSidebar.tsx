'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { 
  LayoutDashboard, 
  MapPin, 
  BookOpen, 
  UserCheck, 
  FileCheck2, 
  LogOut, 
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  CheckCircle2,
  LucideIcon,
  Sparkles
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  status?: 'signed' | 'pending';
  accent?: string;
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

interface ArcSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function ArcSidebar({ isCollapsed, onToggleCollapse }: ArcSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    currentUser, 
    logoutUser, 
    progressPercentage, 
    resetProgress, 
    completedTaskIds,
    tasks 
  } = useOnboarding();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [resetToast, setResetToast] = useState(false);

  // Dropdown accordions state (Arc spaces / folders)
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    onboarding: true,
    roadmap: true,
    resources: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLogout = () => {
    logoutUser();
    router.push('/');
  };

  const handleReset = () => {
    resetProgress();
    setResetToast(true);
    setTimeout(() => setResetToast(false), 2000);
  };

  if (!currentUser) {
    return null;
  }

  const navGroups: NavGroup[] = [
    {
      id: 'onboarding',
      title: 'Mon Embarquement',
      items: [
        { 
          href: '/dashboard', 
          label: 'Tableau de bord', 
          icon: LayoutDashboard,
          badge: `${progressPercentage}%`
        },
        { 
          href: '/contracts', 
          label: 'Contrat & Signature', 
          icon: FileCheck2,
          status: currentUser?.contractSigned ? 'signed' : 'pending'
        },
      ]
    },
    {
      id: 'roadmap',
      title: 'Parcours J+1 à 30',
      items: [
        { 
          href: '/roadmap', 
          label: 'Feuille de route 30J', 
          icon: MapPin,
          badge: `${completedTaskIds.length}/${tasks.length}`
        },
      ]
    },
    {
      id: 'resources',
      title: 'Ressources & Équipe',
      items: [
        { 
          href: '/buddy', 
          label: 'Mon Buddy / Parrain', 
          icon: UserCheck,
          accent: 'gold'
        },
        { 
          href: '/codex', 
          label: 'Codex & Documentation', 
          icon: BookOpen,
          accent: 'sand'
        },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Top Bar with Hamburger */}
      <div className="md:hidden sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-xl bg-carbon-850 text-slate-200 border border-white/10"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 relative rounded-lg overflow-hidden ring-1 ring-brand-500/30">
            <Image src="/logo-midi.png" alt="Midi Agency" fill className="object-cover" />
          </div>
          <span className="text-sm font-bold text-white">Data Insight</span>
        </div>

        <div className="text-xs px-2.5 py-1 rounded-full bg-brand-500/15 text-brand-300 font-semibold border border-brand-500/20">
          {progressPercentage}%
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container (Arc Style Midi Agency) */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out flex flex-col justify-between ${
          isCollapsed ? 'w-20 items-center' : 'w-72'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } bg-[#141518]/95 backdrop-blur-2xl border-r border-white/10 text-slate-300 shadow-2xl`}
      >
        {/* Top Header */}
        <div className={`w-full p-4 border-b border-white/5 ${isCollapsed ? 'flex flex-col items-center gap-3' : 'space-y-4'}`}>
          
          {isCollapsed ? (
            /* Clean Collapsed Header: Centered Logo + Toggle Button */
            <div className="flex flex-col items-center gap-3">
              <Link
                href="/dashboard"
                className="w-10 h-10 relative rounded-2xl overflow-hidden shadow-lg shadow-brand-500/20 ring-2 ring-brand-500/40 hover:scale-110 transition-transform"
                title="Data Insight Onboarding"
              >
                <Image src="/logo-midi.png" alt="Midi Agency" fill className="object-cover" />
              </Link>

              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-brand-400 hover:text-white border border-white/5 transition-all cursor-pointer shadow-sm hover:scale-105"
                title="Déplier la barre latérale"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Expanded Header: Logo + Title + Collapse Button */
            <>
              <div className="flex items-center justify-between">
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-3 overflow-hidden group"
                >
                  <div className="w-9 h-9 shrink-0 relative rounded-xl overflow-hidden shadow-md shadow-brand-500/20 ring-1 ring-brand-500/40 group-hover:scale-105 transition-transform">
                    <Image src="/logo-midi.png" alt="Midi Agency" fill className="object-cover" />
                  </div>
                  <div className="flex flex-col truncate">
                    <div className="flex items-center gap-1.5 font-bold text-white tracking-tight text-sm">
                      <span className="truncate">Data Insight</span>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-brand-500/15 text-brand-300 border border-brand-500/30 shrink-0">
                        Onboarding
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate">
                      par <strong className="text-brand-400 font-medium">Midi Agency</strong>
                    </span>
                  </div>
                </Link>

                <button
                  onClick={onToggleCollapse}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-brand-300 hover:bg-white/5 transition-colors cursor-pointer"
                  title="Replier le menu"
                >
                  <PanelLeftClose className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Arc Space Capsule */}
              <div className="p-3 rounded-2xl bg-carbon-850/90 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Espace Salarié
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-300 font-semibold border border-brand-500/25">
                    {progressPercentage}% complété
                  </span>
                </div>
                
                <div className="w-full bg-carbon-900 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 h-full rounded-full transition-all duration-300 shadow-sm shadow-brand-500/30"
                    style={{ width: `${Math.max(progressPercentage, 5)}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation Section with Dropdown Accordions */}
        <div className={`flex-1 overflow-y-auto w-full p-3 space-y-4 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          
          {navGroups.map((group) => {
            const isOpen = openSections[group.id] ?? true;

            return (
              <div key={group.id} className={`w-full space-y-1 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                {/* Group Dropdown Header */}
                {!isCollapsed ? (
                  <button
                    onClick={() => toggleSection(group.id)}
                    className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-brand-300 transition-colors cursor-pointer"
                  >
                    <span>{group.title}</span>
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>
                ) : (
                  <div className="w-8 h-px bg-white/10 my-1 mx-auto" />
                )}

                {/* Items in this group */}
                {(isOpen || isCollapsed) && (
                  <div className={`space-y-1.5 ${isCollapsed ? 'flex flex-col items-center w-full' : 'w-full'}`}>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileOpen(false)}
                          title={item.label}
                          className={`flex items-center rounded-2xl text-xs font-medium transition-all group ${
                            isCollapsed
                              ? `w-12 h-12 justify-center ${
                                  isActive
                                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-carbon-950 font-bold shadow-md shadow-brand-500/25 scale-105'
                                    : 'text-slate-300 hover:text-white hover:bg-carbon-850'
                                }`
                              : `gap-3 px-3.5 py-2.5 w-full ${
                                  isActive
                                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-carbon-950 font-bold shadow-md shadow-brand-500/20'
                                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                                }`
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                            isActive ? 'text-carbon-950' : 'text-slate-400 group-hover:text-brand-400'
                          }`} />

                          {!isCollapsed && (
                            <div className="flex-1 flex items-center justify-between truncate">
                              <span className="truncate">{item.label}</span>

                              {/* Badges / statuses */}
                              {item.badge && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                  isActive ? 'bg-carbon-950/20 text-carbon-950 font-bold' : 'bg-carbon-800 text-slate-400 border border-white/5'
                                }`}>
                                  {item.badge}
                                </span>
                              )}

                              {item.status === 'signed' && (
                                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-carbon-950' : 'text-emerald-400'}`} />
                              )}
                              {item.status === 'pending' && (
                                <span className="w-2 h-2 rounded-full bg-brand-400 shrink-0 animate-pulse" />
                              )}
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Quick Codex search shortcut */}
          {!isCollapsed && (
            <div className="pt-2">
              <Link
                href="/codex"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-carbon-850/60 hover:bg-carbon-800 border border-white/5 text-xs text-slate-400 hover:text-brand-300 transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">Rechercher dans le Codex...</span>
              </Link>
            </div>
          )}

        </div>

        {/* Footer: User Profile & Actions */}
        <div className={`p-3 border-t border-white/5 space-y-2 bg-[#101114] w-full ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          
          {resetToast && (
            <div className="p-2 rounded-xl bg-brand-500/20 border border-brand-500/40 text-brand-300 text-[11px] font-bold text-center animate-in fade-in">
              ✨ Onboarding réinitialisé !
            </div>
          )}

          <div className="space-y-2 w-full">
            <div className={`flex items-center p-1.5 rounded-xl hover:bg-white/5 transition-colors ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div 
                className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-carbon-950 text-xs font-black ring-2 ring-brand-500/40"
                title={`${currentUser.firstName} ${currentUser.lastName} (${currentUser.role})`}
              >
                {currentUser.firstName?.[0] || 'U'}{currentUser.lastName?.[0] || ''}
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate leading-tight">
                    {currentUser.firstName} {currentUser.lastName}
                  </p>
                  <p className="text-[10px] text-brand-400/80 truncate leading-tight mt-0.5 font-medium">
                    {currentUser.role}
                  </p>
                </div>
              )}
            </div>

            {!isCollapsed ? (
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={handleReset}
                  title="Réinitialiser l'onboarding pour la démo"
                  className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-[11px] font-bold text-slate-300 hover:text-brand-300 border border-white/5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-brand-400" />
                  <span>Reset</span>
                </button>

                <button
                  onClick={handleLogout}
                  title="Déconnexion"
                  className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-[11px] font-bold text-red-300 border border-red-500/20 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Quitter</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 items-center pt-1">
                <button
                  onClick={handleReset}
                  title="Réinitialiser l'onboarding"
                  className="p-2.5 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-brand-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={handleLogout}
                  title="Déconnexion"
                  className="p-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

      </aside>
    </>
  );
}
