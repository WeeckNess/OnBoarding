# DataInsight × Midi Agency — Onboarding MVP

Portail manager et parcours collaborateur, construits avec Next.js 15, React 19, TypeScript et Tailwind. Le MVP couvre la préparation avant arrivée, J1, les premières semaines et le suivi J+30.

## Lancer le projet

Utiliser Node 22.13+ (branche 22) ou Node 24+. SQLite est fourni par Node (`node:sqlite`) : aucun serveur de base de données ni abonnement externe n’est nécessaire.

```sh
npm ci
npm run dev
```

Ouvrir http://localhost:3000 et choisir un profil. Les données sont initialisées au premier accès, puis conservées dans `.data/onboarding.sqlite` (ignoré par Git). Les profils existants du prototype sont fictifs ; dates, métiers et contenu de la documentation sont des données de démonstration.

| Profil | Accès | Dossiers visibles |
| --- | --- | --- |
| Antoine Laurent — `antoine.laurent@datainsight.io` | Manager | Alexandre Moreau, Sarah Benali |
| Claire Vasseur — `claire.vasseur@datainsight.io` | Manager | Thomas Legros |
| Alexandre Moreau — `alexandre.moreau@datainsight.io` | Collaborateur | Son propre parcours |
| Thomas Legros — `thomas.legros@datainsight.io` | Collaborateur | Son propre parcours |
| Sarah Benali — `sarah.benali@datainsight.io` | Collaborateur | Son propre parcours |

## Parcours manager

- `/manager` : arrivées de l’équipe, filtres, recherche, préparation de J1 et alertes de blocage/retard. Une checklist complétée ne signifie pas que tous les accès sont prêts.
- `/manager/[id]` : accueil, buddy et message de bienvenue ; demandes structurées de matériel et d’accès ; attribution et adaptation des tâches ; objectifs ; état des documents ; points J1/J+7/J+30 et comptes rendus ; feedback ; résolution des blocages ; rappels dans l’application ; historique des actions.
- Les demandes ont un responsable, une échéance, un statut et un indicateur « indispensable à J1 ». Leur traitement est suivi manuellement : aucune commande fournisseur ni création de compte IT n’est exécutée.
- Les RH restent responsables de créer les arrivées et des documents administratifs. Le portail RH et un portail IT ne sont pas implémentés dans ce lot.

## Parcours collaborateur et partage

Le dashboard, la roadmap, les documents, le Codex, le buddy et le tutoriel existants sont conservés. `/arrival` présente les informations préparées par le manager, les objectifs et comptes rendus, et permet de signaler un blocage ou partager son ressenti. Le choix du buddy est commun aux deux espaces.

Une tâche apparaît dans la roadmap de son collaborateur dès qu’elle lui est attribuée. Seul le responsable d’une tâche peut la terminer. Les signatures de démonstration mettent à jour le statut des documents côté manager ; cocher une tâche ne peut pas signer un document. Le manager ne reçoit pas l’image de signature.

Les mutations sont enregistrées immédiatement. Les autres sessions rechargent leurs données toutes les 10 secondes lorsqu’elles sont visibles, au retour sur la fenêtre et via « Actualiser ». Le bouton Reset de l’entrant réinitialise uniquement sa progression et sa signature, en conservant la préparation manager et les autres profils. L’ancien localStorage métier n’est pas importé : il ne permettait pas d’isoler correctement les profils. Il ne sert plus qu’au tutoriel.

## Architecture et limites du MVP

Les vues passent par un contexte React commun, qui consomme les routes API Next exécutées côté Node. SQLite contient un dossier versionné par collaborateur et les sessions. Chaque mutation est validée et autorisée côté serveur, appliquée avec un contrôle de version atomique et ajoutée à l’historique du dossier. Une écriture concurrente reçoit une erreur 409 ; le formulaire conserve la saisie et invite à rouvrir la dernière version plutôt que d’écraser une modification.

Les sessions utilisent des jetons aléatoires stockés sous forme de hash en base et un cookie HttpOnly/SameSite valable 8 heures. Les écritures JSON vérifient l’origine de la requête. Les managers n’accèdent qu’à leurs dossiers ; les collaborateurs à leur propre dossier.

**L’identification est volontairement une sélection de profils de démonstration sans mot de passe.** Ce n’est pas une authentification de production : toute personne qui accède au prototype peut choisir un profil proposé. Ne pas y saisir de données personnelles réelles. `DEMO_ACCESS_ENABLED=false` désactive ces accès. Il faudra connecter une authentification réelle et un annuaire de rôles avant tout usage réel.

La signature contrat/NDA est une simulation commune aux deux documents, sans certification ni service de signature externe. Les rappels sont internes à l’application, sans email ni Slack. L’historique porte sur les modifications, pas sur tous les accès. Sauvegardes, politique de conservation, hébergement, validation RGPD et intégrations restent à traiter pour un déploiement réel.

### Hébergement

SQLite requiert un **serveur Node avec un disque persistant**, en instance unique pour ce MVP. Le stockage local ne convient pas aux fonctions serverless éphémères ni à plusieurs instances avec des disques séparés. Ne pas déployer ce projet tel quel sur un hébergement de ce type ; remplacer l’adaptateur par une base partagée si nécessaire.

Variables facultatives :

- `ONBOARDING_DB_PATH` : chemin du fichier SQLite (défaut `.data/onboarding.sqlite`).
- `APP_ORIGIN` : origine publique exacte, ex. `https://demo.example.com`, pour le contrôle des écritures derrière un reverse proxy. Sans cette variable, l’origine est reconstruite à partir du protocole de la requête et de son en-tête Host.
- `DEMO_ACCESS_ENABLED=false` : ferme l’accès aux profils de démo et invalide leur utilisation.

Le module natif SQLite est encore signalé expérimental par les versions Node utilisées ici. Références : [Node SQLite](https://nodejs.org/api/sqlite.html), [cookies Next.js](https://nextjs.org/docs/app/api-reference/functions/cookies).

## Vérifier

```sh
npm run typecheck
npm run build
npm test
```

Ne pas lancer `next dev` pendant `next build`/`npm test` dans le même checkout : ils partagent `.next`. Les tests lancent un serveur Next de production sur un port libre et une base temporaire supprimée à la fin. Ils vérifient les droits, les entrées invalides, la protection d’origine, le partage entre profils, la signature, les conflits d’écriture, le reset, la déconnexion et la persistance après redémarrage.

## Scénario de démonstration

1. Ouvrir Antoine, puis le dossier Alexandre. Organiser l’accueil et compléter le périmètre de la demande VPN ; ajouter une tâche collaborateur et un objectif.
2. Ouvrir Alexandre dans un autre navigateur ou une fenêtre privée. Consulter « Mon arrivée & mon suivi » et la roadmap ; terminer la tâche, signaler un blocage et partager un ressenti.
3. Revenir à Antoine, actualiser et consulter « Suivi & feedback ». Apporter une solution au blocage et renseigner un point d’étape ; Alexandre retrouve la réponse et le compte rendu.
4. Vérifier que Claire ne voit que Thomas et que les documents d’Alexandre sont suivis en lecture seule par son manager.
