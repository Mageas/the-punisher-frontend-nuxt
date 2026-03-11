# 💀 The Punisher

## 📝 Présentation

**The Punisher** est une interface web (Frontend) dédiée à la gestion disciplinaire en milieu scolaire. Connectée à un système centralisé, elle offre aux professeurs un tableau de bord intuitif pour administrer le comportement de leurs élèves et automatiser l'attribution des sanctions.

---

## 🎯 Product Vision

### 🌟 La Vision

Libérer les professeurs de la complexité administrative en remplaçant les suivis manuels (Excel/Papier) par une interface intelligente et équitable. L'objectif est de permettre à l'enseignant de se concentrer sur sa pédagogie plutôt que sur le calcul comptable des sanctions/bonus.

### 🛑 Le Problème (L'Excel)

La gestion traditionnelle du comportement via Excel pose plusieurs soucis majeurs :
  * **Lourdeur administrative :** Maintenir un tableau à jour est chronophage et fastidieux.
  * **Risque d'erreur :** Oublis de notation, erreurs de calculs dans les formules, ou perte de données.
  * **Subjectivité perçue :** Sans règles claires et automatisées, les élèves peuvent ressentir un sentiment d'injustice ou de favoritisme.

### 💡 La Solution

Une application web simple qui automatise la logique disciplinaire :
  * **Automatisation Backend :** Le professeur configure les règles, et le serveur calcule instantanément si un seuil de punition est atteint.
  * **Centralisation :** Accès direct aux profils élèves et historique sans jongler entre plusieurs fichiers.
  * **Impartialité :** Le système applique strictement les règles définies, garantissant que tous les élèves sont logés à la même enseigne.

---

## 🛠 Stack Technique

### Framework & UI

* **Core :** [Nuxt]() (Vue.js Framework).
* Structure modulaire, Routing automatique, DX optimisée.

* **Composants UI :** [shadcn-vue]().
* Composants réutilisables, accessibles et modernes.

* **Styling :** [Tailwind CSS]().
* Aucune couleur Tailwind hardcodée : toutes les couleurs sont définies via des CSS custom properties dans `app/assets/css/tailwind.css` (`:root` / `.dark`), mappées dans `@theme inline`. Cela permet de créer des thèmes en surchargeant simplement les variables.
* **Langage :** TypeScript (recommandé pour le typage des retours API).

### Communication Backend (API)

* **Base URL :** `http://localhost:8080`
* **Architecture :**
* Le Frontend est un client "léger" (Thin Client).
* Toute la logique métier (calcul des punitions, persistance, auth) est gérée par le Backend.
* Le Frontend consomme les données via `useFetch` / `$fetch`.

### Gestion d'État (State)

* **Pinia :** Gestion du store global (Liste des élèves, Configuration actuelle, Session Professeur, etc...).

---

## 🗺 User Journeys

### 🏁 Phase 1 : L'Initialisation (Onboarding)
*Scénario : Le professeur se connecte pour la toute première fois. La base de données du professeur est vierge.*

1.  **Définition du "Code de Loi" (Pré-requis obligatoire) :**
    * Le professeur se rend dans l'onglet **Configuration**.
    * Il crée ses **Types de Pénalités** (ex: "Bavardage", "Oubli").
    * Il crée ses **Types de Punitions** (ex: "Retenue", "Lignes").
    * *(Optionnel)* Il crée ses **Types de Bonus**.
2.  **Automatisation :**
    * Une fois les types créés, il définit ses **Règles**.
    * *Exemple :* Il configure "Si 3 'Bavardages' (Threshold) -> Alors 1 'Retenue' (Punition)".
3.  **Mise en place de la classe :**
    * Il crée une **Classe** (ex: "3ème B").
    * Il crée manuellement les **Élèves** et les assigne à cette classe.
    * *Résultat :* Le Dashboard est maintenant prêt à être utilisé.

### ⚡ Phase 2 : Le Quotidien (Live & Différé)
*Scénario : En plein cours (Live) ou à la fin de la journée (Différé), le professeur note les comportements.*

1.  **L'Incident/L'Action :**
    * L'élève "Thomas" bavarde ou rend un devoir exceptionnel.
2.  **L'Action Rapide :**
    * Le professeur ouvre le **Dashboard** et filtre sur la classe concernée.
    * Il repère la carte de "Thomas".
    * Il clique sur le bouton **"Ajouter Pénalité"** (ou Bonus).
    * Il sélectionne le motif (ex: "Bavardage").
3.  **La Réponse du Système (Feedback) :**
    * Le système enregistre la pénalité.
    * **Si aucune règle n'est déclenchée :** Le compteur de pénalités de Thomas augmente simplement.
    * **Si une règle est déclenchée (ex: 3ème bavardage) :** Une notification informe le professeur : *"Attention : Seuil atteint. Une punition 'Retenue' a été générée automatiquement"*.
    * Le compteur de "Punitions en attente" de Thomas passe à 1.

### 🛡 Phase 3 : Suivi & Maintenance
*Scénario : Le professeur gère les dettes des élèves et ajuste sa pédagogie.*

1.  **Résolution des Punitions :**
    * Thomas rend sa punition (ou effectue sa retenue).
    * Le professeur va sur le profil de Thomas (ou filtre le Dashboard sur "En attente").
    * Il clique sur **"Marquer comme fait"**. La punition passe en historique (`resolved_at` = Date).
2.  **Points bonus (Bonus) :**
    * Un élève à des points bonus en attente comme il a rendu un devoir optionnel.
    * Le professeur vérifie le solde disponible.
    * Il clique sur **"Consommer"** un bonus spécifique. Le bonus n'est plus utilisable (`used_at` = Date), le professeur ajoute le point sur l'intérrogation de l'élève.
3.  **Ajustement des Règles :**
    * Le professeur trouve qu'une règle est trop sévère.
    * Il va dans **Configuration > Règles**.
    * Il **désactive** la règle temporairement (Switch On/Off) ou modifie le seuil (passe de 3 à 5).

---

## 👤 User Stories

### 1. Dashboard (Tableau de Bord)

En tant que **Professeur**, je veux :
  * **Filtrer par Classe :** Sélectionner une classe spécifique pour voir uniquement les élèves concernés (ou voir "Tous les élèves").
  * **Vue Synthétique :** Voir en un coup d'œil les indicateurs clés pour chaque élève affiché :
    * Nombre de punitions "En attente" (`resolved_at` est NULL).
    * Total des points bonus "Disponibles" (`used_at` est NULL).
  * **Actions Rapides :** Avoir des boutons accessibles directement depuis le tableau pour :
    * Ajouter une pénalité (Bavardage, etc.).
    * Ajouter un bonus.
    * Ajouter une punition.

### 2. Gestion des Élèves (Profil)

En tant que **Professeur**, je veux :
  * **CRUD Élève :** Créer, modifier les infos (Nom/Prénom) ou supprimer un élève.
  * **Import en lot :** Importer des élèves et créer/associer automatiquement leurs classes via un fichier CSV/XLSX lors de l'initialisation.
  * **Consulter l'Historique (Timeline) :** Voir la liste chronologique de tous les événements (Pénalités reçues, Bonus obtenus, Punitions déclenchées).
  * **Gérer les Punitions :**
    * Voir la liste des punitions actives.
    * **Marquer comme résolue :** Cliquer sur un bouton pour valider qu'une punition a été faite (passe `resolved_at` de NULL à DATE).
  * **Gérer les Bonus :**
    * Voir le solde de bonus disponibles.
    * **Consommer un bonus :** Cliquer sur un bouton pour utiliser un bonus (passe `used_at` de NULL à DATE), par exemple pour "acheter" un privilège.
  * **Attributions Manuelles :**
    * Ajouter un point bonus manuel
    * Ajouter une pénalité manuelle (ce qui alimentera l'historique pour les règles auto), avec choix explicite de la classe si l'élève appartient à plusieurs classes et qu'une règle automatique calcule l'échéance au prochain cours.
    * Ajouter une punition manuelle (sans passer par une règle).

### 3. Gestion des Classes

En tant que **Professeur**, je veux :
  * **CRUD Classe :** Créer (`name`, `year`), modifier ou supprimer une classe.
  * **Gestion des effectifs :**
    * Ajouter des élèves existants à une classe (création du lien `StudentClassrooms`).
    * Retirer des élèves d'une classe.

### 4. Configuration (Types)

En tant que **Professeur**, je veux gérer mon référentiel disciplinaire :
  * **Types de Pénalité :** Lister/Créer/Modifier/Supprimer (ex: "Bavardage").
  * **Types de Bonus :** Lister/Créer/Modifier/Supprimer (ex: "Participation").
  * **Types de Punition :** Lister/Créer/Modifier/Supprimer (ex: "Retenue").
  * *Note :* La suppression d'un type entraîne la suppression en cascade des règles associées (géré par le backend).

### 5. Configuration (Règles d'Automatisation)

En tant que **Professeur**, je veux définir la logique automatique ("Loi") :
  * **CRUD Règle :** Créer une règle liant un *Type de Pénalité* à un *Type de Punition*.
  * **Paramétrage fin :**
    * Définir le **Seuil** (`threshold`) : Combien de pénalités pour déclencher ?
    * Définir le **Mode d'échéance** (`due_at_mode`) :
      * *En jours* (`days`) avec `due_at_after_days`.
      * *Au prochain / aux prochains cours* (`next_lessons`) avec `due_at_after_lessons` entre 1 et 5.
    * Choisir le **Mode** de calcul :
      * *Au seuil exact* (`at`).
      * *Tous les X pénalités* (`every`).
      * *À partir de X pénalités* (`after`).
  * **Activation :** Activer ou désactiver une règle (`is_active`) sans la supprimer.

En tant que **Professeur**, je veux pouvoir facilement activer ou désactiver la règle.

## 🚀 Définition du MVP (Minimum Viable Product)

### 🎯 Objectif du MVP

Livre une version fonctionnelle permettant à un professeur de configurer sa classe de zéro, de définir ses règles automatiques et de gérer le quotidien (bonus/pénalités) sans rencontrer d'impasse bloquante. L'accent est mis sur la fluidité de la saisie (UX) et la fiabilité des compteurs.

### 📦 Les Fonctionnalités

Voici le périmètre strict de la première version :

#### 1. Module d'Authentification

* **Page de Connexion :** Formulaire simple (Email / Mot de passe) connecté à l'API.
* **Page d'Inscription :** Formulaire simple connecté à l'API.
* **Gestion de Session :** Persistance du token (Cookie/Storage) et redirection vers le Dashboard.

#### 2. Module de Configuration (Le "Moteur")

* **Gestion des Types (CRUD) :** Pages pour créer/modifier/supprimer les libellés :
  * Types de Pénalités (ex: "Bavardage").
  * Types de Punitions (ex: "Retenue").
  * Types de Bonus (ex: "Participation").

* **Gestion des Règles (Automation) :**
  * Formulaire de création de règle : Choix du Trigger + Seuil + Conséquence + Mode (`at`, `every`, `after`) + Mode d'échéance (`days` ou `next_lessons`).
  * Switch d'activation/désactivation rapide d'une règle.

#### 3. Module Administratif (Données)

* **Gestion des Classes :** Créer une classe (Nom, Année).
* **Gestion des Élèves :**
  * Créer un élève (Nom, Prénom).
  * Assigner un élève à une classe (via liste déroulante ou formulaire multi-select).
  * *MVP :* saisie manuelle uniquement.
  * *Hors MVP / administration avancée :* un import CSV/XLSX permet de créer les élèves, créer les classes manquantes et lier les deux depuis la zone de danger.

#### 4. Dashboard & Opérations (Le "Live")

* **Vue Filtrée :** Dropdown pour changer de classe et rafraîchir la grille d'élèves.
* **Cartes Élèves :** Affichage des compteurs clés (Punitions à faire / Bonus dispos).
* **Actions Rapides (Quick Actions) :**
  * Bouton `[+] Pénalité` : Ouvre une modale -> Choix du type -> Envoi API -> Feedback immédiat (Toast).
  * Bouton `[+] Bonus` : Ouvre une modale -> Choix du type -> Envoi API.
  * Bouton `[+] Punition` : Création manuelle (hors règles).

#### 5. Suivi & Résolution (Le "SAV")

* **Vue Profil Élève :**
  * Affichage de la **Timeline** (Historique chronologique des événements).

* **Cycle de vie Punition :**
  * Liste des punitions avec état `resolved_at: null`.
  * Action : Bouton "Marquer comme fait" (Appel API pour dater la résolution).

* **Cycle de vie Bonus :**
  * Liste des bonus avec état `used_at: null`.
  * Action : Bouton "Consommer" (Appel API pour brûler le bonus).

## 📋 Backlog - The Punisher (MVP)

### 🏗️ Epic 0 : Initialisation & Socle Technique

*L'objectif est de mettre en place les fondations du projet Nuxt.*
  * [ ] **SETUP-01 : Initialisation du projet**
  * [x] Initialiser Nuxt 3 + TypeScript.
  * [x] Installer et configurer Tailwind CSS.
  * [x] Installer et configurer `shadcn-vue`.
  * [ ] Setup de Pinia (Store).

* [ ] **SETUP-02 : Client API & Gestion des Erreurs**
  * [ ] Créer un composable `useApi` (wrapper autour de `$fetch`).
  * [ ] Configurer la Base URL (`http://localhost:8080`) dans un .env.
  * [ ] Mettre en place un intercepteur d'erreurs global (Toast pour les erreurs 400/500).

* [ ] **SETUP-03 : Layout & Navigation**
  * [ ] Créer le composant `Sidebar` avec les 4 groupes (Général, Suivi, Gestion, Configuration).
  * [ ] Créer le Layout principal (`default.vue`) intégrant la Sidebar.
  * [ ] Rendre la Sidebar responsive (Mobile).

## 🔐 Epic 1 : Authentification

*L'accès au Dashboard doit être sécurisé.*
* [ ] **AUTH-01 : Page de Connexion**
  * [ ] Créer la page `/login`.
  * [ ] Formulaire : Email + Password.
  * [ ] Connexion API `POST /login`.
  * [ ] Stockage du Token (Cookie/LocalStorage) et redirection.

* [ ] **AUTH-02 : Page d'Inscription**
  * [ ] Créer la page `/register`.
  * [ ] Formulaire : Nom, Prénom, Email, Password.
  * [ ] Connexion API `POST /register`.

* [ ] **AUTH-03 : Protection des routes**
  * [ ] Créer un Middleware Nuxt `auth` pour rediriger les utilisateurs non connectés vers `/login`, mettre une animation de chargement pour ne pas leaker l'interface utilisateur.
  * [ ] Gérer la déconnexion (Logout) suppression des cookies.

## ⚙️ Epic 2 : Configuration (Le Moteur)

*Permettre au prof de définir ses "lois" avant de gérer les élèves.*
  * [ ] **CONF-01 : Gestion des Types (CRUD)**
    * [ ] Page `/configuration/types-penalites` : Lister, Créer, Modifier, Supprimer.
    * [ ] Page `/configuration/types-punitions` : Lister, Créer, Modifier, Supprimer.
    * [ ] Page `/configuration/types-bonus` : Lister, Créer, Modifier, Supprimer.
  * [ ] **CONF-02 : Gestion des Règles (Automation)**
    * [ ] Page `/configuration/regles` : Lister les règles existantes.
    * [ ] Formulaire de création :
      * Select `Trigger` (Type Pénalité).
      * Input `Threshold` (Seuil).
      * Select `Mode` (at, every, after).
      * Select `Consequence` (Type Punition).
  * [ ] Switch d'activation/désactivation rapide.

## 📚 Epic 3 : Gestion Administrative

*Peupler la base de données avec les classes et les élèves.*
  * [ ] **ADMIN-01 : Gestion des Classes**
    * [ ] Page `/classes` : Lister les classes.
    * [ ] Modal de création : Nom + Année.
    * [ ] Suppression d'une classe.
  * [ ] **ADMIN-02 : Gestion des Élèves**
    * [ ] Page `/eleves` : Lister tous les élèves (Table avec recherche).
    * [ ] Modal de création : Nom, Prénom, Sélection de la classe (Select).
    * [ ] Suppression d'un élève.
  * [ ] **ADMIN-02B : Import élèves / classes**
    * [ ] Route `/management/danger`.
    * [ ] Import `multipart/form-data` via CSV/XLSX.
    * [ ] Résumé des créations / existants / liens.
    * [ ] Affichage des erreurs de lignes retournées par l'API.
  * [ ] **ADMIN-03 : Profil Élève (Vue détaillée)**
    * [ ] Page `/eleves/:id`.
    * [ ] Afficher les informations de base (Nom, Classe).
    * [ ] Afficher la **Timeline** des événements (Liste chronologique simple).

## 🚀 Epic 4 : Dashboard & Opérations (Le Live)

*Le cœur de l'utilisation quotidienne.*
  * [ ] **DASH-01 : Structure & Filtres**
    * [ ] Page `/` (Dashboard).
    * [ ] Selecteur de Classe en haut de page (Filtre la liste des élèves) de base, tout afficher.
    * [ ] Store Pinia pour garder la classe sélectionnée en mémoire.
  * [ ] **DASH-02 : Carte Élève**
    * [ ] Créer un composant `StudentCard`.
    * [ ] Afficher : Nom, Compteur Punitions (En attente), Compteur Bonus (Dispo).
  * [ ] **DASH-03 : Actions Rapides (Modales)**
    * [ ] Bouton `[+] Pénalité` : Ouvre modal -> Select Type -> API `POST`.
    * [ ] Bouton `[+] Bonus` : Ouvre modal -> Select Type -> API `POST`.
    * [ ] Bouton `[+] Punition` : Ouvre modal -> Select Type -> API `POST`.
    * *UX :* Afficher un Toast de succès ou d'alerte (si une punition auto est générée).

## ⚖️ Epic 5 : Suivi & Résolution (SAV)

*Gérer les dettes et les récompenses.*
  * [ ] **SAV-01 : Gestion des Punitions**
    * [ ] Page `/punitions`.
    * [ ] Lister uniquement les punitions avec le filtre (informations dans le fichier d'api) -> API.
    * [ ] Bouton "Marquer comme fait" -> API.
    * [ ] Disparition de la ligne après validation.
  * [ ] **SAV-02 : Gestion des Bonus**
    * [ ] Page `/bonus`.
    * [ ] Lister uniquement les bonus avec le filtre (informations dans le fichier d'api)  -> API.
    * [ ] Bouton "Consommer" -> API.
