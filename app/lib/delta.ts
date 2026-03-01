type DeltaSource = Record<string, unknown>

/**
 * Build a shallow delta object from two payloads.
 * Only keys present in `current` are considered.
 */
export function buildDelta<T extends DeltaSource>(
  initial: Partial<T>,
  current: Partial<T>,
): Partial<T> {
  const delta: Partial<T> = {}

  for (const key of Object.keys(current) as Array<keyof T>) {
    const nextValue = current[key]

    // `undefined` should be omitted from request bodies.
    if (typeof nextValue === 'undefined') continue

    if (!Object.is(nextValue, initial[key])) {
      delta[key] = nextValue
    }
  }

  return delta
}
