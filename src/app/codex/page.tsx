'use client';

import React, { useState } from 'react';
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
      case 'culture': return <Building2 className="w-5 h-5 text-accent-cyan" />;
      case 'tech': return <Cpu className="w-5 h-5 text-brand-400" />;
      case 'tools': return <Layers className="w-5 h-5 text-purple-400" />;
      case 'rituals': return <Calendar className="w-5 h-5 text-amber-400" />;
      case 'benefits': return <Gift className="w-5 h-5 text-emerald-400" />;
      default: return <BookOpen className="w-5 h-5 text-brand-400" />;
    }
  };

  return (
    <div className="space-y-8 py-4">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Base de connaissances interne</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              Codex & Documentation Data Insight
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Retrouvez ici toutes les informations de l’entreprise : culture, stack technologique, organisation du travail, rituels et avantages salariés.
            </p>
          </div>

          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Rechercher (dbt, Swile, remote...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-colors"
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
            className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap border transition-all ${
              selectedCategory === cat.id
                ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-white/5'
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
              className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-5 flex flex-col justify-between hover:border-purple-500/40 transition-all shadow-lg"
            >
              <div className="space-y-4">
                
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center">
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
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-white/5 flex items-center gap-1"
                    >
                      <Tag className="w-2.5 h-2.5" />
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
                        className="text-xs text-brand-400 hover:text-brand-300 font-medium inline-flex items-center gap-1"
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
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-brand-400 font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Accompagnement Midi Agency</span>
          </div>
          <p className="text-xs text-slate-300">
            Ce Codex a été conçu en partenariat avec <strong>Midi Agency</strong> pour digitaliser et simplifier l’intégration des collaborateurs Data Insight.
          </p>
        </div>
        <a
          href="https://midiagency.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-semibold inline-flex items-center gap-1.5 transition-colors"
        >
          <span>En savoir plus sur Midi Agency</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

    </div>
  );
}
