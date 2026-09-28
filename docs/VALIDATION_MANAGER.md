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

Les captures d’écran automatiques ont bloqué dans l’outil de navigateur ; la vérification responsive repose sur les interactions, l’arbre d’accessibilité et les dimensions DOM, pas sur une revue d’images.

## Limites assumées

Comptes fictifs sans authentification de production ; traitement manuel du matériel et des accès ; notifications internes ; signature simulée ; aucun portail RH/IT dans ce lot. Le serveur de démonstration utilise un disque persistant local. Voir le README pour les contraintes d’hébergement et le scénario de démonstration.
