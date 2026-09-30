# Validation du portail manager — 28 septembre 2026

Base : `main`, commit `04f73a78154d4b7c029e09e18bcd0d3a657614d6`. Vérifications réalisées localement.

## Vérifications automatisées

- `npm run typecheck` : réussi.
- `npm run build` : réussi, routes manager, collaborateur et API compilées.
- `npm test` : 11 tests réussis (un scénario global et dix sous-scénarios). Le serveur réel et une base SQLite temporaire vérifient les droits, le partage des données, les entrées invalides, l’origine des requêtes, la signature, les écritures concurrentes, le redémarrage, le reset et la révocation de session.
- `git diff --check` : réussi.

## Parcours réalisés dans le navigateur

- Antoine voit Alexandre et Sarah, avec les blocages et demandes de préparation.
- Modification de l’accueil et du buddy, création d’une demande de matériel, enregistrement confirmé.
- Un navigateur collaborateur distinct retrouve le message d’accueil, le nouveau buddy et le matériel ajouté.
- Le collaborateur signale un blocage et partage un feedback. Le manager les retrouve, puis enregistre une réponse au blocage.
- Navigation mobile à 390 × 844 : contenu sur toute la largeur sans débordement horizontal, ouverture/fermeture du menu, fermeture avec Échap et retour du focus au bouton d’ouverture.
- Formulaire mobile : dialogue natif, contenu défilant, fermeture avec Échap.
- Aucune erreur JavaScript remontée par la session de vérification finale.

## Reprise visuelle — 28 septembre 2026

Reprise sur la base `bbe7007`, à partir du parcours collaborateur de WeeckNess. La sidebar Arc est désormais commune aux deux rôles. Le tableau de bord, les fiches, les statuts, les formulaires et les étapes reprennent ses couleurs, proportions et surfaces.

- Captures réelles inspectées à 1440 × 1080 et 390 × 844 : tableau de bord, préparation, tâches par étape, suivi et formulaires. Les captures ont été réalisées avec Playwright sur le Chrome de test installé, après le blocage du mécanisme de capture agent-browser lors du lot précédent. Aucune dépendance de test visuel ajoutée au projet.
- Vérification des recherches et états vides, cinq rubriques de la fiche, filtres par responsable et ouverture des étapes.
- Enregistrement du formulaire d’accueil vérifié dans le navigateur.
- Sidebar commune : navigation par rôle, mode compact à 80 px, dépliage, menu mobile et retour du focus après Échap.
- Formulaire mobile contenu dans le viewport ; page sans débordement horizontal (390 px).
- Parcours collaborateur revérifié après mutualisation de la navigation : connexion, dashboard, liens, progression et accès au suivi.
- Aucune erreur JavaScript dans la session de contrôle finale.

Les captures et scripts de revue temporaires ne sont pas inclus dans Git.

## Limites assumées

Comptes fictifs sans authentification de production ; traitement manuel du matériel et des accès ; notifications internes ; signature simulée ; aucun portail RH/IT dans ce lot. Le serveur de démonstration utilise un disque persistant local. Voir le README pour les contraintes d’hébergement et le scénario de démonstration.
