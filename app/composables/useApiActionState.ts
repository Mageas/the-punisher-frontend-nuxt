export function useApiActionState() {
  const isPending = ref(false)
  let currentAction: Promise<unknown> | null = null

  async function withPending<T>(action: () => Promise<T>): Promise<T> {
    if (currentAction) {
      return currentAction as Promise<T>
    }

    isPending.value = true

    currentAction = (async () => {
      try {
        return await action()
      } finally {
        isPending.value = false
        currentAction = null
      }
    })()

    return currentAction as Promise<T>
  }

  return {
    isPending,
    withPending,
  }
}
