<script setup lang="ts">
import { AlertCircle, Plus, Star } from 'lucide-vue-next'
import type { Classroom, DashboardKpis } from '~/types/api'
import { getInitials } from '~/lib/utils'

const { t } = useI18n()
const classroomService = useClassroomService()
const { classrooms, loading, page, itemPerPage, totalCount, fetchClassrooms, gotoPage } =
  useClassrooms()

const showCreateModal = ref(false)
const loadingClassroomKpis = ref(false)
const classroomKpisById = ref<Record<string, DashboardKpis>>({})
const safeItemsPerPage = computed(() => itemPerPage.value || 10)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / safeItemsPerPage.value)))
const showPagination = computed(() => totalCount.value > 0)

function extraStudentsCount(classroom: Classroom): number {
  return Math.max(0, classroom.student_count - previewStudents(classroom).length)
}

function previewStudents(classroom: Classroom): Classroom['students_preview'] {
  return classroom.students_preview.slice(0, 3)
}

function formatRatio(current: number, total: number): string {
  return `${current} / ${total}`
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

async function reload(pageToLoad = page.value || 1) {
  await fetchClassrooms({ page: pageToLoad })
  await fetchVisibleClassroomKpis()
}

async function onPageChange(nextPage: number) {
  if (nextPage === page.value || nextPage < 1 || nextPage > totalPages.value) return
  await gotoPage(nextPage)
  await fetchVisibleClassroomKpis()
}

async function onCreated() {
  await reload(1)
}

await reload()
</script>

<template>
  <div>
    <PageHeaderBar align="center">
      <template #left>
        <h1 class="text-2xl font-bold tracking-tight">
          {{ t('classes.title') }}
        </h1>
        <Badge variant="outline" class="text-muted-foreground">
          {{ t('classes.count', totalCount) }}
        </Badge>
      </template>

      <template #actions>
        <Button
          class="w-full justify-center cursor-pointer md:w-auto"
          @click="showCreateModal = true"
        >
          <Plus class="w-4 h-4" />
          {{ t('classes.newClassroom') }}
        </Button>
      </template>
    </PageHeaderBar>

    <div v-if="classrooms.length === 0 && !loading" class="py-16 text-center text-muted-foreground">
      {{ t('classes.noClasses') }}
    </div>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="classroom in classrooms"
        :key="classroom.id"
        :to="`/classes/${classroom.id}`"
        class="flex flex-col rounded-lg border border-border p-5 transition-colors hover:bg-secondary/40"
      >
        <div class="mb-3 flex items-center justify-between gap-2">
          <h3 class="text-base font-semibold">
            {{ classroom.name }}
          </h3>
          <Badge variant="outline" class="text-muted-foreground text-xs">
            {{ classroom.year }}
          </Badge>
        </div>

        <div class="mb-4 flex items-center gap-3">
          <p class="text-sm text-muted-foreground">
            {{ t('classes.studentCount', classroom.student_count) }}
          </p>

          <div v-if="classroom.students_preview.length > 0" class="flex -space-x-2">
            <div
              v-for="student in previewStudents(classroom)"
              :key="student.id"
              class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-secondary text-[10px] font-medium"
            >
              {{ getInitials(student.first_name, student.last_name) }}
            </div>

            <div
              v-if="extraStudentsCount(classroom) > 0"
              class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-secondary text-[10px] font-medium text-muted-foreground"
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
              <Star class="h-3 w-3 text-amber-400" />
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

    <CustomPagination
      v-show="showPagination"
      class="mt-4"
      :page="page"
      :items-per-page="safeItemsPerPage"
      :total="totalCount"
      :loading="loading"
      @update:page="onPageChange"
    />

    <ClassroomCreateModal v-model:open="showCreateModal" @created="onCreated" />
  </div>
</template>
