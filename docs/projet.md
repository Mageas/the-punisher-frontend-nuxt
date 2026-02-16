# The Punisher - Cadrage MVP

Version: 2026-02-15

## 1) PRD court (1 page)

### Contexte
Les enseignants gerent souvent discipline, bonus et sanctions dans des fichiers manuels (ex: Excel), peu fiables en classe et difficiles a maintenir dans le temps.

### Vision produit
`The Punisher` est une plateforme de gestion disciplinaire orientee classe, permettant de suivre:
- les comportements positifs (`Bonuses`),
- les incidents (`Penalties`),
- les sanctions (`Punishments`), manuelles ou automatiques via des `Rules`.

### Objectif MVP
Remplacer un suivi manuel par un outil rapide, fiable et actionnable pour un enseignant, avec isolation stricte des donnees par `user_id`.

### Utilisateur cible (MVP)
- Enseignant unique (pas de roles multiples dans le MVP).

### Portee fonctionnelle
- CRUD: `Students`, `Classrooms`, `BonusTypes`, `PenaltyTypes`, `PunishmentTypes`, `Rules`.
- Liaison eleves/classes via `StudentClassrooms`.
- Evenements:
- `Bonuses`: creation, consultation, suppression, consommation (`used_at`).
- `Penalties`: creation, consultation, suppression.
- `Punishments`: creation manuelle, consultation, suppression, resolution (`resolved_at`).
- Automatisation:
- Ajout d'une penalite => evaluation des regles actives (`is_active = true`) selon `mode`:
- `at`: declenche au seuil exact.
- `every`: declenche a chaque multiple du seuil.
- `after`: declenche a partir du seuil puis a chaque nouvelle occurrence.

### Decisions produit validees
- Fenetre des regles: infinie (pas de reset automatique).
- Portee des regles: globale enseignant (pas par classe).
- Bonus consomme: uniquement quand l'avantage est reellement applique.
- Punition: pas d'annulation metier; suppression possible.
- Suppression d'une penalite source: aucune action automatique sur la punition deja creee.
- Pas de limite de volume de punitions automatiques.
- Pas de bareme de points negatifs sur `PenaltyTypes`.
- Pas de champ commentaire sur bonus/penalites/punitions.
- Tri par defaut: `created_at` desc (plus recent en premier).
- Suppression d'un element `used`/`resolved` autorisee, avec confirmation.
- `due_at` affiche en fuseau local enseignant.
- UX cible: desktop d'abord, mobile pleinement utilisable.
- Pas de fonctionnalites hors backend existant (ex: pas de mode "cours en cours").

### UX attendue (MVP)
- Saisie rapide et claire en classe.
- Historique eleve par onglets (`Bonuses`, `Penalties`, `Punishments`) plutot que timeline unifiee.
- Confirmations explicites sur actions irreversibles (suppression).
- UI moderne, claire et coherente sur tout le produit.
- Stack UI imposee: `chadcn-vue` + `tailwindcss`.
- Priorite implementation: utiliser d'abord les composants disponibles dans `chadcn-vue` avant de creer des composants custom.
- Theme MVP: `light only` (pas de dark mode dans le MVP).
- Tokens design MVP: conserver les valeurs par defaut `chadcn-vue` (couleurs, radius, spacing), sans personnalisation de marque pour l'instant.

### KPI MVP
- KPI principal 1: nombre de punitions a faire (`pending`).
- KPI principal 2: nombre de bonus non donnes (`unused`).
- KPI recommande 3: nombre de punitions en retard (`pending` et `due_at < now` local).

### Hors scope MVP
- Roles avances (admin, co-enseignants, parents).
- Commentaires libres.
- Regles par classe.
- Sessions de cours horodatees.
- Timeline eleve unifiee.

## 2) Matrice Ecrans -> Endpoints backend

| Ecran | Actions UI | Endpoints |
|---|---|---|
| Login | Se connecter, refresh session | `POST /auth/login`, `POST /auth/refresh` |
| Dashboard | Voir KPI `pending`, `unused`, et "en retard" | `GET /punishments?page=1&state=pending`, `GET /bonuses?page=1&state=unused` |
| Eleves - liste | Lister, creer, ouvrir, modifier, supprimer | `GET /students?page=1`, `POST /students`, `GET /students/{id}`, `PUT /students/{id}`, `DELETE /students/{id}` |
| Eleve - Classrooms (onglet) | Voir classes de l'eleve | `GET /students/{id}/classrooms?page=1` |
| Eleve - Bonuses (onglet) | Lister `used/unused`, creer, consommer, supprimer | `GET /students/{id}/bonuses?page=1&state=...`, `POST /bonuses`, `POST /bonuses/{id}/use`, `DELETE /bonuses/{id}` |
| Eleve - Penalties (onglet) | Lister, creer, supprimer | `GET /students/{id}/penalties?page=1`, `POST /penalties`, `DELETE /penalties/{id}` |
| Eleve - Punishments (onglet) | Lister `pending/resolved`, creer manuelle, resoudre, supprimer | `GET /students/{id}/punishments?page=1&state=...`, `POST /punishments`, `POST /punishments/{id}/resolve`, `DELETE /punishments/{id}` |
| Classes - liste | Lister, creer, ouvrir, modifier, supprimer | `GET /classrooms?page=1`, `POST /classrooms`, `GET /classrooms/{id}`, `PUT /classrooms/{id}`, `DELETE /classrooms/{id}` |
| Classe - eleves | Lister eleves de classe, ajouter, retirer | `GET /classrooms/{id}/students?page=1`, `POST /classrooms/{id}/students`, `DELETE /classrooms/{id}/students/{studentId}` |
| Bonus Types | CRUD catalogue | `GET /bonus-types`, `GET /bonus-types/{id}`, `POST /bonus-types`, `PUT /bonus-types/{id}`, `DELETE /bonus-types/{id}` |
| Penalty Types | CRUD catalogue | `GET /penalty-types`, `GET /penalty-types/{id}`, `POST /penalty-types`, `PUT /penalty-types/{id}`, `DELETE /penalty-types/{id}` |
| Punishment Types | CRUD catalogue | `GET /punishment-types`, `GET /punishment-types/{id}`, `POST /punishment-types`, `PUT /punishment-types/{id}`, `DELETE /punishment-types/{id}` |
| Regles | CRUD + activation/desactivation (`is_active`) | `GET /rules?page=1`, `GET /rules/{id}`, `POST /rules`, `PUT /rules/{id}`, `DELETE /rules/{id}` |
| Bonuses (global) | Liste globale + filtre etat | `GET /bonuses?page=1&state=...`, `GET /bonuses/{id}` |
| Penalties (global) | Liste globale | `GET /penalties?page=1`, `GET /penalties/{id}` |
| Punishments (global) | Liste globale + filtre etat | `GET /punishments?page=1&state=...`, `GET /punishments/{id}` |

Notes implementation front:
- [IMPORTANT] Pas de texte hardcodé : utilisation obligatoire de l'i18n pour tout texte affiché.
- Tri par defaut applique sur `created_at` desc dans chaque vue.
- Confirmation modale obligatoire avant suppression.
- "Punitions en retard" calculees cote front a partir de la liste `pending`.

## 3) User stories MVP (10)

### US-01 - Authentification enseignant
En tant qu'enseignant, je veux me connecter pour acceder a mes donnees.
Critere d'acceptation:
- Login valide => session ouverte.
- Echec login => message d'erreur standard.
- Refresh token utilise pour maintenir la session.

### US-02 - Creer et gerer un eleve
En tant qu'enseignant, je veux creer/modifier/supprimer un eleve.
Critere d'acceptation:
- Je peux creer un eleve avec prenom/nom.
- Je peux modifier ses informations.
- Je peux le supprimer apres confirmation.

### US-03 - Organiser les eleves en classes
En tant qu'enseignant, je veux rattacher/retirer des eleves d'une classe.
Critere d'acceptation:
- Je peux ajouter un eleve a une classe.
- Une relation deja existante retourne un conflit gere en UI.
- Je peux retirer un eleve d'une classe.

### US-04 - Enregistrer une penalite
En tant qu'enseignant, je veux ajouter une penalite a un eleve.
Critere d'acceptation:
- La penalite apparait dans la liste de l'eleve et globale.
- Le moteur de regles est evalue automatiquement.
- Les nouvelles punitions auto sont visibles avec `triggering_rule_id`.

### US-05 - Configurer les regles automatiques
En tant qu'enseignant, je veux creer une regle (`at`, `every`, `after`) pour automatiser les sanctions.
Critere d'acceptation:
- Je peux creer/modifier/supprimer une regle.
- Je peux activer/desactiver via `is_active`.
- Une regle inactive ne declenche aucune punition.

### US-06 - Creer et suivre une punition manuelle
En tant qu'enseignant, je veux ajouter une punition manuelle avec une date d'echeance.
Critere d'acceptation:
- Je peux creer une punition avec `due_at`.
- La punition apparait `pending` a la creation.
- `triggering_rule_id` est `null` pour les punitions manuelles.

### US-07 - Resoudre une punition
En tant qu'enseignant, je veux marquer une punition comme realisee.
Critere d'acceptation:
- Action `resolve` passe la punition a `resolved`.
- Une punition deja resolue retourne un conflit gere en UI.
- La date est affichee en fuseau local.

### US-08 - Enregistrer et consommer un bonus
En tant qu'enseignant, je veux attribuer un bonus puis le consommer quand il est applique.
Critere d'acceptation:
- A la creation, un bonus est `unused`.
- `use` bascule le bonus en `used`.
- Un bonus deja `used` ne peut pas etre reconsomme.

### US-09 - Dashboard prioritaire discipline
En tant qu'enseignant, je veux voir immediatement ce qui reste a faire.
Critere d'acceptation:
- Le dashboard affiche le nombre de punitions `pending`.
- Le dashboard affiche le nombre de bonus `unused`.
- Le dashboard affiche les punitions en retard.

### US-10 - Suppression securisee
En tant qu'enseignant, je veux pouvoir supprimer des elements en gardant le controle.
Critere d'acceptation:
- Suppression possible pour elements `used`/`resolved`.
- Une confirmation explicite est obligatoire avant suppression.
- Apres suppression, la liste se met a jour sans incoherence.

## 4) User stories complementaires (12)

### US-11 - Filtres persistants par vue
En tant qu'enseignant, je veux conserver mes filtres et ma page courante quand je navigue.
Critere d'acceptation:
- Les parametres `state` et `page` sont presents dans l'URL.
- Un rafraichissement de la page conserve le contexte.
- Le retour navigateur restaure le meme etat.

### US-12 - Pagination robuste
En tant qu'enseignant, je veux parcourir mes listes sans perte de contexte.
Critere d'acceptation:
- Je peux naviguer page suivante/precedente sans erreur.
- Le tri par defaut reste `created_at` desc.
- Les filtres actifs sont conserves pendant la pagination.

### US-13 - Etats UI reseau
En tant qu'enseignant, je veux comprendre rapidement l'etat des donnees chargees.
Critere d'acceptation:
- Chaque liste gere les etats `loading`, `empty`, `error`.
- En cas d'erreur, un bouton "Reessayer" est disponible.
- L'etat d'erreur n'empeche pas les autres ecrans de fonctionner.

### US-14 - Gestion de session expiree
En tant qu'enseignant, je veux rester connecte sans interruption brutale.
Critere d'acceptation:
- A expiration access token, la tentative de refresh est automatique.
- Si le refresh echoue, redirection vers login.
- Un message clair informe de l'expiration de session.

### US-15 - Messages d'erreur comprehensibles
En tant qu'enseignant, je veux des erreurs comprenables pour corriger rapidement.
Critere d'acceptation:
- Les `error_code` API sont mappes en messages lisibles.
- Les erreurs de validation affichent le champ concerne si disponible.
- Aucun message technique brut n'est affiche a l'utilisateur final.

### US-16 - Prevention des doubles actions
En tant qu'enseignant, je veux eviter les actions dupliquees par double-clic.
Critere d'acceptation:
- Les boutons d'action (`use`, `resolve`, `delete`) se desactivent pendant la requete.
- Un double-clic n'entraine pas de doublon cote interface.
- En cas d'echec reseau, le bouton redevient actif.

### US-17 - Visibilite punition auto vs manuelle
En tant qu'enseignant, je veux distinguer l'origine des punitions.
Critere d'acceptation:
- Chaque punition affiche un badge `Automatique` ou `Manuelle`.
- `triggering_rule_id` est visible quand present.
- Les punitions manuelles affichent explicitement l'absence de regle.

### US-18 - Gestion des echeances
En tant qu'enseignant, je veux reperer rapidement les punitions en retard.
Critere d'acceptation:
- Les dates `due_at` sont affichees en fuseau local.
- Une punition `pending` depassee est visuellement marquee.
- Le total des retards est coherent avec le dashboard.

### US-19 - Suppression contextualisee
En tant qu'enseignant, je veux confirmer clairement ce que je supprime.
Critere d'acceptation:
- La modale de confirmation indique l'entite cible (nom/type/id lisible).
- Le caractere irreversible est explicite.
- Aucun element n'est supprime sans confirmation explicite.

### US-20 - Responsive mobile reel
En tant qu'enseignant, je veux utiliser l'application sur mobile si necessaire.
Critere d'acceptation:
- Les ecrans principaux sont utilisables a partir d'une largeur ~360px.
- Les actions critiques restent accessibles sans zoom.
- Les tableaux/listes conservent lisibilite et actions essentielles.

### US-21 - Accessibilite minimale
En tant qu'enseignant, je veux une interface utilisable au clavier.
Critere d'acceptation:
- Les formulaires et modales sont navigables au clavier.
- Le focus est visible sur les elements interactifs.
- Les modales se ferment avec `Esc`.

### US-22 - Resilience des suppressions de catalogue
En tant qu'enseignant, je veux des comportements coherents si une suppression echoue.
Critere d'acceptation:
- En cas d'echec API, un message explicite est affiche.
- L'etat de la liste reste coherent (pas de suppression fantome).
- Une nouvelle tentative est possible sans recharger l'application.

## 5) Lean UX Canvas

### 5.1 Probleme business
- La gestion discipline/bonus est faite dans Excel ou papier, avec risque d'erreur et perte de temps.
- Le suivi des actions a faire (punitions, bonus a appliquer) manque de visibilite immediate.
- Les regles disciplinaires sont difficiles a appliquer de facon coherente dans la duree.

### 5.2 Business outcomes
- Reduire le temps de gestion administrative de discipline par enseignant.
- Augmenter la coherence des sanctions via les regles automatiques.
- Donner une vision claire des priorites quotidiennes: punitions `pending`, bonus `unused`.

### 5.3 Utilisateurs
- Utilisateur principal: enseignant (proprietaire unique des donnees via `user_id`).
- Contexte d'usage: classe (temps contraint), puis bureau (suivi plus detaille).

### 5.4 Besoins utilisateurs
- Saisir vite un bonus, une penalite, une punition.
- Retrouver rapidement l'historique d'un eleve.
- Savoir immediatement ce qui est en retard ou non traite.
- Garder le controle via confirmations avant suppression.

### 5.5 Benefices utilisateur
- Moins de charge mentale et moins d'oublis.
- Decisions disciplinaires plus regulieres et tracables.
- Remplacement d'Excel par un flux metier simple et explicite.

### 5.6 Solutions MVP
- Dashboard avec KPI prioritaires: `punishments pending`, `bonuses unused`, retards.
- Vues dediees eleve/classe/types/regles avec tri `created_at` desc.
- Actions metier explicites: `use bonus`, `resolve punishment`, suppression avec confirmation.
- Gestion locale des echeances (`due_at`) en fuseau enseignant.

### 5.7 Hypotheses critiques
- H1: Un dashboard centre sur "a faire" ameliore le pilotage quotidien.
- H2: Les regles auto (`at`, `every`, `after`) reduisent les oublis et augmentent la coherence.
- H3: Des listes separees par onglet (et non timeline unifiee) sont plus actionnables en MVP.
- H4: Un parcours desktop-first reste acceptable en contexte mobile.

### 5.8 Hypothese la plus risquee
- Les enseignants adopteront l'outil en classe si les actions principales sont faisables en quelques clics.

### 5.9 Experiences Lean (MVP)
- E1: Test de scenario "fin de cours en 5 minutes" avec creation de 5 penalites + 2 bonus.
- E1 succes:
- Flux termine sans blocage.
- Temps total cible <= 2 minutes.

- E2: Test "revue hebdo" avec resolution de punitions et consommation de bonus.
- E2 succes:
- L'utilisateur retrouve toutes les actions pending/unused sans aide.
- Aucune ambiguite sur l'etat `used`/`resolved`.

- E3: Test comprehension des punitions auto.
- E3 succes:
- L'utilisateur distingue manuel vs automatique dans 100% des cas.
- Lien a la regle (`triggering_rule_id`) percu comme explicable.

### 5.10 Mesures de succes produit
- Taux de completion des actions critiques: `create penalty`, `create bonus`, `create punishment`, `resolve`, `use`.
- Delai moyen de traitement: temps entre creation punition et `resolved_at`.
- Backlog operationnel: volume de `pending` et `unused` en fin de semaine.
- Qualite percue: nombre d'erreurs utilisateur sur suppression/etat.

## 6) Backlog MVP

### 6.1 Regles de priorisation
- `P0`: indispensable au go-live MVP.
- `P1`: important mais peut etre livre juste apres le go-live si necessaire.

### 6.2 Backlog MVP - P0 (release)

| Ordre | ID | Priorite | Item | Reference | Dependances | Estimation |
|---|---|---|---|---|---|---|
| 0 | MVP-00 | P0 | Fondations UI: `chadcn-vue` prioritaire, `tailwindcss`, theme `light only` | Directive UI MVP | - | S |
| 1 | MVP-01 | P0 | Auth enseignant: login + refresh + deconnexion propre | US-01, US-14 | MVP-00 | M |
| 2 | MVP-02 | P0 | Shell app: etats `loading/empty/error` + mapping erreurs API | US-13, US-15 | MVP-00, MVP-01 | M |
| 3 | MVP-03 | P0 | Eleves: CRUD complet + tri `created_at` desc | US-02 | MVP-00, MVP-01, MVP-02 | M |
| 4 | MVP-04 | P0 | Classes: CRUD + ajout/retrait d'eleve dans une classe | US-03 | MVP-00, MVP-03 | M |
| 5 | MVP-05 | P0 | Catalogues: CRUD `BonusTypes`, `PenaltyTypes`, `PunishmentTypes` | Portee MVP | MVP-00, MVP-01, MVP-02 | M |
| 6 | MVP-06 | P0 | Penalties: creation/liste/suppression, impact regles visible | US-04 | MVP-00, MVP-03, MVP-05 | M |
| 7 | MVP-07 | P0 | Rules: CRUD + `is_active`, modes `at/every/after` | US-05 | MVP-00, MVP-05, MVP-06 | M |
| 8 | MVP-08 | P0 | Bonuses: creation/liste/suppression + action `use` | US-08 | MVP-00, MVP-03, MVP-05 | M |
| 9 | MVP-09 | P0 | Punishments: creation manuelle/liste/suppression + `resolve` + gestion retards | US-06, US-07, US-18 | MVP-00, MVP-03, MVP-05 | L |
| 10 | MVP-10 | P0 | Dashboard: KPI `pending`, `unused`, `late` | US-09 | MVP-00, MVP-08, MVP-09 | S |
| 11 | MVP-11 | P0 | Suppression securisee: confirmation obligatoire sur toutes les entites | US-10 | MVP-00, MVP-03 a MVP-09 | S |
| 12 | MVP-12 | P0 | Listes robustes: pagination + filtres persistants URL | US-11, US-12 | MVP-00, MVP-03 a MVP-10 | M |

### 6.3 Backlog MVP - P1 (apres go-live si besoin)

| Ordre | ID | Priorite | Item | Reference | Dependances | Estimation |
|---|---|---|---|---|---|---|
| 13 | MVP-13 | P1 | Prevention double actions (`use/resolve/delete`) | US-16 | MVP-08, MVP-09, MVP-11 | S |
| 14 | MVP-14 | P1 | Visibilite auto vs manuelle (badge + `triggering_rule_id`) | US-17 | MVP-09 | S |
| 15 | MVP-15 | P1 | Suppression contextualisee et resilience sur echec API | US-19, US-22 | MVP-11 | S |
| 16 | MVP-16 | P1 | Responsive mobile de base sur ecrans critiques | US-20 | MVP-03 a MVP-10 | M |
| 17 | MVP-17 | P1 | Accessibilite minimale clavier/focus/modales | US-21 | MVP-02, MVP-11 | M |

### 6.4 Lotissement recommande (4 sprints)

| Sprint | Objectif | Items |
|---|---|---|
| Sprint 1 | Fondations UI et securite session | MVP-00, MVP-01, MVP-02 |
| Sprint 2 | Coeur metier classes/eleves/types | MVP-03, MVP-04, MVP-05 |
| Sprint 3 | Discipline operationnelle | MVP-06, MVP-07, MVP-08, MVP-09 |
| Sprint 4 | Pilotage et stabilisation go-live | MVP-10, MVP-11, MVP-12 (+ MVP-13 si marge) |

### 6.5 Definition of Done MVP
- Tous les items `P0` sont livres et validates en recette manuelle.
- Les flux critiques fonctionnent sans blocage: login, create penalty, create/use bonus, create/resolve punishment.
- Les KPI dashboard affichent des valeurs coherentes avec les listes source.
- Les suppressions passent toujours par confirmation et gerent proprement les erreurs API.
- Les ecrans MVP utilisent prioritairement les composants `chadcn-vue`, styles avec `tailwindcss`, avec exceptions justifiees.
- Le theme MVP est `light only`.

### 6.6 Composants `chadcn-vue` obligatoires par ecran (P0)

| Ecran | Composants obligatoires (prioritaires) |
|---|---|
| Login | `Card`, `Form`, `FormField`, `Input`, `Label`, `Button`, `Alert` |
| Dashboard | `Card`, `Badge`, `Table`, `Button`, `Skeleton` |
| Eleves - liste | `Table`, `Input`, `Button`, `Dialog`, `AlertDialog`, `Pagination`, `Badge` |
| Eleve - detail (onglets) | `Tabs`, `Card`, `Table`, `Button`, `Dialog`, `AlertDialog`, `Badge` |
| Classes - liste/detail | `Table`, `Input`, `Button`, `Dialog`, `AlertDialog`, `Pagination`, `Badge` |
| Types (bonus/penalty/punishment) | `Table`, `Input`, `Button`, `Dialog`, `AlertDialog`, `Pagination` |
| Regles | `Table`, `Form`, `Input`, `Select`, `Switch`, `Button`, `Dialog`, `AlertDialog`, `Badge` |
| Lists globales bonuses/penalties/punishments | `Table`, `Select`, `Badge`, `Pagination`, `Button`, `Skeleton` |
| Confirmation suppression (global) | `AlertDialog` |
| Feedback utilisateur (global) | `Toast`, `Alert` |

Regle d'implementation UI:
- Si un composant existe dans `chadcn-vue`, il est utilise en priorite.
- Un composant custom n'est autorise qu'en absence de composant `chadcn-vue` pertinent ou besoin metier specifique justifie.
