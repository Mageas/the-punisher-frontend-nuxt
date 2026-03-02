# 💀 The Punisher UI

## 1. Sidebar (Navigation)

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

### E. Menu utilisateur

*Les actions liées au compte et aux opérations sensibles.*
  * **📄 Zone de danger**
    * *Icone :* `ShieldAlert`
    * *Rôle :* Regroupe les opérations globales et sensibles du tenant, dont l'import initial des élèves/classes.

---

## 2. Pages & Layouts

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
  * **Cartes KPI (Stats Dynamiques) :**
    * *Ces chiffres changent selon la classe choisie dans le Header.*
    * **Carte 1 (Élèves) :** Total élèves (dans la sélection).
    * **Carte 2 (Bonus) :** Bonus disponibles (non consommés).
    * **Carte 3 (Pénalités) :** Total pénalités enregistrées (Période en cours).
    * **Carte 4 (Punitions) :** Punitions "En attente" (Prioritaire).
  * **Historique Récent (Split View) :**
    * *N'affiche que les événements liés à la sélection.*
    * **Colonne Gauche (Dernières Pénalités) :**
      * Header : "Dernières pénalités".
      * Liste : Cartes compactes (Nom, Motif, Heure).
    * **Colonne Droite (Derniers Bonus) :**
      * Header : "Derniers bonus".
      * Liste : Cartes compactes (Nom, Type, Badge Statut).

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

---

### ⚠️ Zone de danger

*Vue dédiée aux opérations globales du tenant.*
  * **Accès :** depuis le menu utilisateur.
  * **Actions destructives :**
  * Cartes de suppression globale des élèves et des classes.
  * Carte de déconnexion de tous les appareils.
  * **Import initial :**
  * Carte dédiée à l'import des élèves et classes depuis un fichier CSV/XLSX.
  * Affichage d'un résumé d'import (créations, existants, liens, lignes en erreur).
  * Traduction frontend des codes d'erreur `import_*` avec enrichissement via le contexte API (`expected`, `min`, `max`).
  * En cas d'erreur de template/fichier, affichage du message global enrichi des détails backend (`error_details[].error`).
  * Tableau scrollable des erreurs de lignes quand la validation échoue.

---

### ✅ Suivi : Bonus & Punitions

*Listes de tâches "To-Do".*
  * **Header :** Titre de la section + Bouton "Nouveau" (ouvre Modale).
  * **Filtre :** Barre de recherche.
  * **Liste (Bonus) :**
    * **Icone :** `Star`.
    * **Contenu :** Nom de l'élève, Type de bonus, Date.
    * **Statut :** `Badge` "Disponible" (État par défaut) ou "Consommé" (État final).
    * **Action :** Bouton "Cadeau/Box" pour consommer le bonus (Uniquement si disponible).
  * **Liste (Punitions) :**
    * **Icone :** `Gavel`.
    * **Contenu :** Nom, Type de punition, Badge "Auto" (si générée par règle).
    * **Statut :** "Échéance : [Date]" (si en attente) ou "Résolu le..." (si fait).
    * **Action :** Bouton `Check` (Cercle coché) pour valider la punition (Uniquement si en attente).

---

### ⚙️ Configuration : Règles

*Interface de paramétrage logique.*
  * **Header :** Titre "Règles d'automatisation" + Bouton "Nouvelle règle" (ouvre Modale).
  * **Liste des Règles :** Cartes larges.
  * **Gauche :** `Switch` (Toggle) pour activer/désactiver instantanément.
  * **Centre :** Phrase logique "Trigger (ex: Bavardage) ➝ Conséquence (ex: Retenue)".
  * **Détails :**
  * Badge Mode : "Au seuil exact" / "A chaque multiple".
  * Texte : "Seuil: X".
  * **Droite :** Actions Edit/Delete (ouvrent Modale).

---

### 🗂️ Configuration : Types (Référentiels)

*Listes simples CRUD.*
  * **Header :** Titre (ex: "Types de bonus") + Bouton "Ajouter" (ouvre Modale).
  * **Liste :** Cartes simples et compactes.
    * Nom du type (Gras).
    * Date de création (Petit, gris).
    * Actions Edit/Delete à droite.

---

## 3. Composants Globaux

* **Modales (Pop-ups) :**
  * Utilisation systématique du composant `Dialog` de **Shadcn** pour toutes les actions de création (Ajouter un élève, Créer une règle, etc.) et d'édition.
  * Structure standard : Titre, Formulaire au centre, Boutons "Annuler/Valider" en bas à droite.
