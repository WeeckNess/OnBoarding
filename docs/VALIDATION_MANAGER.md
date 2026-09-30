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

## Répartition des responsabilités — 30 septembre 2026

Base : `main`, commit `f27ac4a`. Les contrôles de rôle sont appliqués au serveur, avec des espaces de traitement RH et IT utilisant la sidebar et les styles existants.

- Le manager définit les besoins IT, l’accueil, les objectifs et les tâches d’intégration. Il ne peut pas confirmer une demande d’un autre service, se la réattribuer ou modifier une tâche administrative.
- L’IT confirme seulement ses demandes. La disponibilité est datée et attribuée au profil du service ; une modification du besoin demande une nouvelle validation.
- Les RH pilotent les tâches administratives et traitent leurs demandes. Le bilan du premier mois reste dans le parcours d’équipe.
- Les réponses API IT excluent les signatures, documents, objectifs, comptes rendus et feedback. Les RH reçoivent le périmètre administratif sans les notes d’accompagnement.
- Le dashboard collaborateur distingue la pré-arrivée, J1 et J+n. Les priorités suivent les échéances ; la signature est placée avant J1 et les mentions du buddy suivent sa sélection.
- Les rappels automatiques sont calculés au chargement, dédupliqués et retirés après réalisation. Leur lecture est persistante sans changement de version du dossier.
- Reset masqué et refusé par défaut, activation explicite par `DEMO_RESET_ENABLED=true`, avec confirmation dans l’interface.

Validation automatisée : typecheck et build réussis ; 19 tests réussis, couvrant également les rôles RH/IT, les revalidations, les rappels et la mise à jour des bases existantes sans perte de préparation ni de feedback.

Scénario navigateur réalisé sur une base temporaire indépendante : création du besoin par le manager, confirmation IT, modification du besoin et retour à traiter ; création et réalisation d’une tâche RH ; parcours collaborateur avec rappels ; redirections entre les espaces. Captures inspectées sur ordinateur et mobile (390 px sans débordement pour IT, RH et collaborateur), aucune erreur JavaScript. Les captures utilisent le Chrome de test déjà installé via Playwright, en complément des vérifications agent-browser ; aucune nouvelle dépendance n’est ajoutée au projet.

Les scénarios de test ne modifient pas les dossiers du serveur local. Les données locales existantes reçoivent seulement les mises à jour de structure et de libellés nécessaires.

## Limites assumées à l’issue de cette passe

Comptes fictifs sans authentification de production ; traitement du matériel et des accès confirmé par une personne sans intégration fournisseur/IT ; rappels internes calculés lorsque l’application est consultée ; signature simulée. Les espaces RH/IT couvrent le traitement, pas encore la création d’une arrivée ou l’import des documents. Le serveur de démonstration utilise un disque persistant local. Voir le README pour les contraintes d’hébergement et le scénario de démonstration.
