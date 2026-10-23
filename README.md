# OnBoarding · Data Insight

### Un parcours d’intégration partagé entre le salarié, son manager et les RH.

**Next.js · React · TypeScript · Supabase / SQLite**

L’arrivée dans une entreprise implique beaucoup de petites étapes : préparer le matériel, transmettre les informations utiles, organiser les premières semaines et suivre les points d’étape. OnBoarding réunit ce parcours dans une application, avec un espace adapté à chaque rôle.

Le projet présente un **cas d’usage RH complet**, depuis la préparation de l’arrivée jusqu’au suivi de l’intégration. L’annuaire et les personnes utilisés dans la démonstration sont fictifs ; l’intégration Lucca est simulée.

## Le projet en un regard

| Pour qui ? | Ce que l’application apporte |
| --- | --- |
| Salarié | Retrouver ses informations d’arrivée, sa feuille de route, ses documents et ses ressources. |
| Manager | Préparer l’accueil, le matériel, les accès, les tâches et les objectifs, puis suivre les dossiers de son équipe. |
| RH / administration | Consulter les espaces de suivi et les dossiers d’intégration à partir d’un annuaire commun. |

## Les parcours

**Avant l’arrivée** → préparer l’accueil et les informations pratiques.  
**Premiers jours** → retrouver sa feuille de route, son buddy et ses ressources.  
**Pendant l’intégration** → suivre les tâches, les objectifs et les échanges avec le manager.

- Portail manager et fiches de suivi par salarié.
- Espace salarié : arrivée, tableau de bord, roadmap, documents, buddy, ressources et e-learning.
- Stockage partagé entre les portails, avec une version locale SQLite et un adaptateur Supabase.
- Sessions par cookie HttpOnly, mots de passe hachés avec scrypt et vérification des mutations côté serveur.
- Un annuaire de **50 profils fictifs** pour explorer les différents rôles.

## Choix techniques

L’application utilise **Next.js App Router** pour réunir les écrans et les routes serveur. **TypeScript** structure les données et les échanges entre les parcours.

Sans configuration externe, le serveur initialise une base **SQLite locale**. Lorsque les variables Supabase sont renseignées, les dossiers et les sessions sont persistés dans **Supabase**. Les migrations et le jeu initial sont versionnés dans `supabase/`.

Le connecteur Lucca est volontairement simulé : cela permet de présenter le parcours sans utiliser un annuaire d’entreprise réel.

## Essayer en local

Prérequis : **Node.js 22.13+ ou 24+**, npm et Git.

```sh
git clone https://github.com/WeeckNess/OnBoarding.git
cd OnBoarding
npm ci
npm run dev
```

Ouvrir **http://localhost:3000**. Pour l’essai local, ne pas renseigner de variables Supabase : l’annuaire fictif et la base SQLite sont initialisés au premier accès.

L’écran de connexion propose en développement des accès aux profils de démonstration salarié, manager et RH. Au premier accès d’un compte, définir son mot de passe. Les adresses `.example` sont fictives.

Pour utiliser une instance Supabase indépendante, partir de `.env.example` et suivre le [guide d’intégration](docs/INTEGRATION_LUCCA_SUPABASE.md). Les clés serveur restent dans `.env.local`, jamais dans le navigateur ni dans Git.

## Repères dans le dépôt

```text
src/app/                 Écrans, portails et routes serveur
src/lib/                 Données et intégrations
supabase/migrations/     Évolution du schéma
supabase/seed.sql        Annuaire fictif initial
tests/                   Tests des parcours
docs/                    Documentation technique
```

## Vérifications disponibles

```sh
npm run typecheck
npm test
npm run build
```

## Périmètre et limites

Ce dépôt présente un **prototype fonctionnel de parcours RH**. Il ne se connecte pas à une instance Lucca réelle. La signature de documents est simulée, sans prestataire externe.

Le premier choix d’un mot de passe associé à une adresse fictive ne remplace pas un parcours d’invitation et de vérification d’identité pour une entreprise réelle. Un déploiement avec de vrais salariés demande une configuration et une validation adaptées.

## En savoir plus

- [Guide de développement et détail des portails](DEVELOPMENT.md)
- [Architecture, modèle de données et intégration Lucca / Supabase](docs/INTEGRATION_LUCCA_SUPABASE.md)

Projet présenté dans le portfolio de **Thom Legros — [WeeckNess](https://github.com/WeeckNess)**.
