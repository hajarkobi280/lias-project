# Gestion du laboratoire LIAS

Application Java 21 / Spring Boot 3.3 et React / Vite, complétée à partir de `GestionLaboratoireLIAS.pdf`.

## Démarrage avec vos comptes MySQL

Pour les membres ajoutés dans MySQL Workbench (`lias_db`), démarrer le backend depuis `lias-backend` avec :

```powershell
mvn spring-boot:run "-Dspring-boot.run.profiles=default"
```

Puis, depuis `lias-frontend`, lancer `npm run dev -- --port 5173` et ouvrir http://localhost:5173.
Arrêter le backend précédent avant d'en lancer un autre sur le port 8080.
Le profil `demo` utilise une autre base (H2) : les comptes insérés dans MySQL y sont absents, ce qui provoque « Email introuvable ».

## Démonstration facultative sans MySQL

Prérequis : Java 21, Maven et Node.js (les dépendances frontend sont déjà présentes dans ce dossier).

Terminal 1, depuis `lias-backend` :

```powershell
mvn spring-boot:run "-Dspring-boot.run.profiles=demo"
```

Terminal 2, depuis `lias-frontend` :

```powershell
npm install
npm run dev -- --port 5173
```

Ouvrir http://localhost:5173. Le backend écoute sur le port 8080.
La base de démonstration H2 est persistée dans `lias-backend/data/lias.mv.db` ; elle est indépendante de MySQL.
Les comptes ci-dessous sont créés uniquement au premier démarrage du profil `demo` avec une base vide.

| Compte | Rôle / statut |
| --- | --- |
| admin@lias.demo | Administration technique |
| directeur@lias.demo | Directeur avec mandat actif |
| membre@lias.demo | Membre permanent |
| doctorant@lias.demo | Doctorant |
| associe@lias.demo | Membre associé |

Mot de passe des comptes de démonstration : `LiasDemo2026!`.
Ne pas utiliser le profil `demo` pour un déploiement réel.

## Utiliser la base MySQL existante

Le profil par défaut conserve la configuration MySQL du projet. Aucun effacement de données n'est effectué.
Les tables supplémentaires sont créées par Hibernate (`ddl-auto=update`). Faire une sauvegarde de la base avant une migration réelle.

Variables disponibles : `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`.
Exemple dans le terminal du backend :

```powershell
$env:DB_URL='jdbc:mysql://localhost:3306/lias_db?useSSL=false&serverTimezone=UTC'
$env:DB_USER='root'
$env:DB_PASSWORD='votre-mot-de-passe'
$env:JWT_SECRET='une-cle-privee-aleatoire-d-au-moins-32-caracteres'
mvn spring-boot:run
```

L'interface utilise `http://localhost:8080/api` par défaut ; `VITE_API_URL` permet de modifier cette adresse.
Les origines CORS autorisées sont configurées dans `SecurityConfig` et `CorsConfig` (localhost:5173).

## Parcours livrés

- **Public** : présentation et date de création, équipes, événements et publications ; dépôt d'une candidature avec CV PDF, motivation, établissement, laboratoire d'origine et mot de passe choisi ; suivi privé de la décision par code à conserver.
- **Membres** : annuaire et publications par membre, profil personnel modifiable, mot de passe modifiable, dates métier, photo par URL, retraite, départ et réactivation. Les champs d'un profil ne sont plus effacés lorsqu'ils sont absents d'une requête.
- **Confidentialité** : aucun mot de passe chiffré exposé ; date de naissance accessible seulement dans son propre profil. Le gel/départ bloque aussi les jetons déjà émis.
- **Affiliations** : périodes de présence indépendantes des changements de statut, fermeture au départ et nouvelle période au retour.
- **Mandats** : attribution, date de fin optionnelle, clôture et historique ; vérification du mandat actif à chaque requête. La date de fin est exclusive : un mandat finissant aujourd'hui ne donne plus de droits aujourd'hui.
- **Adhésions** : consultation et décision exclusivement par un directeur en mandat ; acceptation avec création de compte et historiques ; notification et suivi des refus ; protection contre le retraitement.
- **Activités** : équipes, événements et éditions, organisateurs multiples, inscription des participants, publications, conventions et activités associées, réunions/ordres du jour/PV ; archivage sans suppression et versions consultables.
- **Documents** : import, téléchargement authentifié, classement par date/événement/type, recherche et conservation des versions précédentes. Formats : PDF, DOCX, XLSX, PNG, JPEG, TXT ; 10 Mo maximum. CV : PDF.
- **Publications** : dépôt par permanents, associés et doctorants ; filtres par auteur (recherche), année et équipe. Les associés/doctorants ne modifient que leurs propres publications et leur identité d'auteur est contrôlée côté serveur.
- **Matériel** : arrivages, stock disponible, attribution transactionnelle sans dépassement, réception, bénéficiaires et membres sans réception ; demandes et décision de direction historisées.
- **Collaboration** : fils généraux, par équipe ou événement, recherche globale, notifications personnelles et calendrier.
- **Rapports** : synthèse et détail d'une année au choix, CSV et impression/PDF. Chaque jour à 02:00 (Africa/Casablanca), le serveur archive les années terminées manquantes, y compris l'année précédente sans activité. Cela permet le rattrapage après une interruption au 1er janvier. Le serveur doit être en fonctionnement à cette heure. Les snapshots existants ne sont pas écrasés ; le rapport à la demande reflète les données actuelles.
- **Administration** : paramètres du laboratoire et date de création, gestion des comptes et responsabilités.

## Droits

| Profil | Accès |
| --- | --- |
| Visiteur | Contenus publics, candidature et suivi par code privé |
| Doctorant | Profil, annuaire, publications et notifications personnelles |
| Associé | Profil, annuaire, équipes, événements, calendrier, publications, notifications |
| Permanent | Modules internes et contributions scientifiques |
| Directeur en mandat | Gestion des membres, mandats, matériel et besoins |
| Directeur en mandat | Décisions d'adhésion |
| Admin | Comptes utilisateurs, configuration des rôles et mandats, paramètres techniques ; aucun droit métier automatique |
| Retraité / ancien | Aucun accès actif ; données conservées |

Les modules masqués sont également protégés côté backend. Les droits métier sont recalculés depuis les mandats, pas seulement depuis le rôle stocké dans le navigateur.

## Vérification

```powershell
# Dans lias-backend
mvn test
# Dans lias-frontend
npm test
npm run lint
npm run build
```

Les tests utilisent une base H2 en mémoire séparée, sans toucher à MySQL. Les 21 tests backend et les 29 tests React passent. Ils couvrent les accès, la confidentialité, les affiliations, les décisions d'adhésion et la connexion du candidat, le stock, les documents, les versions et les rapports.

## Données et limites de reprise

Les anciennes données sont conservées. Le journal de versions commence à l'installation : il ne peut pas reconstituer les anciennes modifications qui n'avaient jamais été enregistrées. Une ancienne candidature sans mot de passe choisi doit être renouvelée ; aucun mot de passe commun n'est attribué automatiquement. Les comptes de direction existants doivent disposer d'un mandat valide ; l'administrateur peut l'attribuer depuis Gouvernance.

La date de création officielle n'étant pas donnée dans le cahier des charges, elle reste à renseigner par l'administrateur.
Les notifications sont internes à l'application ; le suivi privé permet au candidat refusé de consulter sa décision sans compte. Aucun envoi d'email externe n'est configuré.
Les liens métier complémentaires (auteur, édition, partenaire, ordre du jour, etc.) utilisent le champ JSON `metadata` du modèle existant, pour conserver la compatibilité des données.

Le détail des vérifications de notifications, de navigation et de déconnexion est disponible dans `TESTS.md`.

La séparation détaillée entre administrateur et directeur est décrite dans `DROITS_ACCES.md` (cahier des charges §5.1 et §5.2).

Les pièces jointes des publications non archivées sont téléchargeables sans connexion depuis le portail public. Cet accès ne concerne ni les CV de candidature, ni les documents internes, ni les anciennes versions non référencées par une publication actuelle.
