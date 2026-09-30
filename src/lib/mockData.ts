import { Employee, RoadmapMilestone, RoadmapTask, BuddyInfo, CodexArticle } from '@/types';

/** Tâche validée uniquement par la signature électronique du contrat. */
export const CONTRACT_TASK_ID = 'task-j1-1';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-01',
    firstName: 'Alexandre',
    lastName: 'Moreau',
    email: 'alexandre.moreau@datainsight.io',
    role: 'Data Engineer Junior',
    department: 'Data Platform',
    startDate: '2026-10-01',
    contractSigned: false,
    buddyId: 'buddy-camille',
    managerName: 'Antoine Laurent (Head of Data)',
    completedTaskIds: [],
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'emp-02',
    firstName: 'Thomas',
    lastName: 'Legros',
    email: 'thomas.legros@datainsight.io',
    role: 'Full Stack & Data Developer',
    department: 'Data Applications',
    startDate: '2026-10-01',
    contractSigned: false,
    buddyId: 'buddy-camille',
    managerName: 'Claire Vasseur (VP Engineering)',
    completedTaskIds: [],
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'emp-03',
    firstName: 'Sarah',
    lastName: 'Benali',
    email: 'sarah.benali@datainsight.io',
    role: 'Analytics Engineer',
    department: 'Data Analytics',
    startDate: '2026-10-05',
    contractSigned: false,
    buddyId: 'buddy-julien',
    managerName: 'Antoine Laurent (Head of Data)',
    completedTaskIds: [],
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  }
];

export const BUDDIES_DATA: Record<string, BuddyInfo> = {
  'buddy-camille': {
    id: 'buddy-camille',
    name: 'Camille Reynaud',
    role: 'Senior Data Engineer & Team Lead',
    department: 'Data Platform',
    email: 'camille.reynaud@datainsight.io',
    slackHandle: '@camille.data',
    phone: '+33 6 42 18 90 23',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    bio: 'Chez Data Insight depuis 3 ans ! Passionnée par les architectures temps réel, dbt, Snowflake et le bon café de spécialité. Je suis là pour que tes premières semaines se passent comme sur des roulettes.',
    hobbies: ['Trail & Randonnée', 'Café filtre', 'Open Source Data', 'Jeux de société'],
    seniority: '3 ans chez Data Insight',
    coffeeAvailability: 'Tous les jours entre 9h30 et 10h00, ou l’aprèm vers 16h',
    meetingLink: 'https://cal.com/camille-datainsight/welcome-coffee',
    welcomeMessage: 'Bienvenue chez Data Insight ! Pas de stress pour les premiers jours, je suis ton point de contact n°1 pour toutes tes questions, même les plus basiques. On prend un café dès le Jour 1 ! ☕',
    syncRituals: [
      {
        period: 'Jour 1 (Matin)',
        title: 'Café d’accueil & Tour des locaux / Slack',
        description: 'Prise de contact informelle, tour des collègues présents et check rapide de tes accès.'
      },
      {
        period: 'Jour 3 (14h00)',
        title: 'Session Pair Programming / Découverte du repo',
        description: 'Clonage de l’environnement, premier pipeline dbt exécuté ensemble et explications de l’archi.'
      },
      {
        period: 'Fin Semaine 1 (Vendredi 16h)',
        title: 'Débrief 1ère Semaine & Q&A',
        description: 'Point détendu sur ton ressenti, déblocage des points durs et préparation de la Semaine 2.'
      },
      {
        period: 'Jour 15 (Mi-parcours)',
        title: 'Bilan d’étonnement & Feedback',
        description: 'Partage de tes premières impressions fraîches sur nos process et nos outils.'
      },
      {
        period: 'Jour 30 (Fin Onboarding)',
        title: 'Célébration & Rétro Onboarding',
        description: 'Validation de ton autonomie, passage de témoin et pot d’intégration.'
      }
    ]
  },
  'buddy-julien': {
    id: 'buddy-julien',
    name: 'Julien Mercier',
    role: 'Lead Analytics Engineer',
    department: 'Data Analytics',
    email: 'julien.mercier@datainsight.io',
    slackHandle: '@julien.mercier',
    phone: '+33 6 78 92 11 04',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    bio: 'Fan de modélisation dimensionnelle et d’automatisation. Mon objectif : faire en sorte que tu te sentes chez toi dès la première heure !',
    hobbies: ['Cyclisme', 'Guitare', 'Visualisation de données'],
    seniority: '2 ans et demi chez Data Insight',
    coffeeAvailability: 'Disponible 9h-10h ou 14h-15h',
    meetingLink: 'https://cal.com/julien-datainsight/onboarding',
    welcomeMessage: 'Salut et bienvenue dans l’aventure ! Hâte de collaborer avec toi sur nos modèles analytics.',
    syncRituals: [
      {
        period: 'Jour 1',
        title: 'Accueil & Setup environnement',
        description: 'Configuration du poste et intégration aux canaux Slack métiers.'
      },
      {
        period: 'Jour 7',
        title: 'Revue de première requête & pipeline',
        description: 'Validation des conventions SQL et tests d’intégrité des tables.'
      }
    ]
  }
};

export const MILESTONES: RoadmapMilestone[] = [
  {
    id: 'prearrival',
    title: 'Pré-arrivée : Préparer le premier jour',
    subtitle: 'Garder le contact avant J1',
    daysRange: 'Avant l’arrivée',
    description: 'Informations pratiques, documents et préparation des premiers échanges.',
    iconName: 'Sparkles'
  },
  {
    id: 'j1',
    title: 'Jour 1 : Immersion & Welcome',
    subtitle: 'Bienvenue dans l’équipe !',
    daysRange: 'Jour 1',
    description: 'Prise en main du poste de travail, signature des contrats, rencontre avec ton Buddy et premier café.',
    iconName: 'Sparkles'
  },
  {
    id: 's1',
    title: 'Semaine 1 : Fondations & Découverte',
    subtitle: 'Comprendre l’écosystème Data Insight',
    daysRange: 'Jours 2 à 5',
    description: 'Configuration des accès (GitHub, AWS, Snowflake), découverte de la stack et 1ère revue de code.',
    iconName: 'Compass'
  },
  {
    id: 's2',
    title: 'Semaine 2 : Première Contribution',
    subtitle: 'Mettre les mains dans la donnée',
    daysRange: 'Jours 6 à 10',
    description: 'Première PR soumise en production, rituels agiles, rencontre avec les équipes produit.',
    iconName: 'GitPullRequest'
  },
  {
    id: 'j15',
    title: 'Semaine 3 & J15 : Montée en Puissance',
    subtitle: 'Rapport d’étonnement & Autonomie',
    daysRange: 'Jours 11 à 20',
    description: 'Prise en charge d’une user story complète, rédaction de ton rapport d’étonnement avec ton manager.',
    iconName: 'TrendingUp'
  },
  {
    id: 'j30',
    title: 'J30 : Clôture Onboarding & Pleine Vitesse',
    subtitle: 'Bilan du 1er mois & Célébration',
    daysRange: 'Jours 21 à 30',
    description: 'Bilan à 30 jours, objectifs du prochain trimestre et célébration de la fin de l’onboarding.',
    iconName: 'Award'
  }
];

export const ROADMAP_TASKS: RoadmapTask[] = [
  // JOUR 1
  {
    id: 'task-j1-1',
    dayNumber: 1,
    milestoneId: 'j1',
    title: 'Vérification et signature électronique du contrat',
    description: 'Consulter ton contrat de travail et l’accord de confidentialité (NDA) puis apposer ta signature numérique.',
    estimatedMinutes: 10,
    category: 'admin',
    actionUrl: '/contracts',
    actionLabel: 'Signer mon contrat'
  },
  {
    id: 'task-j1-2',
    dayNumber: 1,
    milestoneId: 'j1',
    title: 'Déballage & Setup de ton MacBook Pro',
    description: 'Allumer la machine pré-configurée, synchroniser ton compte Google Workspace (@datainsight.io) et 1Password.',
    estimatedMinutes: 30,
    category: 'tech',
    actionUrl: '/codex',
    actionLabel: 'Guide installation IT'
  },
  {
    id: 'task-j1-3',
    dayNumber: 1,
    milestoneId: 'j1',
    title: 'Café d’accueil avec ton buddy',
    description: 'Prendre 20 minutes pour faire connaissance, poser tes questions pratiques et faire le tour du bureau.',
    estimatedMinutes: 20,
    category: 'team',
    actionUrl: '/buddy',
    actionLabel: 'Voir la fiche Buddy'
  },
  {
    id: 'task-j1-4',
    dayNumber: 1,
    milestoneId: 'j1',
    title: 'Présentation sur le canal Slack #welcome-team',
    description: 'Écris un petit message sympa de 3-4 lignes pour dire bonjour à l’ensemble de l’entreprise !',
    estimatedMinutes: 10,
    category: 'culture'
  },
  {
    id: 'task-j1-5',
    dayNumber: 1,
    milestoneId: 'j1',
    title: 'Photo de profil & Badge de sécurité',
    description: 'Passer voir Julie aux RH pour valider ton badge physique et mettre ta photo sur Slack / Notion.',
    estimatedMinutes: 15,
    category: 'admin'
  },

  // SEMAINE 1 (J2 à J5)
  {
    id: 'task-s1-1',
    dayNumber: 2,
    milestoneId: 's1',
    title: 'Configuration de l’environnement Data (CLI, dbt, Python)',
    description: 'Cloner le dépôt principal, lancer le script `./scripts/setup-local.sh` et vérifier la connexion Snowflake staging.',
    estimatedMinutes: 60,
    category: 'tech',
    actionUrl: '/codex',
    actionLabel: 'Doc Stack Data'
  },
  {
    id: 'task-s1-2',
    dayNumber: 3,
    milestoneId: 's1',
    title: 'Lecture du Codex : Vision & Métriques Clés Data Insight',
    description: 'Comprendre notre modèle économique, nos clients B2B et nos indicateurs phares (MRR, Data Freshness SLA).',
    estimatedMinutes: 40,
    category: 'culture',
    actionUrl: '/codex',
    actionLabel: 'Lire le Codex'
  },
  {
    id: 'task-s1-3',
    dayNumber: 4,
    milestoneId: 's1',
    title: 'Pair programming avec ton Buddy sur un modèle dbt',
    description: 'Session d’1h pour observer le workflow de CI/CD, les pull requests templates et les tests automatisés.',
    estimatedMinutes: 60,
    category: 'tech',
    actionUrl: '/buddy',
    actionLabel: 'Contacter mon Buddy'
  },
  {
    id: 'task-s1-4',
    dayNumber: 5,
    milestoneId: 's1',
    title: 'Déjeuner d’équipe du vendredi & 1er Débrief',
    description: 'Partager le repas d’équipe convivial et faire le récapitulatif de ta première semaine.',
    estimatedMinutes: 90,
    category: 'team'
  },

  // SEMAINE 2 (J6 à J10)
  {
    id: 'task-s2-1',
    dayNumber: 6,
    milestoneId: 's2',
    title: 'Attribution de ton premier ticket Jira / Linear',
    description: 'Prendre un ticket d’échauffement ("Good First Issue") validé lors du sprint planning.',
    estimatedMinutes: 30,
    category: 'project'
  },
  {
    id: 'task-s2-2',
    dayNumber: 8,
    milestoneId: 's2',
    title: 'Création et merge de ta 1ère Pull Request',
    description: 'Passage par la code review de 2 pairs, validation de la CI et déploiement en environnement de test.',
    estimatedMinutes: 120,
    category: 'tech'
  },
  {
    id: 'task-s2-3',
    dayNumber: 10,
    milestoneId: 's2',
    title: 'Participation au Sprint Review & Rétrospective',
    description: 'Découvrir la dynamique de livraison agile de l’équipe et la prise de parole collective.',
    estimatedMinutes: 60,
    category: 'team'
  },

  // J15 (J11 à J20)
  {
    id: 'task-j15-1',
    dayNumber: 12,
    milestoneId: 'j15',
    title: 'Rendez-vous 1:1 avec les Leads des équipes partenaires',
    description: 'Échanger avec le Lead Product et le Head of Sales pour comprendre l’utilisation finale de la donnée.',
    estimatedMinutes: 45,
    category: 'team'
  },
  {
    id: 'task-j15-2',
    dayNumber: 15,
    milestoneId: 'j15',
    title: 'Rapport d’étonnement : Remplir la grille d’impressions',
    description: 'Noter ce qui t’a semblé fluide, ce qui t’a surpris et tes suggestions d’amélioration pour Data Insight.',
    estimatedMinutes: 45,
    category: 'culture',
    actionUrl: '/codex',
    actionLabel: 'Template Rapport'
  },
  {
    id: 'task-j15-3',
    dayNumber: 16,
    milestoneId: 'j15',
    title: 'Point Mi-Parcours avec ton Manager (Antoine Laurent)',
    description: 'Discussion bienveillante sur tes 15 premiers jours et alignement sur les objectifs du mois.',
    estimatedMinutes: 45,
    category: 'team'
  },

  // J30 (J21 à J30)
  {
    id: 'task-j30-1',
    dayNumber: 22,
    milestoneId: 'j30',
    title: 'Gestion autonome d’un pipeline de bout en bout',
    description: 'De l’ingestion des données à la modélisation et l’exposition dashboard.',
    estimatedMinutes: 180,
    category: 'project'
  },
  {
    id: 'task-j30-2',
    dayNumber: 28,
    milestoneId: 'j30',
    title: 'Formation continue & Accès au budget learning (1 500€/an)',
    description: 'Choisir tes certifications (Snowflake Pro, AWS Data Specialty, etc.) ou livres tech.',
    estimatedMinutes: 30,
    category: 'culture'
  },
  {
    id: 'task-j30-3',
    dayNumber: 30,
    milestoneId: 'j30',
    title: 'Célébration du 1er Mois & Clôture de l’Onboarding',
    description: 'Point final d’onboarding, validation de la période d’essai initiale et apéro d’équipe ! 🎉',
    estimatedMinutes: 60,
    category: 'admin'
  }
];

export const CODEX_ARTICLES: CodexArticle[] = [
  {
    id: 'culture-1',
    category: 'culture',
    title: 'À Propos de Data Insight & Mission',
    summary: 'Transformer la complexité des flux de données en leviers stratégiques pour les leaders européens.',
    icon: 'Building2',
    tags: ['Mission', 'Valeurs', 'Histoire'],
    content: [
      'Fondée en 2021, Data Insight accompagne plus de 80 scale-ups et grands comptes dans la gouvernance, l’ingénierie et l’exploitation de leurs données stratégiques.',
      'Notre philosophie : « Data with Purpose ». Nous privilégions la simplicité, la clarté et l’impact métier plutôt que la sur-ingénierie.',
      'Nos 4 valeurs fondamentales :',
      '• 💡 Radical Clarity : Nous documentons tout et parlons avec franchise.',
      '• 🚀 Ownership & Autonomie : Chacun a le pouvoir de proposer et de tester.',
      '• 🤝 Humilité & Bienveillance : On réussit en équipe, sans ego.',
      '• 🎯 Impact First : Chaque ligne de code et chaque dashboard doit créer de la valeur concrète.'
    ],
    usefulLinks: [
      { label: 'Site officiel Data Insight', url: 'https://datainsight.io' },
      { label: 'Plateforme Midi Agency (Partenaire Onboarding)', url: 'https://midiagency.fr' }
    ]
  },
  {
    id: 'tech-1',
    category: 'tech',
    title: 'La Stack Technique Data Insight',
    summary: 'Architecture Cloud native moderne axée sur Snowflake, dbt, Python et Apache Kafka.',
    icon: 'Cpu',
    tags: ['Architecture', 'dbt', 'Snowflake', 'Python'],
    content: [
      'Nous opérons une stack moderne et modulaire :',
      '• 📦 Ingestion : Airbyte, Kafka & connecteurs Python serverless (AWS Lambda).',
      '• ❄️ Data Warehouse : Snowflake (multi-cluster, staging/prod ségrégués).',
      '• ⚙️ Transformation : dbt Core orchestré par Prefect / Dagster avec tests stricts.',
      '• 📊 Visualisation & Reverse ETL : Superset, Metabase, Census & Streamlit.',
      '• 💻 Développement : GitHub, GitHub Actions, Docker, Pre-commit hooks et Poetry.'
    ],
    usefulLinks: [
      { label: 'Architecture Blueprint Notion', url: '#' },
      { label: 'Guide Git & Conventions SQL', url: '#' }
    ]
  },
  {
    id: 'tools-1',
    category: 'tools',
    title: 'Outils du Quotidien & Accès',
    summary: 'Tout ce dont tu as besoin pour communiquer, organiser tes journées et coder sereinement.',
    icon: 'Layers',
    tags: ['Slack', 'Notion', 'Google Workspace', '1Password'],
    content: [
      '• 💬 Communication : Slack (les canaux clés : #general, #data-eng, #random, #paris-office, #remote-life).',
      '• 📝 Documentation : Notion est notre source unique de vérité (« Si ce n’est pas écrit dans Notion, ça n’existe pas »).',
      '• 🔐 Sécurité & Mots de passe : 1Password avec le coffre partagé "Data Insight Team".',
      '• 📅 Calendrier & Mails : Google Workspace (@datainsight.io) avec synchronisation Google Meet.',
      '• 💳 Dépenses & Notes de frais : Spendesk (carte bancaire virtuelle mise à disposition).'
    ]
  },
  {
    id: 'rituals-1',
    category: 'rituals',
    title: 'Rituels d’Équipe & Travail Hybride',
    summary: 'Notre rythme hebdomadaire, notre politique remote flexible et les moments de partage.',
    icon: 'Calendar',
    tags: ['Remote', 'Rituels', 'Standup', 'All Hands'],
    content: [
      '• 🗓️ Standup Quotidien (15 min) : À 9h45 en visio ou en présentiel.',
      '• 📢 All-Hands Mensuel : Le premier mardi du mois à 17h, suivi d’un apéro d’équipe.',
      '• ☕ Random Coffee : Tous les mercredis, l’app Slack Donut te connecte avec un collègue au hasard.',
      '• 🏠 Télétravail : Politique flexible 2 à 3 jours de remote par semaine, avec une indemnité mensuelle équipement.',
      '• 🏢 Bureaux : Situés au cœur de Paris (8e arrondissement), terrasse, barista & snacks bio.'
    ]
  },
  {
    id: 'benefits-1',
    category: 'benefits',
    title: 'Avantages, Mutuelle & Vie au Bureau',
    summary: 'Tickets resto Swile, Alan Blue, pass Navigo, budget formation et congés.',
    icon: 'Gift',
    tags: ['Mutuelle', 'Swile', 'Alan', 'Formation'],
    content: [
      '• 🍽️ Titres-restaurant Swile : 11,50€ par jour travaillé (pris en charge à 60% par l’entreprise).',
      '• 🏥 Mutuelle Alan Blue : Prise en charge à 100% pour le collaborateur et ses enfants.',
      '• 🚆 Transports : Remboursement à 100% du Pass Navigo ou Forfait Mobilités Durables (vélo/trottinette).',
      '• 📚 Budget Formation : 1 500 € / an par collaborateur + 2 jours dédiés aux conférences.',
      '• 🏖️ RTT & Vacances : 25 jours de CP + 10 jours de RTT par an.'
    ]
  }
];
