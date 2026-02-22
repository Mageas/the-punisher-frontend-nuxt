# Audit SSR / Chargement Direct des URLs (Nuxt 4)

Date de l'audit: 2026-02-22

## Objectif

Auditer l'implementation SSR (Nuxt/Nitro) et le chargement direct des URLs en mode build (runtime Nitro), expliquer le bug `500` observe au refresh dur (`Ctrl+Shift+R`), et fournir une roadmap de correction alignée avec les pratiques industrie.

## Resume Executif

- Le bug principal est reproduit en mode build SSR.
- La cause racine n'est pas un probleme de routing Nuxt, mais un probleme de resolution d'URL backend cote serveur SSR combine a une gestion d'erreurs trop agressive dans le plugin `$api`.
- En Docker, `NUXT_PUBLIC_API_BASE_URL=http://localhost:8080/v1` est non fiable pour le SSR: depuis le conteneur frontend, `localhost` pointe vers le conteneur frontend lui-meme, pas vers votre backend.
- Quand un `access_token` valide est present, le middleware auth laisse passer la requete vers la page, la page execute ses appels API en SSR, l'appel reseau echoue, et `app/plugins/api.ts` remonte un `fatal 500` global.
- Les routes inconnues (`/penaltie`) ne sont pas la cause du 500. Elles retournent bien `404` dans certaines conditions, mais le middleware auth global rend le comportement incoherent (redirect `/login` quand non authentifie).

## Reproduction (confirmee localement)

### Conditions observees

- Build Nuxt OK (`nuxt build`)
- Serveur Nitro genere (`node .output/server/index.mjs`)
- Requetes SSR avec cookie `access_token` valide (simulation)
- Backend inaccessible (API URL volontairement invalide)

### Resultats

- `GET /` -> `500 Internal Server Error`
- `GET /penalties` -> `500 Internal Server Error`
- `GET /penaltie` -> `404 Page not found`

### Stack SSR capturee (equivalente a vos logs)

Le `fatal 500` remonte depuis le plugin API compile (`server.mjs:6409`) et correspond a `app/plugins/api.ts`.

## Cause Racine (Root Cause)

### 1) URL backend non SSR-safe en conteneur

Fichiers:
- `docker-compose.yml:11`
- `nuxt.config.ts:5`
- `.env.example:2`

Constat:
- La meme variable `NUXT_PUBLIC_API_BASE_URL` est utilisee pour le navigateur ET pour le rendu SSR.
- En runtime Docker, `http://localhost:8080/v1` n'est pas l'API (sauf si l'API tourne dans le meme conteneur, ce qui n'est pas le cas ici).

Impact:
- En SSR build, les pages proteges executent des appels API cote serveur vers une cible inaccessible.
- Les erreurs reseau deviennent des `500` Nitro.

### 2) Plugin `$api` global transforme les erreurs reseau en fatal 500

Fichier:
- `app/plugins/api.ts:116`
- `app/plugins/api.ts:141`
- `app/plugins/api.ts:147`

Constat:
- Toute erreur reseau / erreur sans `statusCode` est interpretee comme fatale:
  - `isFatalError = statusCode >= 500 || e.statusCode === undefined`
- Le plugin lance `createError({ fatal: true })`, ce qui coupe le rendu SSR entier.

Impact:
- Une indisponibilite backend sur un endpoint de page fait tomber toute la page en `500`, meme si un fallback UI pourrait etre affiche.
- Le plugin masque partiellement la cause (URL backend mal resolue vs vrai bug applicatif).

## Findings detailles (audit)

## Critique 1: Configuration d'API non separee entre client et serveur

Fichiers:
- `nuxt.config.ts:5`
- `docker-compose.yml:11`
- `.env.example:2`

Probleme:
- Une seule URL API "publique" est partagee par le client et le SSR.
- En SSR, il faut une URL resolvable depuis l'environnement serveur (conteneur, VM, cluster), qui est souvent differente de l'URL vue par le navigateur.

Standard industrie:
- Separer les URLs:
  - `runtimeConfig.apiBaseUrlServer` (prive, SSR uniquement)
  - `runtimeConfig.public.apiBaseUrl` (navigateur)
- Ou mieux: passer par un proxy same-origin (`/api`) pour unifier SSR/CSR.

## Critique 2: Politique d'erreur globale trop agressive dans le plugin API

Fichier:
- `app/plugins/api.ts:116`

Probleme:
- Le plugin decide de la fatalite sans contexte metier (page critique vs widget optionnel vs mutation).
- Une simple erreur reseau sur un endpoint non critique provoque un crash SSR global.

Standard industrie:
- La criticite doit etre decidee au niveau de la page/composable (ou via options explicites), pas uniquement dans le client HTTP global.
- Le client HTTP doit:
  - normaliser les erreurs,
  - journaliser,
  - laisser le contexte appelant choisir `fatal` / `recoverable`.

## Eleve 3: Chargement SSR des pages via `await` top-level sans `useAsyncData`

Fichiers (exemples):
- `app/pages/index.vue:64`
- `app/pages/penalties.vue:63`
- `app/layouts/default.vue:39`
- `app/pages/students.[studentId].vue:126`
- `app/pages/classes.[classroomId].vue:119`

Probleme:
- Les pages font des `await` top-level directs sur des services/composables.
- Cela fonctionne, mais perd une partie des avantages Nuxt SSR:
  - gestion standard `pending/error/status`
  - deduplication/payload hydration via `useAsyncData`
  - controle explicite `server`, `lazy`, `default`
  - instrumentation/tests plus simples

Impact:
- Couplage fort entre rendu initial et disponibilite backend.
- Gestion des fallbacks heterogene selon les pages.

Standard industrie:
- Donnees de page via `useAsyncData`/`useFetch` (ou wrappers standardises).
- Actions utilisateur (mutations) via services/composables.

## Eleve 4: Middleware auth global masque le 404 pour les URLs inconnues (cas non authentifie)

Fichier:
- `app/middleware/auth.global.ts:22`

Probleme:
- Le middleware auth s'applique globalement avant de distinguer clairement les routes inconnues.
- Pour une URL invalide (`/penaltie`) sans auth, le comportement observe est un redirect `/login` au lieu d'un `404`.

Impact:
- Semantique HTTP incoherente.
- Debug et observabilite des erreurs d'URL plus difficiles.

Standard industrie:
- Une route inconnue doit rester `404` (sauf choix produit explicite).
- Le middleware auth devrait ignorer les routes non matchees (`to.matched.length === 0`) ou laisser Nuxt produire le `404`.

## Eleve 5: Gestion d'erreur incoherente entre composables (certaines erreurs sont "avalees")

Fichier:
- `app/composables/useAllPaginatedCollection.ts:85`

Probleme:
- `useAllPaginatedCollection` catch toutes les erreurs, les loggue, puis continue avec `error.value`.
- Sur SSR, cela peut produire des rendus partiels silencieux et des logs bruyants/incoherents.
- En plus, les `H3Error` fatales ne sont pas preservees sous une forme structuree utile pour l'UI.

Impact:
- Comportements differents selon les pages (certaines crashent en 500, d'autres affichent une UI partielle).
- Difficulte de definir une politique SSR coherente.

Standard industrie:
- Definir une convention claire:
  - "fail fast" pour donnees critiques de page
  - fallback UI pour donnees secondaires
  - logs structures avec contexte de route

## Moyen 6: Fetch utilisateur dans le layout (surface de panne SSR elargie)

Fichier:
- `app/layouts/default.vue:39`

Probleme:
- Le layout appelle `userStore.fetchUser()` pendant le rendu SSR si auth presente.
- C'est legitime, mais cela ajoute une dependance backend a toutes les pages protegees, meme quand non necessaire.

Impact:
- Temps de rendu et surface de panne augmentes.
- Risque de duplication d'appels sur navigation/refresh si non dedupe.

Amelioration:
- Utiliser `callOnce()` (Nuxt) / `useAsyncData` pour le profil utilisateur global.
- Tolerer explicitement l'echec non critique (deja partiellement fait via `catch`).

## Moyen 7: Securite / architecture auth (standard industrie "strict")

Fichiers:
- `app/plugins/api.ts`
- `app/composables/useAuth.ts`
- `app/middleware/auth.global.ts`

Constat:
- `access_token` est stocke dans un cookie lisible JS (`useCookie`) pour soutenir le SSR middleware.

Trade-off:
- Fonctionnel, mais pas "best-in-class" securite.

Standard industrie (niveau cible):
- Preferer un modele BFF / session serveur / cookies HttpOnly pour les secrets.
- Si access token cote client est conserve:
  - TTL tres court
  - rotation stricte
  - flags `Secure` en production
  - monitoring d'expiration/refresh

## Faible 8: Manque de garde-fous de deploiement et tests SSR build

Constat:
- Pas de smoke tests SSR build (URLs directes + cookies + backend KO/OK) visibles dans le projet.
- `docker-compose.yml` ne documente pas la connectivite backend (service name, network, healthcheck, etc.).

Impact:
- Regressions SSR detectees tard (apres build/deploiement).

Standard industrie:
- Tests de smoke SSR en CI sur artifact build (`.output/server`).
- Healthchecks + `depends_on` (si meme compose) ou docs d'integration reseau explicites.

## Analyse specifique du bug "Ctrl+Shift+R en build"

Sequence probable (cas reel):

1. Le navigateur envoie `GET /penalties` (ou `/`) au serveur Nitro (SSR).
2. Un cookie `access_token` valide est present.
3. `auth.global.ts` considere l'utilisateur authentifie et ne redirige pas vers `/login`.
4. La page execute un fetch API en SSR (`await reload()` / `await fetchDashboard()`).
5. Le plugin `$api` appelle `http://localhost:8080/v1/...` depuis le conteneur frontend.
6. L'API n'est pas joignable (mauvaise URL reseau / backend non dispo).
7. `app/plugins/api.ts` convertit l'erreur reseau en `createError({ fatal: true })`.
8. Nitro repond `500 Internal Server Error`.

Pourquoi ce n'est pas visible en dev:

- En dev, le frontend tourne souvent sur l'hote local (pas dans un conteneur isole), donc `localhost:8080` peut fonctionner.
- Le contexte reseau est different entre `nuxt dev` et runtime Docker.

## Roadmap de correction (priorisee)

## P0 - Correction immediate (1-2 jours)

Objectif: eliminer le `500` lie a la connectivite SSR en build.

1. Separer config API serveur / client
- Ajouter dans `nuxt.config.ts`:
  - `runtimeConfig.apiBaseUrlServer` (prive)
  - `runtimeConfig.public.apiBaseUrl` (client)
- Modifier `app/plugins/api.ts` pour choisir l'URL selon `import.meta.server`.

2. Corriger la config Docker
- Si backend dans le meme `docker-compose`:
  - utiliser le nom du service backend (`http://backend:8080/v1`)
- Si backend sur la machine hote:
  - documenter `host.docker.internal` (ou `extra_hosts` Linux) au lieu de `localhost`

3. Documenter l'env de prod
- Mettre a jour `.env.example` avec variables SSR/CSR distinctes et exemples Docker.

4. Ajouter un startup check (log non bloquant)
- Logguer la cible API resolvee cote serveur au demarrage (sans secrets).

## P1 - Robustesse SSR / URL Loading (2-5 jours)

Objectif: rendre le chargement direct des URLs fiable et observable.

1. Refactor des pages critiques vers `useAsyncData`
- Priorite:
  - `app/pages/index.vue`
  - `app/pages/penalties.vue`
  - `app/pages/punishments.vue`
  - `app/pages/bonuses.vue`
- Definir pour chaque page:
  - donnees critiques (fatal si KO)
  - donnees secondaires (fallback UI)

2. Revoir la politique d'erreur du plugin `$api`
- Le plugin ne doit pas imposer `fatal` par defaut pour tous les cas.
- Introduire une option claire par appel:
  - `errorMode: 'fatal' | 'recoverable'`
  - ou `fatal: boolean` mais appliquee de maniere explicite par les services/pages
- Conserver les informations d'erreur pour les logs serveur (URL, methode, status, cause reseau)

3. Corriger la semantique 404 des URLs inconnues
- Dans `auth.global.ts`, bypass auth si route non matchee (ex: `to.matched.length === 0`)
- Laisser Nuxt retourner `404` pour `/penaltie`

4. Standardiser les comportements par type de page
- Pages liste/profil: UX de fallback (alert + retry)
- Pages critiques d'auth/session: redirect controle
- Routes invalides: `404`

## P2 - Mise a niveau "standards industrie" (1 sprint)

Objectif: architecture SSR stable, securisee, maintenable.

1. Introduire un proxy same-origin (`/api`)
- Browser et SSR appellent `/api/...`
- Nitro/proxy reverse route vers le backend reel
- Benefices:
  - meme URL en dev/prod
  - moins de problemes CORS/cookies
  - pas d'URL interne exposee au client

2. Revoir la strategie auth (niveau cible)
- Option recommandee: BFF/session HttpOnly
- A minima:
  - durcir cookies en prod (`Secure`)
  - clarifier la strategie refresh SSR/CSR
  - centraliser la logique auth/refresh

3. Observabilite
- Logs structures (route, methode, upstream, status, request id)
- Distinction claire:
  - upstream unreachable
  - unauthorized
  - validation / not found

4. Performance SSR
- Dedupe des appels globaux (`callOnce` pour profil user)
- `useAsyncData` keys stables
- Eviter fetchs non critiques pendant SSR si inutiles au rendu above-the-fold

## P3 - Qualite / Regression Safety (continu)

1. Tests de smoke SSR build en CI
- Cas non authentifie:
  - `GET /` -> 302 `/login`
  - `GET /penaltie` -> 404 (apres correction middleware)
- Cas authentifie + backend OK:
  - `GET /` -> 200
  - `GET /penalties` -> 200
- Cas authentifie + backend KO:
  - verifier comportement attendu (500 ou fallback UI selon page/politique)

2. Tests d'integration Docker
- Verifier la resolution du backend par service name
- Verifier les variables d'env SSR/CSR

3. Documentation d'exploitation
- Matrice d'env (dev local, docker local, staging, prod)
- Checklist de diagnostic SSR (symptomes -> causes probables)

## Recommandations concretes (ordre d'implementation)

1. Corriger la connectivite SSR Docker (cause racine actuelle)
2. Separer les URLs API server/client
3. Ajuster la politique d'erreur `$api` (fatal vs recoverable)
4. Corriger la semantique 404 dans le middleware auth
5. Migrer les pages critiques vers `useAsyncData`
6. Ajouter tests SSR build + docs d'exploitation

## Criteres d'acceptation (Definition of Done SSR)

- Un hard refresh (`Ctrl+Shift+R`) sur une URL valide (`/penalties`, `/students/<id>`, `/classes/<id>`) ne retourne pas `500` quand le backend est correctement configure.
- Une URL inconnue (`/penaltie`) retourne `404` de facon coherente.
- Les environnements Docker/dev/prod utilisent une configuration API explicite et documentee.
- Les pages SSR critiques utilisent une strategie d'erreur explicite (fatal ou fallback).
- Une suite minimale de tests smoke SSR build valide les routes principales.

## Notes finales

- Le bug observe est principalement un ecart d'environnement (dev vs build Docker SSR), revele par une bonne execution SSR des pages.
- Le routing Nuxt est globalement correct; le point bloquant est la strategie de connectivite API et la politique de gestion d'erreur en SSR.
- Une correction P0 + P1 stabilisera rapidement le chargement direct des URLs en build.
