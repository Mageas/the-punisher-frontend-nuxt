import type { MaybeRefOrGetter } from 'vue'
import type {
  PaginatedResponse,
  Student,
} from '~/types/api'
import type { IdNameOption, IdNameOptionsFetcher } from './useLazyIdNameOptions'

type IdNameFetchRequest = Parameters<IdNameOptionsFetcher>[0]

function mapPaginatedOptions<T>(
  response: PaginatedResponse<T>,
  mapOption: (item: T) => IdNameOption,
): PaginatedResponse<IdNameOption> {
  return {
    ...response,
    data: response.data.map(mapOption),
  }
}

function createMappedOptionFetcher<T>(
  serviceCall: (requestOptions: IdNameFetchRequest) => Promise<PaginatedResponse<T>>,
  mapOption: (item: T) => IdNameOption,
): IdNameOptionsFetcher {
  return async (requestOptions) => mapPaginatedOptions(await serviceCall(requestOptions), mapOption)
}

export function toIdNameOption<T extends { id: string; name: string }>(entity: T): IdNameOption {
  return {
    id: entity.id,
    name: entity.name,
  }
}

export function createIdNameFetcher<T extends { id: string; name: string }>(
  serviceCall: (requestOptions: IdNameFetchRequest) => Promise<PaginatedResponse<T>>,
): IdNameOptionsFetcher {
  return createMappedOptionFetcher(serviceCall, toIdNameOption)
}

export function toStudentOption(student: Student): IdNameOption {
  return {
    id: student.id,
    name: `${student.first_name} ${student.last_name}`,
  }
}

export function useTrackedEntityFilterOptions(options?: {
  classroomId?: MaybeRefOrGetter<string | null | undefined>
}) {
  const classroomService = useClassroomService()
  const studentService = useStudentService()
  const typeService = useTypeService()

  const normalizedClassroomId = computed(() => {
    const value = toValue(options?.classroomId)
    return typeof value === 'string' && value.trim() ? value : undefined
  })

  const fetchClassroomOptions = createIdNameFetcher((requestOptions) =>
    classroomService.getClassrooms(requestOptions),
  )

  const fetchStudentOptions = createMappedOptionFetcher(async (requestOptions) => {
    const classroomId = normalizedClassroomId.value
    return classroomId
      ? classroomService.getClassroomStudents(classroomId, requestOptions)
      : studentService.getStudents(requestOptions)
  }, toStudentOption)

  const fetchBonusTypeOptions = createIdNameFetcher((requestOptions) =>
    typeService.getBonusTypes(requestOptions),
  )

  const fetchPenaltyTypeOptions = createIdNameFetcher((requestOptions) =>
    typeService.getPenaltyTypes(requestOptions),
  )

  const fetchPunishmentTypeOptions = createIdNameFetcher((requestOptions) =>
    typeService.getPunishmentTypes(requestOptions),
  )

  return {
    fetchClassroomOptions,
    fetchStudentOptions,
    fetchBonusTypeOptions,
    fetchPenaltyTypeOptions,
    fetchPunishmentTypeOptions,
  }
}
