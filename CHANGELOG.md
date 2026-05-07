# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [Non publié]

## [2026-04-19]

### Ajouté
- Audit axe-core automatisé via Playwright sur toutes les routes (script `scripts/a11y-audit.mjs`)
- `lang="fr"`, titre par défaut et template de titre global
- Labels accessibles sur les boutons icône (navigation calendrier, suppression d'exception, switch d'activation de règle, combobox de sélection)

### Modifié
- Contraste des couleurs renforcé : nouveaux tokens `--warning-foreground` et `--danger-foreground`, assombrissement des variants `--success-foreground` et `--info-foreground` en mode clair, et remplacement des usages `text-*` par `text-*-foreground` dans les cartes et badges
- Remplacement de `opacity-60` par `bg-muted/40` sur les cartes atténuées pour préserver le contraste du texte

### Corrigé
- Landmarks ARIA (`<main>` sur les pages publiques, `<aside>`/`<nav>` sur la sidebar)
- Ordre des titres (`<h3>` remplacés par `<h2>` sur classes, exceptions, settings, danger zone)

## [2026-03-13]

### Ajouté
- Modal de détails des règles synchronisée avec le query param `ruleId` (#147)

## [2026-03-12]

### Ajouté
- Utilisation de l'endpoint bulk pour les bonus de classe (#143)
- Badge pour les punitions en retard (#141)
- Affichage des labels d'évaluation sur les cartes d'événements (#139)

### Corrigé
- Respect du fuseau horaire utilisateur pour la sérialisation et l'affichage des dates (#145)
- Amélioration du flux de confirmation du sélecteur date-heure (#137)

## [2026-03-11]

### Ajouté
- Actions groupées de classe pour les étudiants sélectionnés
- Filtres et pagination des sections de tracking sur dashboard et profil étudiant

### Modifié
- Alignement des sections du dashboard avec les requêtes paginées de tracking (#127)
- Migration des couleurs Tailwind en dur vers des variables

### Corrigé
- Taille du champ de recherche étudiant
- Reset des pages des sections du dashboard au changement de classe (#129)

## [2026-03-08]

### Modifié
- Lint du code

### Corrigé
- Conservation des modals de création montés sur les pages vides (#125)

## [2026-03-07]

### Ajouté
- Gestion des secondes masquées dans les champs datetime éditables (#121)
- Toasts de succès pour les actions frontend validées (#119)
- État de chargement réutilisable pour les boutons submit liés à l'API (#115)
- Sélection de classe et de prochain cours pour les punitions (#112)
- Toast pour les erreurs globales (#110)
- Support des dates d'échéance « prochain cours » via le contexte de classe (#109)

### Modifié
- Découpage des pages et formulaires en composants, composables et helpers partagés (#123)

### Corrigé
- Restauration du style invalide pour les champs date imbriqués (#117)
- Différé des erreurs de formulaire jusqu'au submit, alignement de la validation des punitions (#91)

## [2026-03-06]

### Ajouté
- Calendrier avec gestion des exceptions (#106)
- Affichage de `occurred_at` au lieu de `created_at`
- Modal mise à jour pour Punishment, Penalty et Bonus
- Alignement du datetime frontend sur le format RFC3339 UTC du backend (#102)
- Effet flou (blur) en arrière-plan des modals au lieu d'un fond sombre

### Modifié
- Consolidation des clés i18n FR partagées et migration des usages (#104)
- Mise à jour des couleurs du calendrier et conversion des erreurs en toast

### Corrigé
- Précision au centième pour la saisie des points de bonus (#100)

## [2026-03-04]

### Ajouté
- Suppression des cartes KPI au profit de titres (#95)
- Nouvelle UI pour les punitions automatiques (#93)
- Nouvelle pagination à côté des titres (#94)

## [2026-03-03]

### Ajouté
- Flux de mot de passe oublié (#89)
- Mise à jour du mot de passe (#86)

## [2026-03-02]

### Ajouté
- Flux de confirmation par email (#84)
- Utilisation du nouveau format d'erreur d'import (#82)
- Migration des couleurs Tailwind en dur vers des variables custom (#80)

### Modifié
- Templates d'issues GitHub

## [2026-03-01]

### Ajouté
- Filtre et recherche pour les classes (#75)
- Recherche type étudiants pour les pages de types (#65)

### Modifié
- Design unifié pour les select inputs (#71)
- Pagination et recherche API sur les selects (#67)
- Bouton de filtre pour l'étudiant (#66)

### Corrigé
- UI de la popup et de la gestion du footer de la sidebar (#73)
- Suppression du filtrage des résultats côté frontend (#74)
- Upload uniquement des champs modifiés (delta) lors de la mise à jour (#63)

## [2026-02-28]

### Modifié
- Nouvelle recherche complexe (#61)

## [2026-02-27]

### Ajouté
- Notification toast sur la suppression de masse (#58)
- Import des étudiants et des classes (#57)
- Connexion des boutons de suppression de masse à l'API (#53)
- Page « danger » (#50)

### Modifié
- Footer de sidebar avec composant shadcn cliquable (#51)

## [2026-02-25]

### Ajouté
- Route `logout all` pour révoquer tous les refresh tokens utilisateur (#48)

## [2026-02-24]

### Ajouté
- Appel de la route logout pour supprimer le refresh_token (#46)
- Option pour maintenir le focus dans `IdNameSearchInput` (#37)
- Webhook de trigger Dokploy (#42)

### Modifié
- UI version mobile (#40)

## [2026-02-23]

### Ajouté
- Nouvelle UI quand l'inscription est fermée
- Nouvelle UI des KPIs sur dashboard, classes et étudiants

### Modifié
- Gestion d'erreur

### Corrigé
- Appels API au moment de la fermeture des modals
- Focus modal pour les punitions (création + édition)

## [2026-02-22]

### Corrigé
- Erreur 500 au rechargement du cache en build

## [2026-02-21]

### Ajouté
- CI
- Centralisation de la gestion des erreurs fatales (500, réseau)
- URLs de recherche pour le frontend
- URLs de pagination pour le frontend
- Nouveaux services, tests simples et typage quasi complet
- Tests
- Commande lint

### Modifié
- Structure des composants
- Couche service et standardisation de l'accès aux données
- Optimisation de `useAllPaginatedCollection` avec fetch parallèle et protection race
- Sync URL générique
- Utilisation des services au lieu de l'API dans les composables
- Formulaires et validation
- Nettoyage des imports et types
- Fonctions et composants partagés
- Nouvelle structure des dossiers
- Merge utils + sécurité pour `useAllPaginatedCollection`

### Corrigé
- Acceptation de `data-slot` dans les éléments HTML pour Vue
- Logique de retry de l'API

## [2026-02-20]

### Ajouté
- Types
- Suppression forcée et suppression avec timer de confirmation pour les types
- Punition automatique depuis le backend

### Corrigé
- Routes backend
- Focus et overflow du champ de recherche

## [2026-02-19]

### Ajouté
- Règles
- Auto-sélection de la classe pour les modals de création si une est déjà sélectionnée
- Popover avec dropdown d'input
- Profil de classe + classes
- Pénalités
- Profil étudiant + étudiants
- Bonus

### Modifié
- Découpage en cards et sections
- Découpage des composables avec parents pour les requêtes
- Découpage des modals de confirmation
- Découpage de la barre d'en-tête

## [2026-02-18]

### Ajouté
- Punitions + modal de résolution
- Modals pour les boutons du dashboard
- Sidebar shadcn
- Dashboard
- Register
- Login
- shadcn et i18n

### Corrigé
- Redirection en dehors d'un plugin
- Utilisation des traductions partout
- Renommage des composables de page
- Bouton de fermeture des modals
- UI des modals

## [2026-02-15]

### Ajouté
- Documentation
- Initial commit
