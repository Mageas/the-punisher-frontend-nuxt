import type { MaybeRefOrGetter } from 'vue'

export function readRouteStringQueryParam(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function useRouteStringQueryParam(value: MaybeRefOrGetter<unknown>) {
  return computed(() => readRouteStringQueryParam(toValue(value)))
}
