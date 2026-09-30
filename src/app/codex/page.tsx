'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useOnboarding } from '@/context/OnboardingContext';
import { 
  BookOpen, 
  Search, 
  Building2, 
  Cpu, 
  Layers, 
  Calendar, 
  Gift, 
  ExternalLink, 
  Tag, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export default function CodexPage() {
  const { codexArticles } = useOnboarding();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredArticles = codexArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    const matchesTitle = article.title.toLowerCase().includes(query);
    const matchesSummary = article.summary.toLowerCase().includes(query);
    const matchesContent = article.content.some(c => c.toLowerCase().includes(query));
    const matchesTags = article.tags.some(t => t.toLowerCase().includes(query));

    return matchesCategory && (matchesTitle || matchesSummary || matchesContent || matchesTags);
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'culture': return <Building2 className="w-5 h-5 text-brand-400" />;
      case 'tech': return <Cpu className="w-5 h-5 text-amber-400" />;
      case 'tools': return <Layers className="w-5 h-5 text-brand-300" />;
      case 'rituals': return <Calendar className="w-5 h-5 text-orange-400" />;
      case 'benefits': return <Gift className="w-5 h-5 text-emerald-400" />;
      default: return <BookOpen className="w-5 h-5 text-brand-400" />;
    }
  };

  return (
    <div className="space-y-8 py-2">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/15 text-brand-300 text-xs font-bold mb-2 border border-brand-500/25">
              <BookOpen className="w-3.5 h-3.5 text-brand-400" />
              <span>Base de connaissances interne</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              Codex & Documentation Data Insight
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Retrouvez ici toutes les informations de l’entreprise : culture, stack technologique, organisation du travail, rituels et avantages salariés.
            </p>
          </div>

          <div data-tour="codex-search" className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Rechercher (dbt, Swile, remote...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-carbon-850 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        {[
          { id: 'all', label: 'Toutes les rubriques' },
          { id: 'culture', label: '🏛️ Culture & Vision' },
          { id: 'tech', label: '⚡ Stack Tech & Data' },
          { id: 'tools', label: '🛠️ Outils & Accès' },
          { id: 'rituals', label: '🗓️ Rituels & Remote' },
          { id: 'benefits', label: '🎁 Avantages & Swile' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl font-bold whitespace-nowrap border transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-brand-500 text-carbon-950 border-brand-400 shadow-md shadow-brand-500/20'
                : 'bg-carbon-850 border-white/5 text-slate-300 hover:bg-carbon-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.length === 0 ? (
          <div className="col-span-2 text-center py-12 glass-panel rounded-3xl border border-white/5 space-y-3">
            <ShieldAlert className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="font-bold text-white">Aucun article ne correspond à votre recherche "{searchQuery}"</p>
            <p className="text-xs text-slate-400">Essayez un autre mot-clé ou réinitialisez le filtre de catégorie.</p>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <div
              key={article.id}
              className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-5 flex flex-col justify-between hover:border-brand-500/40 transition-all shadow-lg"
            >
              <div className="space-y-4">
                
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-carbon-850 border border-brand-500/25 flex items-center justify-center">
                      {getCategoryIcon(article.category)}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">{article.title}</h2>
                      <p className="text-xs text-slate-400 mt-0.5">{article.summary}</p>
                    </div>
                  </div>
                </div>

                {/* Content paragraphs / bullets */}
                <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                  {article.content.map((paragraph, idx) => (
                    <p key={idx} className={paragraph.startsWith('•') ? 'pl-2 text-slate-300' : 'text-slate-400'}>
                      {paragraph}
                    </p>
                  ))}
                </div>

              </div>

              {/* Tags & Links Footer */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-carbon-850 text-slate-400 border border-white/5 flex items-center gap-1 font-medium"
                    >
                      <Tag className="w-2.5 h-2.5 text-brand-400" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>

                {article.usefulLinks && article.usefulLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {article.usefulLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-400 hover:text-brand-300 font-bold inline-flex items-center gap-1"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ))
        )}
      </div>

      {/* Partenaire Info Card */}
      <div className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 relative rounded-2xl overflow-hidden shrink-0 ring-1 ring-brand-500/30">
            <Image src="/logo-midi.png" alt="Midi Agency" fill className="object-cover" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-brand-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Accompagnement Midi Agency</span>
            </div>
            <p className="text-xs text-slate-300">
              Ce Codex a été conçu en partenariat avec <strong>Midi Agency</strong> pour digitaliser et simplifier l’intégration des collaborateurs Data Insight.
            </p>
          </div>
        </div>
        <a
          href="https://midiagency.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs px-5 py-2.5 rounded-2xl bg-carbon-850 hover:bg-carbon-800 text-slate-200 border border-white/10 font-bold inline-flex items-center gap-1.5 transition-colors"
        >
          <span>Midi Agency</span>
          <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
        </a>
      </div>

    </div>
  );
}
