import { readRouteStringQueryParam, useRouteStringQueryParam } from './useRouteStringQueryParam'

export function extractResetPasswordTokenFromHash(rawHash: string): string {
  const hash = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash
  const normalizedHash = hash.trim()

  if (!normalizedHash) {
    return ''
  }

  const directParams = new URLSearchParams(normalizedHash)
  const directToken = readRouteStringQueryParam(directParams.get('token'))
  if (directToken) {
    return directToken
  }

  const queryIndex = normalizedHash.indexOf('?')
  if (queryIndex !== -1) {
    const nestedParams = new URLSearchParams(normalizedHash.slice(queryIndex + 1))
    const nestedToken = readRouteStringQueryParam(nestedParams.get('token'))
    if (nestedToken) {
      return nestedToken
    }
  }

  return normalizedHash.replace(/^\/+/, '')
}

export function useResetPasswordToken(options?: { onTokenSync?: () => void }) {
  const route = useRoute()
  const queryToken = useRouteStringQueryParam(() => route.query.token)
  const token = ref('')

  function syncToken(nextToken: string) {
    if (nextToken) {
      token.value = nextToken
    }
  }

  function notifySync() {
    options?.onTokenSync?.()
  }

  watch(
    () => route.hash,
    (hash) => {
      syncToken(extractResetPasswordTokenFromHash(hash))
      notifySync()
    },
    { immediate: true },
  )

  watch(
    queryToken,
    (nextToken) => {
      syncToken(nextToken)
      notifySync()
    },
    { immediate: true },
  )

  onMounted(() => {
    syncToken(extractResetPasswordTokenFromHash(window.location.hash))
    syncToken(readRouteStringQueryParam(new URLSearchParams(window.location.search).get('token')))
    notifySync()
  })

  return {
    token,
  }
}
