# 🚀 Plateforme d'Onboarding — Data Insight × Midi Agency

Plateforme web d'onboarding collaborateur nouvelle génération conçue par l'équipe **Midi Agency** pour l'entreprise cliente **Data Insight**.

---

## 🌟 Fonctionnalités Clés (Vue Salarié)

### 1. 📋 Identification & Vérification RH (`/`)
- Questionnaire d'accueil : Prénom, Nom, Email.
- Rapprochement en temps réel avec la base de données de l'entreprise.
- Génération d'une carte d'embarquement personnalisée (*Boarding Pass*).
- Profils de démonstration intégrés pour tester en 1 clic.

### 2. ✍️ Contrats & Signature Électronique (`/contracts`)
- Consultation intégrale du Contrat de Travail à Durée Indéterminée (CDI) et de l'Accord de Confidentialité & RGPD (NDA).
- Pad de signature électronique interactif (dessin à la souris/doigt ou saisie typographique).
- Horodatage et certification numérique.
- Possibilité d'imprimer / télécharger le document signé.
- Déclenchement de confettis de bienvenue à la signature.

### 3. 📊 Dashboard Central (`/dashboard`)
- Jauge de progression globale de l'onboarding (0 à 100%).
- Suivi des jalons (J1, S1, S2, J15, J30).
- Checklist des actions prioritaires du jour avec cases à cocher en direct.
- Widget de contact direct avec le Parrain (Buddy).

### 4. 🗺️ Roadmap Interactive J+1 à 30 (`/roadmap`)
- Découpage précis jour par jour et par jalons :
  - **Jour 1 : Immersion & Welcome** (MacBook, accès, café d'accueil).
  - **Semaine 1 (J2-J5) : Fondations & Découverte** (CLI, dbt, Snowflake, pair programming).
  - **Semaine 2 (J6-J10) : Première Contribution** (Premier ticket Jira, première PR en prod).
  - **J15 (J11-J20) : Montée en puissance & Rapport d'étonnement**.
  - **J30 (J21-J30) : Pleine autonomie & Clôture d'onboarding**.
- Filtres par phase ou par thématique (Tech, Administratif, Équipe, Projet, Culture).
- Sauvegarde locale en temps réel.

### 5. 📚 Codex & Documentation Interne (`/codex`)
- Moteur de recherche instantané.
- 5 catégories documentaires : Culture & Vision, Stack Tech & Data, Outils & Accès, Rituels & Remote, Avantages & Swile.
- Tags et liens d'accès direct.

### 6. 🤝 Mon Buddy / Parrain (`/buddy`)
- Fiche de présentation complète du parrain attribué (Camille Reynaud / Julien Mercier).
- Liens directs Slack, Email, et réservation de créneau café via Calendly / Cal.com.
- Calendrier des synchronisations régulières (J1, J3, S1, J15, J30).
- Guide pratique des questions à poser à son Buddy.

---

## 🛠️ Stack Technique

- **Framework** : [Next.js 15](https://nextjs.org/) (App Router, TypeScript, React 19)
- **Styling** : [Tailwind CSS](https://tailwindcss.com/) avec Glassmorphism & palette moderne Data Insight
- **Iconographie** : [Lucide Icons](https://lucide.dev/)
- **Effets** : [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Persistance** : React Context + `localStorage`

---

## 🚀 Démarrage Rapide

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Compiler pour la production
npm run build
```

Le serveur sera accessible sur [http://localhost:3000](http://localhost:3000).
