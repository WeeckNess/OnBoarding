'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import SignatureCanvas from '@/components/SignatureCanvas';
import confetti from 'canvas-confetti';
import { 
  FileCheck2, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  ArrowRight, 
  Building2, 
  Calendar, 
  Award, 
  FileText,
  Lock,
  Sparkles
} from 'lucide-react';

export default function ContractsPage() {
  const router = useRouter();
  const { currentUser, signContract } = useOnboarding();
  const [signatureData, setSignatureData] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'contract' | 'nda'>('contract');

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00E5FF', '#136BFC', '#10B981', '#F59E0B']
    });
  };

  const handleSignatureSave = (dataUrl: string) => {
    setSignatureData(dataUrl);
  };

  const handleConfirmSignature = async () => {
    if (!signatureData && !currentUser?.contractSigned) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    signContract(signatureData || currentUser?.signatureImage || '');
    setIsSubmitting(false);
    triggerConfetti();
  };

  const handlePrintDownload = () => {
    window.print();
  };

  const employeeName = currentUser 
    ? `${currentUser.firstName} ${currentUser.lastName}` 
    : 'Alexandre Moreau';
  const employeeEmail = currentUser?.email || 'alexandre.moreau@datainsight.io';
  const employeeRole = currentUser?.role || 'Data Engineer Junior';
  const employeeDept = currentUser?.department || 'Data Platform';

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-2">
              <FileCheck2 className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Contrats & Documents Administratifs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Contrat de Travail à Durée Indéterminée (CDI)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Société <strong>Data Insight SAS</strong> • Salarié : <span className="text-accent-cyan font-semibold">{employeeName}</span>
            </p>
          </div>

          {currentUser?.contractSigned && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Contrat Signé & Archivé</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('contract')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'contract'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>1. Contrat de Travail Principal (CDI)</span>
        </button>
        <button
          onClick={() => setActiveTab('nda')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'nda'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>2. Accord de Confidentialité & Sécurité Données (NDA)</span>
        </button>
      </div>

      {/* Document Reader Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: The Legal Text Document */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6 text-xs text-slate-300 leading-relaxed font-sans max-h-[620px] overflow-y-auto">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white text-xs">
                DI
              </div>
              <span className="font-bold text-white text-sm">DATA INSIGHT SAS</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Réf: DI-CDI-2026-89</span>
          </div>

          {activeTab === 'contract' ? (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-center py-2 border-y border-white/5 bg-slate-950/40">
                CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE
              </h2>

              <p>
                <strong>ENTRE LES SOUSSIGNÉS :</strong><br />
                La Société <strong>DATA INSIGHT SAS</strong>, au capital de 100 000 €, immatriculée au RCS de Paris sous le n° 892 145 982, dont le siège social est situé au 42 rue de la Paix, 75008 Paris, représentée par M. Antoine LAURENT en qualité de Head of Data,<br />
                <em>Ci-après désignée « La Société » ou « L'Employeur »,</em>
              </p>

              <p>
                <strong>ET :</strong><br />
                M./Mme <strong>{employeeName}</strong>, demeurant et joignable à l’adresse électronique {employeeEmail},<br />
                <em>Ci-après désigné(e) « Le Salarié »,</em>
              </p>

              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-white">ARTICLE 1 – ENGAGEMENT & FONCTIONS</h3>
                <p>
                  Le Salarié est engagé à compter du <strong>1er Octobre 2026</strong> en qualité de <strong>{employeeRole}</strong> au sein du département <strong>{employeeDept}</strong>.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white">ARTICLE 2 – LIEU DE TRAVAIL & TÉLÉTRAVAIL</h3>
                <p>
                  Le lieu habituel de travail est fixé aux locaux de la Société à Paris. Conformément à la charte de télétravail Data Insight, le Salarié bénéficie d’un régime hybride avec jusqu’à 3 jours de télétravail par semaine et d'un forfait équipement.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white">ARTICLE 3 – RÉMUNÉRATION & AVANTAGES</h3>
                <p>
                  En contrepartie de ses fonctions, le Salarié percevra une rémunération brute annuelle forfaitaire complétée par un bonus sur objectifs, la prise en charge de la mutuelle Alan Blue à 100%, les titres-restaurant Swile (11,50€/jour) et le Pass Navigo / forfait mobilité durable.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white">ARTICLE 4 – MATÉRIEL INFORMATIQUE</h3>
                <p>
                  La Société met à disposition du Salarié un MacBook Pro de dernière génération ainsi que les licences logicielles professionnelles nécessaires à l’exécution de sa mission.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-center py-2 border-y border-white/5 bg-slate-950/40">
                ACCORD DE CONFIDENTIALITÉ & GOUVERNANCE DATA
              </h2>
              <p>
                Dans le cadre de ses fonctions, le Salarié aura accès à des données sensibles, bases analytiques et codes sources exclusifs appartenant à Data Insight et à ses clients.
              </p>
              <div className="space-y-2">
                <h3 className="font-bold text-white">CLAUSE 1 – SECRET PROFESSIONNEL</h3>
                <p>
                  Le Salarié s’engage à conserver la plus stricte confidentialité sur toutes les informations techniques, commerciales, financières ou stratégiques dont il aura connaissance.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-white">CLAUSE 2 – RGPD & SÉCURITÉ DU CODE</h3>
                <p>
                  Toutes les requêtes SQL, scripts Python et pipelines dbt doivent respecter la conformité RGPD et les protocoles de chiffrement définis par l’équipe sécurité.
                </p>
              </div>
            </div>
          )}

          {/* Signed Status preview inside document */}
          {(currentUser?.contractSigned || signatureData) && (
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between bg-slate-950/60 p-4 rounded-xl">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Signé électroniquement par :</span>
                <span className="font-bold text-accent-cyan text-sm">{employeeName}</span>
                <span className="text-[10px] text-slate-500 block">Horodatage sécurisé Data Insight</span>
              </div>
              <div className="w-32 h-12 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 overflow-hidden">
                {currentUser?.signatureImage || signatureData ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentUser?.signatureImage || signatureData}
                    alt="Signature"
                    className="max-h-full max-w-full object-contain filter invert brightness-200"
                  />
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Signature Pad & Validation Actions */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="glass-panel p-6 rounded-3xl space-y-5 border border-white/10 shadow-xl">
            <div className="flex items-center gap-2 text-brand-300">
              <ShieldCheck className="w-5 h-5 text-accent-cyan" />
              <h2 className="text-base font-bold text-white">Apposer votre signature</h2>
            </div>
            
            {currentUser?.contractSigned ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Contrat validé et signé !</span>
                  </div>
                  <p>
                    Vos documents ont été transmis à l’équipe RH de Data Insight. Vous pouvez télécharger une copie d’archive ou passer directement à votre feuille de route.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handlePrintDownload}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-white/10 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger / Imprimer le contrat</span>
                  </button>

                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-600 to-accent-cyan text-white font-bold text-sm shadow-lg shadow-brand-500/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Accéder à mon Dashboard Onboarding</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <SignatureCanvas
                  onSave={handleSignatureSave}
                  initialSignature={currentUser?.signatureImage}
                />

                <button
                  type="button"
                  disabled={!signatureData || isSubmitting}
                  onClick={handleConfirmSignature}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Horodatage et enregistrement...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Confirmer et Signer mon Contrat</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Next steps widget */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-3 text-xs">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent-cyan" />
              <span>Prochaines étapes après la signature</span>
            </h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center text-[10px] shrink-0 font-bold">1</span>
                <span>Accès complet au tableau de bord salarié</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center text-[10px] shrink-0 font-bold">2</span>
                <span>Feuille de route J+1 à J+30 avec checklist des tâches</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center text-[10px] shrink-0 font-bold">3</span>
                <span>Prise de contact avec votre parrain (Buddy)</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
