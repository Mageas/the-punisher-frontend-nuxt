# Store paginé avec invalidation CRUD (sans cache de recherche)

## 1. Décisions demandées

Ce document applique explicitement ces choix :

1. ne pas stocker globalement les résultats dynamiques de recherche (`search`),
2. éviter la complexité inutile,
3. garder une architecture lisible et sûre,
4. invalider/repeupler automatiquement après `create/update/delete`.

## 2. Ce qui se fait dans l'industrie

### 2.1 Patterns dominants

1. **Server state cache par query key** (TanStack Query, RTK Query, SWR) :
   - cache par clé de requête,
   - TTL (`staleTime`),
   - invalidation par tags/keys après mutation.
2. **Cache normalisé par `id`** (Apollo cache, RTK entity adapter, gros frontends) :
   - entités canonisées dans `entitiesById`,
   - listes stockées en `ids`,
   - utile quand la même entité est affichée dans plusieurs vues.
3. **Approche hybride** :
   - query cache pour les listes,
   - normalisation `id` seulement pour domaines complexes.

### 2.2 Recherche texte: pratique courante

Dans la majorité des apps, la recherche libre est traitée comme **donnée volatile** :

1. debounce + requête directe,
2. pas de persistance longue dans un store global,
3. parfois micro-cache local très court (quelques secondes) uniquement dans la page/composable.

Conclusion : ton choix de **ne pas stocker la recherche dans le store global** est aligné avec les pratiques industrie.

### 2.3 Stockage par `id`: est-ce "bien" ?

Réponse courte : **oui, souvent**, mais pas toujours nécessaire.

1. recommandé si :
   - même entité réutilisée sur plusieurs écrans,
   - besoin d'updates cohérents partout,
   - volume de données/mutations élevé.
2. pas nécessaire si :
   - app simple,
   - listes indépendantes,
   - priorité à la lisibilité et vitesse d'implémentation.

Pour ce projet, je recommande une v1 **sans normalisation par `id`** (plus simple), puis ajout si le besoin apparaît.

## 3. Architecture recommandée pour ce repo (v1)

### 3.1 Principe

1. cache uniquement les pages paginées "stables",
2. exclure `search` des clés de cache,
3. après mutation CRUD : invalider les pages concernées + refetch automatique.

### 3.2 Qu'est-ce qui est cacheable ?

1. oui :
   - `page`,
2. non :
   - `search`,
   - autocomplétion,
   - filtres "typing live" utilisateur.

## 4. Structure d'état (sans `entitiesById`)

```ts
interface PageSlice<T> {
  data: T[] // Note: utiliser markRaw(data) pour éviter la deep reactivity inutile sur les grosses listes
  page: number
  itemPerPage: number
  totalCount: number
  nextPage: number | null
  previousPage: number | null
  fetchedAt: number
  stale: boolean
  loading: boolean
  error: string | null
}

interface PaginatedStoreState<T, TFilters> {
  pages: Record<string, PageSlice<T>> // clé: resource + page + stableFilters
  currentKey: string | null
  currentPage: number
  currentFilters: Partial<TFilters>
}
```

## 5. Arborescence à créer

```txt
app/stores/
  _shared/
    paginated-cache.types.ts
    paginated-cache.utils.ts
    createStaticPaginatedStore.ts
    invalidation-map.ts
  students.store.ts
  classrooms.store.ts
  rules.store.ts
  bonuses.store.ts
  penalties.store.ts
  punishments.store.ts
  types/
    bonus-types.store.ts
    penalty-types.store.ts
    punishment-types.store.ts
```

## 6. Implémentation étape par étape

### Étape 0 - Conventions globales

Définir :

1. `staleTimeMs` par défaut (ex: `30_000`),
2. `maxCachedPages` (ex: `20`) avec éviction LRU (supprimer le plus ancien `lastAccessed`),
3. liste blanche des filtres stables par ressource,
4. règle stricte : `search` n'entre jamais dans la clé de cache.

### Étape 1 - Helpers partagés

Dans `app/stores/_shared/paginated-cache.utils.ts` :

1. `pickStableFilters(filters, allowedKeys)` pour exclure `search`,
2. `serializeStableFilters(filters)` trié par clé,
3. `buildPageKey(resource, page, stableFilters)`,
4. `isFresh(fetchedAt, staleTimeMs)`.

### Étape 2 - Factory `createStaticPaginatedStore`

Créer une factory qui expose :

1. `fetchPage({ page, filters, force })`,
2. `gotoPage(page)`,
3. `applyFilters(filters)` (sur filtres stables uniquement),
4. `invalidateAll()`,
5. `createOne(payload)`,
6. `updateOne(id, payload)`,
7. `deleteOne(id)`.

Comportement :

1. si page fraîche + pas `force`, servir le cache,
2. sinon appeler API et écraser le slice de page,
3. sur `create/update/delete` :
   - mutation API,
   - `invalidateAll()`,
   - refetch auto (page 1 pour create, page courante sinon).

### Étape 3 - Déduplication et sécurité

Dans la factory :

1. `pendingRequests` par clé pour éviter appels doublons,
2. `callId` pour ignorer réponses obsolètes,
3. `try/catch/finally` systématique (rethrow 401/403 pour auth),
4. validation `page >= 1`,
5. mapping d'erreurs safe UI.

### Étape 4 - Stores concrets

Exemple `students` :

1. autoriser seulement `[]` en filtres stables si tu veux zéro cache filtre,
2. ou autoriser `['classroom_id']`,
3. ne jamais autoriser `search`.

### Étape 5 - Recherche hors store global

Pour `search` :

1. garder dans le composable/page (`ref` + debounce),
2. lancer requête directe `fetchStudents({ page: 1, search })`,
3. ne pas écrire le résultat dans `pages` du store,
4. optionnel : mini-cache local composable (TTL 3-5s max).

### Étape 6 - Migration progressive des composables/pages

1. garder l'API actuelle (`useStudents`, `useRules`, etc.),
2. brancher vers les nouvelles actions store,
3. supprimer les `reload()` manuels quand auto-refetch est en place.

### Étape 7 - Invalidation transverse

Ajouter `app/stores/_shared/invalidation-map.ts` :

1. `students.*` -> invalider `students`, `classrooms`, `dashboard`,
2. `bonuses/penalties/punishments.*` -> invalider aussi compteurs élèves + dashboard,
3. `types.*` -> invalider `types.*` + `rules`.

## 7. Snippet clé de factory (sans cache search)

```ts
function toStableFilters(input: Record<string, unknown>) {
  return pickStableFilters(input, allowedStableFilterKeys) // search exclu
}

async function fetchPage(params: { page?: number; filters?: Record<string, unknown>; force?: boolean }) {
  const page = Math.max(1, params.page ?? state.currentPage)
  const stableFilters = toStableFilters(params.filters ?? state.currentFilters)
  const key = buildPageKey(resource, page, stableFilters)

  const cached = state.pages[key]
  if (!params.force && cached && isFresh(cached.fetchedAt, staleTimeMs) && !cached.stale) {
    state.currentKey = key
    state.currentPage = page
    state.currentFilters = stableFilters
    return
  }

  await runDeduped(key, async () => {
    const res = await services.list({ ...stableFilters, page })
    state.pages[key] = {
      data: res.data,
      page: res.page,
      itemPerPage: res.item_per_page,
      totalCount: res.total_count,
      nextPage: res.next_page,
      previousPage: res.previous_page,
      fetchedAt: Date.now(),
      stale: false,
      loading: false,
      error: null,
    }
    state.currentKey = key
    state.currentPage = page
    state.currentFilters = stableFilters
  })
}
```

## 8. Tests à ajouter

### Unit (Vitest)

1. `search` absent de la clé cache,
2. `fetchPage` sert le cache si frais,
3. `create/update/delete` invalident + refetch auto,
4. déduplication requêtes en vol,
5. réponse obsolète ignorée.

### Intégration

1. page liste garde son cache en navigation retour,
2. recherche ne pollue pas le cache global,
3. mutation met à jour l'écran sans reload manuel.

### E2E

1. créer/modifier/supprimer sans refresh navigateur,
2. vérifier baisse des requêtes réseau sur navigation répétée.

## 9. Checklist d'implémentation

1. créer factory `createStaticPaginatedStore`,
2. migrer `students` en pilote,
3. traiter `search` hors store global,
4. migrer `classrooms`, `rules`, `bonuses`, `penalties`, `punishments`,
5. ajouter invalidation map transverse,
6. supprimer `reload()` manuels redondants,
7. ajouter tests unit/intégration/e2e.

## 10. Definition of Done

1. aucune clé cache ne contient `search`,
2. les listes stables sont servies depuis cache quand fraîches,
3. chaque CRUD déclenche invalidation + repopulation automatique,
4. pages simplifiées sans logique de refresh dupliquée,
5. tests verts.
