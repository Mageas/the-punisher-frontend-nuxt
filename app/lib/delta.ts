type DeltaSource = object

/**
 * Build a shallow delta object from two payloads.
 * Only keys present in `current` are considered.
 */
export function buildDelta<T extends DeltaSource>(
  initial: Partial<T>,
  current: Partial<T>,
): Partial<T> {
  const delta: Partial<T> = {}
  const currentKeys = Object.keys(current as Record<string, unknown>) as Array<keyof T>

  for (const key of currentKeys) {
    const nextValue = current[key]

    // `undefined` should be omitted from request bodies.
    if (typeof nextValue === 'undefined') continue

    if (!Object.is(nextValue, initial[key])) {
      delta[key] = nextValue
    }
  }

  return delta
}
