import { parseApiError, type ParsedApiError } from "@/lib/api-error"

type UseRequestStateOptions<T> = {
  isEmpty?: (data: T | null) => boolean
}

export function useRequestState<T>(options: UseRequestStateOptions<T> = {}) {
  const data = ref<T | null>(null)
  const isLoading = ref(false)
  const error = ref<ParsedApiError | null>(null)

  const isEmpty = computed(() => {
    if (isLoading.value || error.value) {
      return false
    }
    if (options.isEmpty) {
      return options.isEmpty(data.value)
    }
    return data.value === null
  })

  const execute = async (request: () => Promise<T>) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await request()
      data.value = response
      return response
    } catch (requestError) {
      data.value = null
      error.value = parseApiError(requestError)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    data.value = null
    error.value = null
    isLoading.value = false
  }

  return {
    data,
    isLoading,
    error,
    isEmpty,
    execute,
    reset,
  }
}
