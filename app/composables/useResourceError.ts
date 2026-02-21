import { isUuid } from '~/lib/utils'

/**
 * Helper to handle single resource fetching errors (404/400 to fatal 404).
 */
export function useResourceError() {
  /**
   * Validation function to be used in definePageMeta.validate.
   * Ensures the param is a valid UUID.
   */
  const validateUuid = (paramName: string) => {
    return (route: { params: Record<string, string | string[]> }) => isUuid(route.params[paramName])
  }

  /**
   * Catches 404/400 errors and re-throws them as fatal 404 errors.
   */
  const catchResourceNotFound = (err: unknown, message: string) => {
    if (err && typeof err === 'object') {
      const e = err as { statusCode?: number }
      if (e.statusCode === 404 || e.statusCode === 400) {
        throw createError({
          statusCode: 404,
          statusMessage: message,
          fatal: true,
        })
      }
    }
    throw err
  }

  return {
    validateUuid,
    catchResourceNotFound,
  }
}
