import { describe, expect, it } from 'vitest'
import { resolvePenaltyClassroomSelection } from '../penalty-classroom'

const classrooms = [
  { id: 'class-1', name: '6A' },
  { id: 'class-2', name: '6B' },
]

describe('resolvePenaltyClassroomSelection', () => {
  it('auto-selects the only classroom when the student has a single class', () => {
    expect(
      resolvePenaltyClassroomSelection([{ id: 'class-1', name: '6A' }], {
        currentClassroomId: null,
        preferredClassroomId: null,
      }),
    ).toEqual({
      classroomId: 'class-1',
      requiresExplicitSelection: false,
    })
  })

  it('keeps the current classroom when it belongs to the selected student', () => {
    expect(
      resolvePenaltyClassroomSelection(classrooms, {
        currentClassroomId: 'class-2',
        preferredClassroomId: 'class-1',
      }),
    ).toEqual({
      classroomId: 'class-2',
      requiresExplicitSelection: true,
    })
  })

  it('falls back to the preferred classroom when the current one is invalid', () => {
    expect(
      resolvePenaltyClassroomSelection(classrooms, {
        currentClassroomId: 'class-3',
        preferredClassroomId: 'class-1',
      }),
    ).toEqual({
      classroomId: 'class-1',
      requiresExplicitSelection: true,
    })
  })

  it('returns an empty selection when no classroom can be resolved', () => {
    expect(
      resolvePenaltyClassroomSelection(classrooms, {
        currentClassroomId: null,
        preferredClassroomId: null,
      }),
    ).toEqual({
      classroomId: '',
      requiresExplicitSelection: true,
    })
  })
})
