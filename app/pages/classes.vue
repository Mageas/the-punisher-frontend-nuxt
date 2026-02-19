<script setup lang="ts">
import { AlertCircle, Plus, Star } from 'lucide-vue-next'
import type { Classroom } from '~/types/api'
import CustomPagination from '~/components/CustomPagination.vue'
import ClassroomCreateModal from '~/components/modals/ClassroomCreateModal.vue'

const { t } = useI18n()
const {
  classrooms,
  loading,
  page,
  itemPerPage,
  totalCount,
  fetchClassrooms,
} = useClassrooms()

const showCreateModal = ref(false)
const safeItemsPerPage = computed(() => itemPerPage.value || 10)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / safeItemsPerPage.value)))
const showPagination = computed(() => totalCount.value > 0)

function initials(student: Classroom['students_preview'][number]): string {
  const firstInitial = student.first_name?.charAt(0) ?? ''
  const lastInitial = student.last_name?.charAt(0) ?? ''
  return `${firstInitial}${lastInitial}`.toUpperCase()
}

function formatBonusPoints(points: number): string {
  const suffix = points > 1 ? 'pts' : 'pt'
  return `${points} ${suffix}`
}

function extraStudentsCount(classroom: Classroom): number {
  return Math.max(0, classroom.student_count - previewStudents(classroom).length)
}

function previewStudents(classroom: Classroom): Classroom['students_preview'] {
  return classroom.students_preview.slice(0, 3)
}

async function reload(pageToLoad = page.value || 1) {
  await fetchClassrooms({ page: pageToLoad })
}

async function onPageChange(nextPage: number) {
  if (nextPage === page.value || nextPage < 1 || nextPage > totalPages.value) return
  await reload(nextPage)
}

function onCreated() {
  reload(1)
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
        <Button class="w-full justify-center cursor-pointer xl:w-auto" @click="showCreateModal = true">
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
              {{ initials(student) }}
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
          <span class="inline-flex items-center gap-1">
            <Star class="h-3 w-3 text-amber-400" />
            {{ formatBonusPoints(classroom.total_bonus_points) }}
          </span>
          <span class="inline-flex items-center gap-1">
            <AlertCircle class="h-3 w-3" />
            {{ t('classes.penaltyCount', classroom.total_penalty_count) }}
          </span>
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
