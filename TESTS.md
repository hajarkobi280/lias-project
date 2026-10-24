# Vérifications — notifications et déconnexion

Résultat : 50 tests automatiques réussis (29 React + 21 backend), lint et compilation frontend réussis.

## Défaut reproduit

Ouvrir Notifications déclenchait `TypeError: destroy is not a function`. Le callback fourni à `useEffect` renvoyait la promesse du chargement HTTP. React tentait de l'utiliser comme fonction de nettoyage, provoquant une page blanche en StrictMode et lors de la sortie du module.

## Corrections

- Effet React avec une véritable fonction de nettoyage et annulation du chargement au départ.
- États explicites de chargement, absence de notifications et erreur réseau ; bouton Actualiser.
- Lecture d'une notification avec état de sauvegarde et mise à jour du compteur.
- Accès Notifications dans le menu pour tous les comptes actifs.
- Bouton Déconnexion directement visible dans la barre supérieure, sur ordinateur et mobile.
- Navigation mobile compacte ; barre supérieure conservée pendant le défilement.
- Une réponse `/auth/me` tardive ne restaure plus la session après déconnexion.
- Une erreur 401 d'une ancienne session ne déconnecte plus un compte connecté entre-temps.
- Un stockage local de session invalide revient à la connexion au lieu de faire planter l'application.

## Tests automatiques

Depuis `lias-frontend` : `npm test`, `npm run lint`, `npm run build`.
Depuis `lias-backend` : `mvn test`.

Tests React : montage/démontage StrictMode, notification vide, erreur et nouvelle tentative, passage à lue, compteur, erreur de sauvegarde, annulation de requête, navigation des modules, déconnexion depuis Notifications, rechargement après sortie, réponse de session tardive, expiration, stockage invalide, droits doctorant, réponses HTTP 401.

Tests backend : suite existante plus création d'un événement, génération de notification et persistance de sa lecture. Base H2 de test isolée.

## Vérifications dans le navigateur avec la base de démonstration

- Reproduction de la page blanche avant correction.
- Création d'un événement de démonstration puis réception de sa notification.
- Passage de la notification de NOUVELLE à LUE et compteur à zéro.
- Sortie depuis Notifications vers la connexion, rechargement et reconnexion.
- Navigation des 14 modules disponibles pour le directeur sans page blanche.
- Notification encore non lue sur le compte doctorant : lecture propre à chaque compte.
- Contrôle à 390 × 844 : bouton Déconnexion visible et fonctionnel.

Capture : `tests-visuels/notifications-mobile.png`.

Ces contrôles ne constituent pas une validation de la configuration MySQL personnelle ni de tous les cas possibles de données métier.
