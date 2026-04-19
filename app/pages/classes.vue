<script setup lang="ts">
import { AlertCircle, Star } from 'lucide-vue-next'
import type { Classroom, DashboardKpis } from '~/types/api'
import { formatRatio } from '~/lib/kpi-formatters'

const { t } = useI18n()
useSeoMeta({ title: () => t('common.titles.classes') })

const classroomService = useClassroomService()
const {
  classrooms,
  loading,
  page,
  filters,
  itemPerPage,
  totalCount,
  fetchClassrooms,
  gotoPage,
  applyFilters,
} = useClassrooms()

const showCreateModal = ref(false)
const loadingClassroomKpis = ref(false)
const classroomKpisById = ref<Record<string, DashboardKpis>>({})

const {
  searchQuery,
  activeFilterCount,
  safeItemsPerPage,
  showPagination,
  reload,
  reloadFirstPage,
  onPageChange,
  resetFilters,
} = useSearchListPage({
  page,
  itemPerPage,
  totalCount,
  gotoPage,
  fetchPage: fetchClassrooms,
  applyFilters,
  buildFilters: (search) => ({
    search: search || undefined,
  }),
  getAppliedSearch: () => filters.search,
  initialSearch: filters.search || '',
})

function extraStudentsCount(classroom: Classroom): number {
  return Math.max(0, classroom.student_count - previewStudents(classroom).length)
}

function previewStudents(classroom: Classroom): Classroom['students_preview'] {
  return classroom.students_preview.slice(0, 3)
}

async function fetchVisibleClassroomKpis() {
  const classroomIds = classrooms.value.map((classroom) => classroom.id)

  if (classroomIds.length === 0) {
    classroomKpisById.value = {}
    return
  }

  loadingClassroomKpis.value = true
  try {
    const results = await Promise.allSettled(
      classroomIds.map(async (classroomId) => ({
        classroomId,
        kpis: await classroomService.getClassroomKpis(classroomId),
      })),
    )

    const nextKpisById: Record<string, DashboardKpis> = {}

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        nextKpisById[result.value.classroomId] = result.value.kpis
      }
    })

    classroomKpisById.value = nextKpisById
  } finally {
    loadingClassroomKpis.value = false
  }
}

async function onCreated() {
  await reloadFirstPage()
}

watch(
  () => classrooms.value.map((classroom) => classroom.id).join(','),
  async () => {
    await fetchVisibleClassroomKpis()
  },
  { immediate: true },
)

await reload()
</script>

<template>
  <SearchListPageShell
    :title="t('common.titles.classes')"
    :count-label="t('classes.count', totalCount)"
    :create-label="t('common.actions.addClassroom')"
    :active-filter-count="activeFilterCount"
    :items-count="classrooms.length"
    :empty-message="t('common.empty.noClasses')"
    :page="page"
    :items-per-page="safeItemsPerPage"
    :total="totalCount"
    :loading="loading"
    :show-pagination="showPagination"
    @create="showCreateModal = true"
    @reset="resetFilters"
    @update:page="onPageChange"
  >
    <template #filters>
      <SearchFilterField
        v-model="searchQuery"
        :label="t('common.labels.classroom')"
        :placeholder="t('common.placeholders.searchClassroom')"
      />
    </template>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="classroom in classrooms"
        :key="classroom.id"
        :to="`/classes/${classroom.id}`"
        class="flex flex-col rounded-lg border border-border p-5 transition-colors hover:bg-secondary-hover"
      >
        <div class="mb-3 flex items-center justify-between gap-2">
          <h2 class="text-base font-semibold">
            {{ classroom.name }}
          </h2>
          <Badge variant="outline" class="text-muted-foreground text-xs">
            {{ classroom.year }}
          </Badge>
        </div>

        <div class="mb-4 flex items-center gap-3">
          <p class="text-sm text-muted-foreground">
            {{ t('common.counts.student', classroom.student_count) }}
          </p>

          <div v-if="classroom.students_preview.length > 0" class="flex -space-x-2">
            <StudentAvatar
              v-for="student in previewStudents(classroom)"
              :key="student.id"
              :first-name="student.first_name"
              :last-name="student.last_name"
              size="xs"
              bordered
            />

            <div
              v-if="extraStudentsCount(classroom) > 0"
              class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-secondary text-[10px] font-medium text-secondary-foreground"
            >
              +{{ extraStudentsCount(classroom) }}
            </div>
          </div>
        </div>

        <div class="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
          <template v-if="classroomKpisById[classroom.id]">
            <span
              class="inline-flex items-center gap-1 tabular-nums whitespace-nowrap text-[11px] sm:text-xs"
            >
              <Star class="h-3 w-3 text-warning" />
              {{
                formatRatio(
                  classroomKpisById[classroom.id]?.available_bonus_points ?? 0,
                  classroomKpisById[classroom.id]?.total_bonus_points ?? 0,
                )
              }}
            </span>
            <span
              class="inline-flex items-center gap-1 tabular-nums whitespace-nowrap text-[11px] sm:text-xs"
            >
              <AlertCircle class="h-3 w-3" />
              {{ t('classes.penaltyCount', classroomKpisById[classroom.id]?.penalty_count ?? 0) }}
            </span>
          </template>
          <span v-else-if="loadingClassroomKpis">{{ t('common.loading') }}</span>
          <span v-else>--</span>
        </div>
      </NuxtLink>
    </div>

    <template #modals>
      <ClassroomCreateModal v-model:open="showCreateModal" @created="onCreated" />
    </template>
  </SearchListPageShell>
</template>
