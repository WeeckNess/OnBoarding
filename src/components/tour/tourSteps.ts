import {
  LayoutDashboard,
  PanelLeft,
  Gauge,
  ListChecks,
  PenTool,
  MapPin,
  BookOpen,
  GraduationCap,
  UserCheck,
  LifeBuoy,
  LucideIcon,
} from 'lucide-react';

export type TourPlacement = 'right' | 'left' | 'top' | 'bottom';

/**
 * Petite démonstration animée jouée par le « curseur fantôme » sur l'étape.
 * Purement visuelle : elle ne modifie jamais les données de l'utilisateur.
 */
export type TourDemo =
  | { kind: 'click'; selector: string }
  | { kind: 'draw'; selector: string }
  | { kind: 'type'; selector: string; words: string[] };

export interface TourStep {
  id: string;
  /** Page sur laquelle l'étape se joue (navigation automatique). */
  route?: string;
  /**
   * Sélecteur(s) de l'élément à mettre en lumière, par ordre de préférence :
   * le premier visible est retenu (utile pour desktop / mobile).
   * Absent = carte centrée.
   */
  target?: string | string[];
  placement?: TourPlacement;
  /** Marge autour de l'élément éclairé (px). */
  padding?: number;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
  demo?: TourDemo;
}

const t = (id: string) => `[data-tour="${id}"]`;

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    route: '/dashboard',
    icon: LayoutDashboard,
    eyebrow: 'Bienvenue',
    title: 'On fait le tour ensemble ?',
    body: 'En moins d’une minute, je te montre où se trouve tout ce dont tu as besoin pour tes 30 premiers jours.',
  },
  {
    id: 'nav',
    route: '/dashboard',
    target: [t('sidebar-nav'), t('mobile-menu')],
    placement: 'right',
    padding: 6,
    icon: PanelLeft,
    eyebrow: 'Navigation',
    title: 'Ton menu',
    body: 'Toutes les rubriques de ton onboarding sont ici, avec des badges qui suivent ta progression en direct.',
  },
  {
    id: 'progress',
    route: '/dashboard',
    target: t('progress'),
    placement: 'bottom',
    icon: Gauge,
    eyebrow: 'Tableau de bord',
    title: 'Ta jauge d’intégration',
    body: 'Elle avance à chaque tâche validée, jalon par jalon : J1, S1, S2, J15 et J30.',
  },
  {
    id: 'tasks',
    route: '/dashboard',
    target: t('priority-tasks'),
    placement: 'right',
    icon: ListChecks,
    eyebrow: 'Tableau de bord',
    title: 'Tes actions du jour',
    body: 'Coche une action dès qu’elle est faite : la jauge et la feuille de route se synchronisent automatiquement.',
    demo: { kind: 'click', selector: t('task-toggle') },
  },
  {
    id: 'contract',
    route: '/contracts',
    target: t('signature-panel'),
    placement: 'left',
    icon: PenTool,
    eyebrow: 'Contrat',
    title: 'Signe ton contrat en ligne',
    body: 'Lis ton CDI et ton accord de confidentialité, puis signe à la souris, au doigt ou au clavier.',
    demo: { kind: 'draw', selector: t('signature-pad') },
  },
  {
    id: 'roadmap',
    route: '/roadmap',
    target: t('roadmap-milestones'),
    placement: 'bottom',
    icon: MapPin,
    eyebrow: 'Feuille de route',
    title: 'Ton programme sur 30 jours',
    body: 'Filtre par phase pour voir exactement ce qui t’attend : de l’accueil du Jour 1 jusqu’au bilan du premier mois.',
    demo: { kind: 'click', selector: `${t('roadmap-milestones')} > button:nth-child(2)` },
  },
  {
    id: 'elearning',
    route: '/elearning',
    target: t('elearning-header'),
    placement: 'bottom',
    icon: GraduationCap,
    eyebrow: 'E-Learning',
    title: 'Apprends à ton rythme',
    body: 'Découvre des vidéos courtes et des quiz pour comprendre Data Insight et les bases du métier.',
  },
  {
    id: 'codex',
    route: '/codex',
    target: t('codex-search'),
    placement: 'bottom',
    padding: 6,
    icon: BookOpen,
    eyebrow: 'Codex',
    title: 'Une question ? Cherche ici',
    body: 'Stack technique, outils, télétravail, mutuelle, tickets resto… la réponse est dans le Codex.',
    demo: { kind: 'type', selector: `${t('codex-search')} input`, words: ['dbt', 'Swile', 'télétravail'] },
  },
  {
    id: 'buddy',
    route: '/buddy',
    target: t('buddy-profile'),
    placement: 'right',
    icon: UserCheck,
    eyebrow: 'Buddy',
    title: 'Ton parrain t’accompagne',
    body: 'Ton buddy répond à toutes tes questions, même les plus simples. Commence par réserver ton café d’accueil.',
    demo: { kind: 'click', selector: t('buddy-coffee') },
  },
  {
    id: 'launcher',
    target: t('tour-launcher'),
    placement: 'top',
    padding: 6,
    icon: LifeBuoy,
    eyebrow: 'C’est tout !',
    title: 'Tu es prêt·e',
    body: 'Tu peux relancer ce guide à tout moment depuis ce bouton. Bonne intégration chez Data Insight !',
  },
];
