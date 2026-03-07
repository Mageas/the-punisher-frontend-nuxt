import type { Ref } from 'vue'
import { toast } from 'vue-sonner'

type GlobalErrorSource = Ref<string | null | undefined> | (() => string | null | undefined)

function readGlobalError(source: GlobalErrorSource): string | null | undefined {
  if (typeof source === 'function') {
    return source()
  }

  return source.value
}

export function useGlobalErrorToast(source: GlobalErrorSource) {
  watch(
    () => readGlobalError(source),
    (message, previousMessage) => {
      if (!message || message === previousMessage) return

      toast.error(message, {
        position: 'top-center',
        richColors: true,
      })
    },
  )
}
