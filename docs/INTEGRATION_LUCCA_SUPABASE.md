# Architecture technique — Lucca simulé et stockage Supabase

## Portée actuelle

Le projet présente le comportement attendu d’un connecteur RH sans contacter Lucca. Le répertoire Lucca est une source TypeScript locale et immuable. Le stockage applicatif utilise Supabase quand `SUPABASE_URL` et `SUPABASE_SECRET_KEY` sont renseignées ; SQLite sert de repli local si les identifiants Supabase sont absents.

Le schéma Supabase est fourni dans `supabase/migrations/202609300001_onboarding_workspace.sql`, avec son jeu initial dans `supabase/seed.sql`. L’adaptateur serveur est implémenté dans `src/lib/server/`. L’URL et la clé secrète sont lues depuis `.env.local`, jamais depuis le navigateur. Le schéma et le jeu initial ont été appliqués au projet Supabase lié : les routes y lisent et y écrivent. Pour une nouvelle instance, appliquer la migration avant de démarrer l’application. `SUPABASE_DB_URL` sert uniquement au déploiement des migrations et n’est pas utilisé par l’application.

## Jeu de données RH fictif

`src/lib/integrations/lucca/mockDirectory.ts` génère exactement 50 fiches :

- 40 salariés déjà en poste et 10 arrivées planifiées ;
- cinq départements et cinq managers, avec dix dossiers associés à chaque manager ;
- les dates de début sont créées par rapport à la date d’initialisation locale ;
- une cible d’effectif de 70 personnes au 31 décembre 2027, soit une hausse scénarisée de 20 personnes ;
- des identifiants source `LUCCA-MOCK-001` à `LUCCA-MOCK-050` et des adresses en `.example`, réservées aux exemples.

Tous les noms et dossiers sont fictifs. Les champs personnels sensibles du dossier RH (adresse privée, date de naissance, coordonnées bancaires, rémunération) ne sont pas simulés ni nécessaires à l’onboarding.

### Comptes managers pour l’accès manuel

Il n’y a plus de sélection préremplie dans l’interface. Pour ouvrir manuellement un espace manager, saisir l’une de ces adresses :

| Manager | Adresse |
| --- | --- |
| Antoine Laurent | `antoine.laurent@datainsight.example` |
| Claire Vasseur | `claire.vasseur@datainsight.example` |
| Julien Mercier | `julien.mercier@datainsight.example` |
| Inès Bernard | `ines.bernard@datainsight.example` |
| Camille Robert | `camille.robert@datainsight.example` |

Les emails salariés suivent le format `prenom.nom.NN@datainsight.example`, les accents sont translittérés et `NN` correspond au numéro de fiche sur deux chiffres. Exemple : `lea.martin.01@datainsight.example`.

## Flux de données dans le mode local

```text
mockDirectory.ts
       │  fiche RH source (identité, poste, équipe, manager, arrivée)
       ▼
lucca_mock_people ── import initial idempotent ──► onboardings
                                                      │
                          ┌───────────────────────────┴──────────────────────────┐
                          ▼                                                      ▼
                    Portail manager                                      Espace salarié
                          │                                                      │
                          └── mutations validées par l’API Next ─────────────────┘
```

Sans configuration Supabase, au premier accès serveur, `store.ts` crée `.data/onboarding-supabase-mock.sqlite` et ses tables :

- `lucca_mock_people` : snapshot de la fiche RH simulée, identifiant source et statut ;
- `onboardings` : workflow partagé (accueil, matériel, accès, documents, tâches, objectifs, rendez-vous, blocages, feedback et historique), avec version pour détecter les écritures concurrentes ;
- `sessions` : hash des jetons de session à durée limitée ;
- `workspace_settings` : projection d’effectif.
- `app_sessions` : sessions hashées côté Supabase (la base locale conserve la table `sessions`).

L’import utilise `INSERT OR IGNORE` : redémarrer l’app ne réinitialise pas les parcours modifiés. Les 50 employés sont répartis entre les cinq managers. Une session manager ne voit que ses dix dossiers ; une session salariée ne voit que son dossier.

Le fichier `.data/onboarding.sqlite` créé par l’ancien prototype n’est ni supprimé ni réutilisé. Le nouveau chemin est `.data/onboarding-supabase-mock.sqlite`. `ONBOARDING_DB_PATH` permet de choisir explicitement un autre fichier local.

## Modèle Supabase préparé

| Table | Rôle |
| --- | --- |
| `managers` | Comptes managers et périmètres d’équipe fictifs |
| `employees` | Identité et données de rattachement importées du répertoire RH |
| `roadmap_templates` | Modèle de tâches J1 à J30 copié dans les dossiers salariés |
| `onboarding_records` | État du parcours associé à un salarié, avec collections JSONB et numéro de version |
| `employee_signatures` | Données de signature isolées des dossiers visibles par les managers |
| `workspace_settings` | Cible d’effectif et paramètres du scénario |
| `integration_runs` | Journal d’exécution du connecteur simulé |
| `app_sessions` | Sessions simulées, stockées sous forme de hash |

Pour lancer un Supabase local avec la CLI, la configuration et le chemin de seed sont déjà déclarés dans `supabase/config.toml` :

```sh
supabase start
supabase db reset
```

`db reset` détruit puis recrée la base locale gérée par Supabase CLI et rejoue les migrations et la seed. Il ne faut pas l’utiliser sur une base contenant des données à garder. Définir ensuite `SUPABASE_URL` et `SUPABASE_SECRET_KEY` dans `.env.local` pour que l’application utilise ce stockage.

Pour appliquer la migration et charger les 50 dossiers dans le projet distant, copier la chaîne URI de base dans `SUPABASE_DB_URL` dans `.env.local`, puis lancer :

```sh
npm run db:push
```

La commande applique les migrations en attente et exécute la seed sans réinitialiser la base. Ne pas lancer cette seed dans un projet de production. L’application conserve les contrôles d’accès de rôle et de périmètre côté serveur.

Les tables ont RLS activé et ne sont pas accordées à `anon` ou `authenticated`. L’accès aux données passe par les routes serveur et `SUPABASE_SECRET_KEY`; cette clé ne doit jamais utiliser le préfixe `NEXT_PUBLIC_`. L’identification par email et les sessions restent simulées : Supabase Auth/SSO devra les remplacer avant d’exposer de vraies données.

## Correspondance des champs RH

| Source simulée | Modèle salarié / usage |
| --- | --- |
| `sourcePersonId` | `employees.lucca_person_id` ; clé stable pour faire un upsert sans doublon |
| `id`, prénom, nom, email | `employees.id`, `first_name`, `last_name`, `email` ; identité affichée dans les deux portails |
| `role`, `department` | Poste et équipe utilisés dans les listes, filtres et dossiers manager |
| `managerId`, `managerName` | Rattachement de sécurité et attribution des dossiers |
| `startDate`, `employmentStatus` | Date du premier jour et distinction poste actif / arrivée prévue |
| `legalEntity`, `office` | Entité employeur et lieu d’accueil |
| `contractSigned`, tâches, demandes, points | État de workflow généré par l’app ; ces éléments ne proviennent pas du snapshot RH |

## Remplacement futur par une vraie liaison

1. Confirmer le domaine Lucca du client, les champs réellement utilisés et les comptes à importer.
2. Créer un compte d’application OAuth ou une clé avec les droits minimaux de lecture sur les seules sections RH nécessaires. Tester sur une base sandbox. La version de l’API devra être choisie selon la couverture des endpoints collaborateurs disponible sur leur tenant.
3. Remplacer `LUCCA_MOCK_DIRECTORY` par un adaptateur serveur qui récupère les personnes, suit la pagination, transforme les champs et fait un upsert sur `sourcePersonId`. Le navigateur ne doit jamais appeler Lucca directement.
4. Garder Lucca comme source de vérité pour l’identité, le poste, le service, le manager et la date d’arrivée. À la première synchronisation, créer le dossier d’onboarding s’il manque ; aux suivantes, mettre à jour les seules données d’identité et ne jamais écraser les tâches, signatures ou notes déjà saisies.
5. Relier le même repository aux tables Supabase via un client serveur et remplacer le store SQLite. Authentifier les personnes via Supabase Auth/SSO, mapper leur identité à un salarié ou manager, et conserver les autorisations de périmètre côté serveur.
6. Ne renvoyer éventuellement vers Lucca que quelques statuts validés, dans une section dédiée du Socle RH avec permission d’écriture limitée. La version actuelle n’effectue aucun retour vers Lucca.

Lucca documente une API publique versionnée avec OAuth 2.0, pagination et limites de débit ; les API historiques restent plus complètes sur certaines ressources. Les permissions des clés peuvent être limitées à une section du dossier RH. Liens : [référence API Lucca](https://developers.luccasoftware.com/api-reference/latest/introduction), [guide Lucca de création et permissions des clés API](https://support.lucca.fr/hc/fr/articles/115000084851-G%C3%A9n%C3%A9rer-une-cl%C3%A9-API), [exemple de données échangées avec le Socle RH](https://support.lucca.fr/hc/fr/articles/10900571140252-Teelt-solution-d-onboarding-et-d-offboarding-des-collaborateurs).

## Limites du scénario

- Les mots de passe sont gérés côté serveur et stockés sous forme de hash scrypt salé. Les comptes d’exemple ne vérifient pas la propriété de l’adresse email lors du premier choix du mot de passe ; utiliser une invitation ou Supabase Auth avec vérification d’adresse avant d’exposer des données réelles.
- Le snapshot Lucca est local, fabriqué au démarrage du module, et ne reçoit aucun changement externe.
- SQLite et la migration Supabase sont deux supports distincts en l’état : l’app utilise SQLite aujourd’hui, la migration décrit le stockage cible.
- Le seed Supabase charge les 50 dossiers et leur modèle de tâches ; l’application ne lit pas ces tables sans adaptateur et identifiants de projet.
- La projection de 70 personnes est un objectif de scénario, pas une prévision RH calculée à partir de recrutements réels.
