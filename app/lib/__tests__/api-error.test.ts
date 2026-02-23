import { describe, expect, it } from 'vitest'
import { getApiErrorStatus, isFatalApiError, isNetworkApiError } from '../api-error'

describe('api-error.ts', () => {
  describe('getApiErrorStatus', () => {
    it('returns status from the root field', () => {
      expect(getApiErrorStatus({ status: 503 })).toBe(503)
    })

    it('returns status from response.status', () => {
      expect(getApiErrorStatus({ response: { status: 500 } })).toBe(500)
    })

    it('returns status from statusCode', () => {
      expect(getApiErrorStatus({ statusCode: 502 })).toBe(502)
    })

    it('returns undefined when no HTTP status is available', () => {
      expect(getApiErrorStatus(new TypeError('Failed to fetch'))).toBeUndefined()
    })
  })

  describe('isNetworkApiError', () => {
    it('detects browser fetch TypeError failures', () => {
      expect(isNetworkApiError(new TypeError('Failed to fetch'))).toBe(true)
    })

    it('detects fetch-like errors without status and with network message', () => {
      expect(isNetworkApiError({ name: 'FetchError', message: 'fetch failed' })).toBe(true)
    })

    it('does not classify regular HTTP errors as network failures', () => {
      expect(isNetworkApiError({ status: 400, message: 'Bad Request' })).toBe(false)
    })
  })

  describe('isFatalApiError', () => {
    it('is true for HTTP 5xx errors', () => {
      expect(isFatalApiError({ status: 500 })).toBe(true)
    })

    it('is true for network errors', () => {
      expect(
        isFatalApiError(new TypeError('NetworkError when attempting to fetch resource.')),
      ).toBe(true)
    })

    it('is false for non-fatal HTTP errors', () => {
      expect(isFatalApiError({ status: 404 })).toBe(false)
    })
  })
})
