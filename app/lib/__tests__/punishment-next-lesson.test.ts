import { parseDate } from '@internationalized/date'
import { describe, expect, it } from 'vitest'
import {
  getNextLessonSelectionKey,
  resolvePunishmentDueAtFromNextLesson,
  resolveSelectedNextLessonKey,
} from '../punishment-next-lesson'

describe('resolvePunishmentDueAtFromNextLesson', () => {
  it('maps a next lesson to due_at form values', () => {
    const result = resolvePunishmentDueAtFromNextLesson({
      date: '2026-03-18',
      start_time: '10:00',
    })

    expect(result?.dueAt.toString()).toBe('2026-03-18')
    expect(result?.dueAtTime).toBe('10:00')
  })

  it('returns null when the lesson date is invalid', () => {
    expect(
      resolvePunishmentDueAtFromNextLesson({
        date: 'not-a-date',
        start_time: '10:00',
      }),
    ).toBeNull()
  })

  it('prefers an exact date and time match for the selected lesson key', () => {
    const lessons = [
      {
        date: '2026-03-18',
        start_time: '08:00',
      },
      {
        date: '2026-03-18',
        start_time: '10:00',
      },
    ] as const

    const [, secondLesson] = lessons

    expect(
      resolveSelectedNextLessonKey(lessons, {
        dueAt: parseDate('2026-03-18'),
        dueAtTime: '10:00',
      }),
    ).toBe(getNextLessonSelectionKey(secondLesson))
  })

  it('falls back to the first same-date lesson when the time differs', () => {
    const lessons = [
      {
        date: '2026-03-18',
        start_time: '08:00',
      },
      {
        date: '2026-03-18',
        start_time: '10:00',
      },
    ] as const

    const [firstLesson] = lessons

    expect(
      resolveSelectedNextLessonKey(lessons, {
        dueAt: parseDate('2026-03-18'),
        dueAtTime: '12:00',
      }),
    ).toBe(getNextLessonSelectionKey(firstLesson))
  })
})
