import { parseDate } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import type { NextLesson } from '~/types/api'

function normalizeTime(time: string | null | undefined): string {
  const [hours = '08', minutes = '00'] = (time ?? '').split(':')
  return `${hours}:${minutes}`
}

export function getNextLessonSelectionKey(lesson: Pick<NextLesson, 'date' | 'start_time'>): string {
  return `${lesson.date}::${normalizeTime(lesson.start_time)}`
}

export function resolvePunishmentDueAtFromNextLesson(
  lesson: Pick<NextLesson, 'date' | 'start_time'>,
): {
  dueAt: DateValue
  dueAtTime: string
} | null {
  try {
    const dueAt = parseDate(lesson.date)

    return {
      dueAt,
      dueAtTime: normalizeTime(lesson.start_time),
    }
  } catch {
    return null
  }
}

export function resolveSelectedNextLessonKey(
  lessons: readonly Pick<NextLesson, 'date' | 'start_time'>[],
  options: {
    dueAt?: DateValue | null
    dueAtTime?: string | null
  },
): string | null {
  const dueAtDate = options.dueAt?.toString()
  if (!dueAtDate) return null

  const dueAtTime = normalizeTime(options.dueAtTime)

  const exactMatch = lessons.find(
    (lesson) => lesson.date === dueAtDate && normalizeTime(lesson.start_time) === dueAtTime,
  )

  if (exactMatch) {
    return getNextLessonSelectionKey(exactMatch)
  }

  const sameDateMatch = lessons.find((lesson) => lesson.date === dueAtDate)

  return sameDateMatch ? getNextLessonSelectionKey(sameDateMatch) : null
}
