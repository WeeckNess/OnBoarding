# Data Insight · Parcours d’intégration

Application Next.js réunissant l’espace salarié et le portail manager. Le répertoire RH Lucca reste fictif. Le serveur utilise Supabase lorsque `SUPABASE_URL` et `SUPABASE_SECRET_KEY` sont définies dans `.env.local`; sans ces clés, il utilise SQLite localement. Le projet Supabase lié contient déjà le schéma et les 50 dossiers fictifs.

## Lancer l’application

Pré-requis : Node.js 22.13+ ou 24+.

```sh
npm ci
npm run dev
```

Ouvrir http://localhost:3000 et saisir manuellement l’adresse email associée à une fiche. Les profils managers sont listés dans [la documentation technique](docs/INTEGRATION_LUCCA_SUPABASE.md). Les adresses des 50 salariés sont générées dans `src/lib/integrations/lucca/mockDirectory.ts` et utilisent le domaine réservé `.example`.

Sans identifiants Supabase, au premier accès, l’annuaire simulé charge 50 personnes et crée leurs dossiers d’intégration dans `.data/onboarding-supabase-mock.sqlite`. Les dossiers restent partagés entre les espaces manager et salarié. La base précédente, `.data/onboarding.sqlite`, n’est pas modifiée.

## Parcours

- Les managers voient les dossiers qui leur sont affectés, préparent l’accueil, les accès, le matériel, les tâches, les objectifs et les points d’étape.
- Les salariés retrouvent la préparation, leur feuille de route, les documents, les ressources et les échanges avec leur manager.
- La projection de l’annuaire part de 50 personnes et vise 70 personnes au 31 décembre 2027.

## Stockage et intégration simulée

`src/lib/integrations/lucca/mockDirectory.ts` fournit les fiches RH fictives. Le serveur les importe une fois dans `lucca_mock_people`, puis initialise les dossiers manager/salarié correspondants. Le parcours est conservé dans SQLite en mode local.

Le schéma Supabase et les 50 fiches initiales sont dans `supabase/migrations/` et `supabase/seed.sql`. Le schéma et le jeu initial ont été appliqués au projet Supabase lié. L’adaptateur serveur persiste les dossiers, les signatures et les sessions dans cette base. La clé secrète reste côté serveur et n’est jamais exposée au navigateur. Pour une nouvelle instance, renseigner `.env.local`, puis appliquer la migration et le seed selon les étapes de la documentation technique.

Les choix d’architecture, le mapping des champs, le modèle de synchronisation et les étapes nécessaires pour remplacer le faux connecteur figurent dans [docs/INTEGRATION_LUCCA_SUPABASE.md](docs/INTEGRATION_LUCCA_SUPABASE.md).

## Portails

- `/manager` : vue manager filtrée par équipe.
- `/manager/[id]` : préparation et suivi d’un salarié.
- `/arrival` : informations d’arrivée préparées par le manager.
- `/dashboard`, `/roadmap`, `/contracts`, `/buddy`, `/codex`, `/elearning` : espace salarié.

Les mutations sont validées et autorisées côté serveur. Les sessions utilisent un cookie HttpOnly et expirent après huit heures. À la première connexion, chaque compte doit créer un mot de passe de 12 caractères minimum ; les mots de passe sont hachés avec scrypt et un sel aléatoire. Ils peuvent être modifiés dans « Compte & sécurité ». Les emails `.example` restent des identifiants fictifs non vérifiés : le premier choix du mot de passe ne remplace pas une invitation ou une vérification d’adresse pour un déploiement réel. La signature est une simulation sans prestataire externe.
