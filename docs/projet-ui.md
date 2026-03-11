# 💀 The Punisher UI

## 1. Convention globale

*Feedback utilisateur après action.*
  * **Succès :** toute création, modification, suppression et action validée associée (`ajout`, `retrait`, `consommation`, `résolution`) affiche un toast vert en bas à droite.
  * **Erreurs :** les erreurs d'action restent affichées inline ou via toast rouge centré en haut selon l'écran.

*Champs date/heure métier.*
  * **Affichage :** les sélecteurs exposent uniquement `HH:mm`.
  * **Création :** les secondes sont envoyées automatiquement à `00`.
  * **Modification :** si l'utilisateur enregistre sans toucher au champ date/heure, les secondes existantes fournies par l'API sont conservées. Dès qu'il modifie activement la date ou l'heure, les secondes sont réinitialisées à `00`.

---

## 2. Sidebar (Navigation)

### A. Groupe : Général

*Le point d'entrée principal.*
  * **📄 Tableau de bord**
    * *Icone :* `LayoutDashboard`
    * *Rôle :* Vue d'ensemble, filtrage par classe, actions rapides (Live).

### B. Groupe : Suivi

*Les opérations quotidiennes (Dettes & Récompenses).*
  * **📄 Punitions**
    * *Icone :* `Gavel`
    * *Rôle :* Liste des punitions "En attente". Action : "Marquer comme fait".
  * **📄 Bonus**
    * *Icone :* `Star`
    * *Rôle :* Liste des bonus "Disponibles". Action : "Consommer".

### C. Groupe : Gestion

*L'administration des effectifs.*
  * **📄 Élèves**
    * *Icone :* `Users`
    * *Rôle :* Annuaire complet, profils, historique.
  * **📄 Classes**
    * *Icone :* `School`
    * *Rôle :* Création et composition des classes.

### D. Groupe : Configuration

*Le paramétrage du système.*
  * **📄 Règles**
    * *Icone :* `Scale` (ou `Settings2`)
    * *Rôle :* Création des automatismes (Trigger -> Seuil -> Punition).
  * **📄 Types de pénalités**
    * *Icone :* `AlertCircle`
  * **📄 Types de punitions**
    * *Icone :* `FileWarning`
  * **📄 Types de bonus**
    * *Icone :* `Trophy`

### E. Groupe : Gestion du planning

*Les écrans de planification.*
  * **📄 Emploi du temps**
    * *Icone :* `CalendarDays`
    * *Route :* `/schedule/slots`
    * *Rôle :* Configurer les créneaux hebdomadaires récurrents et les classes associées.
  * **📄 Vacances & jours fériés**
    * *Route :* `/schedule/exceptions`
    * *Rôle :* Gérer les exceptions globales du calendrier.

### F. Menu utilisateur

*Les actions liées au compte et aux opérations sensibles.*
  * **📄 Paramètres utilisateur**
    * *Icone :* `Settings`
    * *Rôle :* Modifier le mot de passe et déclencher la déconnexion de tous les appareils (avec confirmation).
  * **📄 Zone de danger**
    * *Icone :* `ShieldAlert`
    * *Rôle :* Regroupe les opérations globales et sensibles du tenant, dont l'import initial des élèves/classes et les suppressions massives.

---

## 3. Pages & Layouts

### 🖥️ Tableau de bord (Dashboard)

*Vue synthétique avec contexte filtrable.*
  * **Header & Filtre Global (Top Bar) :**
    * **Gauche (Le Contexte) :** `Select` (Menu déroulant).
      * *Valeur par défaut :* "Tous les élèves" (Vue globale).
      * *Options :* Liste des classes (ex: "6ème A", "5ème B", "3ème Latin").
      * *Comportement :* Rafraîchit instantanément **toute** la page (KPIs, Listes, Graphiques) pour ne montrer que les données de la sélection.
    * **Droite (Les Actions) :**
      * 3 Boutons pour l'accès rapide :
      * `Button` : "Nouveau Bonus" (Icone `Star`).
      * `Button` : "Nouvelle Pénalité" (Icone `AlertTriangle`).
      * `Button` : "Nouvelle Punition" (Icone `Gavel`).
      * *Note UX :* Cliquer sur un bouton ouvre une **Modale Shadcn**. Si une classe est sélectionnée dans le filtre à gauche, la modale s'ouvre avec cette classe pré-sélectionnée.
  * **KPI (Stats Dynamiques) :**
    * *Ces chiffres changent selon la classe choisie dans le Header.*
    * **Carte conservée (Élèves) :** Total élèves (dans la sélection).
    * **Déplacés en badges de titres de sections :**
      * "Dernières pénalités" → `penalty_count`.
      * "Derniers bonus" → `available_bonus_points / total_bonus_points`.
      * "Punitions en attente" → `punitions résolues / total (punitions en retard)`.
  * **Historique Récent (Split View) :**
    * *N'affiche que les événements liés à la sélection.*
    * Pagination inline par section, comme sur le profil élève (`penalties_page`, `bonuses_page`, `punishments_page`, `item_per_page=5`).
    * **Colonne Gauche (Dernières Pénalités) :**
      * Header : "Dernières pénalités" + badge KPI.
      * Plus de badge "Récent".
      * Survol du badge : popover d'explication.
      * Liste : Cartes compactes (Nom, Motif, Heure).
    * **Colonne Droite (Derniers Bonus) :**
      * Header : "Derniers bonus" + badge KPI.
      * Plus de badge "Récent".
      * Survol du badge : popover d'explication.
      * Liste : Cartes compactes (Nom, Type, Badge Statut).
  * **Punitions en attente :**
    * Header : "Punitions en attente" + badge KPI.
    * Format du badge : `résolues / total (en retard)`.
    * *Source de vérité du badge :* KPIs (`total_punishment_count`, `pending_punishment_count`, `overdue_punishment_count`) et non la taille de liste affichée.
    * Survol du badge : popover d'explication.

---

### 🏫 Gestion : Classes

*Vue grille pour visualiser les groupes.*
  * **Header :** Titre "Classes" + Bouton "Nouvelle classe" (ouvre Modale).
  * **Layout :** Grille (`grid-cols-3` ou responsive).
  * **Composant Carte Classe :**
  * **Header :** Nom de la classe (H3) + Icones Edit/Delete (Ghost buttons).
  * **Body :** Nombre d'élèves + Stack d'avatars (3-4 cercles avec initiales).
  * **Footer :** Bouton "Gérer les élèves" (Width full, Outline).

---

### 🗓️ Configuration : Emploi du temps

*Vue hebdomadaire des créneaux récurrents.*
  * **Route :** `/schedule/slots`.
  * **Navigation :** section dédiée "Gestion du planning" dans la sidebar, entrée "Emploi du temps".
  * **Header :** Titre "Emploi du temps" + Bouton "Ajouter un créneau".
  * **Grille :** Colonnes du lundi au dimanche pour refléter l'ensemble des `weekday` supportés par l'API.
  * **Création rapide :** Un clic sur une case vide ouvre la modale avec le jour et la plage horaire d'une seule case préremplis.
  * **Création par sélection :** Un glisser sur plusieurs cases ouvre la modale avec la plage horaire sélectionnée préremplie.
  * **Édition :** Un clic sur un créneau existant ouvre sa modale d'édition.
  * **Erreurs :** les conflits et erreurs d'action sont affichés via toast rouge centré en haut, sans alerte persistante dans la page ou la modale.

---

### 🏖️ Configuration : Vacances & jours fériés

*Page de gestion des exceptions calendrier.*
  * **Route :** `/schedule/exceptions`.
  * **Navigation :** section dédiée "Gestion du planning" dans la sidebar, entrée "Vacances et jours fériés".
  * **Header :** Titre "Vacances et jours fériés".
  * **Vue :** affichage annuel unique pour visualiser les exceptions configurées.
  * **Sélection :** une plage de dates peut être sélectionnée au clic dans la vue annuelle, puis convertie en vacances ou jour férié.
  * **Édition :** un clic sur une période existante charge sa plage dans la barre d'action pour la modifier.
  * **Repère visuel :** la bordure de la barre d'action est bleue en création et orange en édition.
  * **Erreurs :** les erreurs de conflit ou d'action sont affichées via toast rouge, centré en haut de page, sans alerte persistante dans le contenu.
  * **Aide d'édition :** pendant une sélection complète ou une modification, le hint sous le calendrier rappelle la redéfinition en deux clics et indique qu'`Échap` ou la croix quittent le mode édition.
  * **Raccourci :** `Échap` réinitialise la sélection en cours.
  * **Liste :** les exceptions créées sont affichées, sélectionnables pour réédition, et supprimables depuis la liste récapitulative.

---

### 🎓 Gestion : Élèves

*Vue liste/annuaire.*
  * **Header :** Titre "Élèves" + Compteur total + Bouton "Ajouter" (ouvre Modale).
  * **Filtre :** `Input` de recherche pleine largeur ("Rechercher un élève...").
  * **Liste :** Stack vertical de cartes simples.
  * **Avatar :** Cercle avec initiales (ex: "LM" pour Lucas Martin).
  * **Info :** Nom Prénom + Badges des classes (ex: `Badge` "6eme A").
  * **Indicateurs (Droite) :**
    * Compteur Bonus : Indicateur visuel + Chiffre.
    * Compteur Pénalités : Indicateur visuel + Chiffre.
    * Icone `ChevronRight` pour accéder au profil.
  * **Profil élève :**
    * Les cartes KPI en haut de profil sont retirées.
    * Les KPI sont affichés en badges des titres de sections :
      * "Bonus disponibles" → `available_bonus_points / total_bonus_points`.
      * "Pénalités" → `penalty_count / total_penalty_count`.
      * "Punitions en attente" → `résolues / total (en retard)`.
    * Chaque badge KPI affiche un popover explicatif au survol.

---

### ⚠️ Zone de danger

*Vue dédiée aux opérations globales du tenant.*
  * **Accès :** depuis le menu utilisateur.
  * **Actions destructives :**
  * Cartes de suppression globale des élèves et des classes.
  * **Import initial :**
  * Carte dédiée à l'import des élèves et classes depuis un fichier CSV/XLSX.
  * Affichage d'un résumé d'import (créations, existants, liens, lignes en erreur).
  * Traduction frontend des codes d'erreur `import_*` avec enrichissement via le contexte API (`expected`, `min`, `max`).
  * En cas d'erreur de template/fichier, affichage du message global enrichi des détails backend (`error_details[].error`).
  * Tableau scrollable des erreurs de lignes quand la validation échoue.

---

### 👤 Paramètres utilisateur

*Vue dédiée à la sécurité du compte connecté.*
  * **Accès :** depuis le menu utilisateur (footer de la sidebar).
  * **Sécurité :**
  * Formulaire "Modifier le mot de passe" branché sur l'API `POST /v1/auth/change-password`.
  * Affichage des erreurs de validation API au niveau des champs.
  * Toast de confirmation après mise à jour réussie.
  * **Sessions :**
  * Action "Déconnecter tous les appareils" déplacée ici.
  * Confirmation obligatoire avant exécution.

---

### ✅ Suivi : Bonus & Punitions

*Listes de tâches "To-Do".*
  * **Header :** Titre de la section + Bouton "Nouveau" (ouvre Modale).
  * **Filtre :** Barre de recherche.
  * **Liste (Bonus) :**
    * **Icone :** `Star`.
    * **Contenu :** Nom de l'élève, Type de bonus, Date.
    * **Statut :** `Badge` "Disponible" (État par défaut) ou "Consommé" (État final).
    * **Saisie de points :** Le champ `Points` accepte les valeurs positives au centième (pas de `0.01`, ex: `0.25`).
    * **Action :** Bouton "Cadeau/Box" pour consommer le bonus (Uniquement si disponible).
  * **Liste (Punitions) :**
    * **Icone :** `Gavel`.
    * **Contenu :**
      * Punitions automatiques : origine prioritaire `Auto par {Nom de règle}` avec icône de règle et lien vers `/rules`.
      * Fallback automatique sans règle exploitable : `Règle supprimée`.
      * Punitions manuelles : pas de libellé `Punition manuelle`, seules les métadonnées utiles sont affichées.
      * Type de punition et autres métadonnées affichés en zone secondaire.
    * **Statut :** "Échéance : [Date]" (si en attente) ou "Résolu le..." (si fait).
    * **Action :** Bouton `Check` (Cercle coché) pour valider la punition (Uniquement si en attente).
    * **Création manuelle :** après sélection de l'élève, proposer les 5 prochains cours de sa classe sous `Échéance` pour préremplir la date; si l'élève a plusieurs classes, demander d'abord laquelle utiliser et rendre cette sélection obligatoire. Les blocs `Classe` et `Prochains cours` se replient après sélection et restent réouvrables.

---

### ⚙️ Configuration : Règles

*Interface de paramétrage logique.*
  * **Header :** Titre "Règles d'automatisation" + Bouton "Nouvelle règle" (ouvre Modale).
  * **Liste des Règles :** Cartes larges.
  * **Gauche :** `Switch` (Toggle) pour activer/désactiver instantanément.
  * **Centre :** titre principal `rule.name`, puis ligne secondaire "Trigger (ex: Bavardage) ➝ Conséquence (ex: Retenue)".
  * **Détails :** Badge Mode "Au seuil exact" / "A chaque multiple", puis texte "Seuil: X" et rappel d'échéance ("Délai : 2 jours" ou "Échéance : après 2 cours").
  * **Droite :** Actions Edit/Delete (ouvrent Modale).
  * **Création :** champ optionnel `Nom de la règle`. Si vide, fallback auto `from -> to`. Le formulaire expose aussi un sélecteur de mode d'échéance qui masque/affiche `due_at_after_days` ou `due_at_after_lessons`.

---

### 🗂️ Configuration : Types (Référentiels)

*Listes simples CRUD.*
  * **Header :** Titre (ex: "Types de bonus") + Bouton "Ajouter" (ouvre Modale).
  * **Liste :** Cartes simples et compactes.
    * Nom du type (Gras).
    * Date de création (Petit, gris).
    * Actions Edit/Delete à droite.

---

## 4. Composants Globaux

* **Modales (Pop-ups) :**
  * Utilisation systématique du composant `Dialog` de **Shadcn** pour toutes les actions de création (Ajouter un élève, Créer une règle, etc.) et d'édition.
  * Structure standard : Titre, Formulaire au centre, Boutons "Annuler/Valider" en bas à droite.
  * **Erreurs globales de formulaire :** affichage via toast rouge, centré en haut, sans bloc d'erreur persistant dans le contenu du formulaire.
  * **Validation frontend :** le bouton de soumission reste cliquable hors chargement; la validation frontend s'exécute au clic sur "Valider" avant tout appel API.
  * **Chargement uniforme :** les actions de formulaire passent par `LoadingButton` + `useApiActionState`; le spinner et l'état désactivé n'apparaissent qu'après validation frontend réussie et démarrage effectif de l'appel API.
  * **Timing d'affichage :** hors champs mot de passe, aucune erreur inline n'apparaît avant la première tentative de soumission.
  * **Champs mot de passe :** les règles frontend s'affichent en direct pendant la saisie sur les formulaires d'inscription, de changement et de réinitialisation de mot de passe (longueur minimale et confirmation), mais pas sur la connexion.
