import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'

export function buildRuleDetailsQuery(
  query: RouteLocationNormalizedLoaded['query'],
  ruleId: string | null,
) {
  const nextQuery = { ...query }

  if (ruleId) {
    nextQuery.ruleId = ruleId
  } else {
    delete nextQuery.ruleId
  }

  return nextQuery
}

export function useRuleDetailsRouteState(
  route: Pick<RouteLocationNormalizedLoaded, 'query'> = useRoute(),
  router: Pick<Router, 'push' | 'replace'> = useRouter(),
) {
  const selectedRuleId = useRouteStringQueryParam(() => route.query.ruleId)

  async function openRuleDetails(ruleId: string) {
    await router.push({
      query: buildRuleDetailsQuery(route.query, ruleId),
    })
  }

  async function closeRuleDetails() {
    await router.replace({
      query: buildRuleDetailsQuery(route.query, null),
    })
  }

  return {
    selectedRuleId,
    openRuleDetails,
    closeRuleDetails,
  }
}
