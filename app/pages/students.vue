<script setup lang="ts">
import { AlertCircle, ChevronRight, Plus, Search, Star, X } from 'lucide-vue-next'
import { refDebounced } from '@vueuse/core'
import { getInitials, formatPoints } from '~/lib/utils'

const { t } = useI18n()
const {
  students,
  loading,
  page,
  filters,
  itemPerPage,
  totalCount,
  fetchStudents,
  gotoPage,
  applyFilters,
} = useStudents()

const searchQuery = ref(filters.search || '')
const searchDebounced = refDebounced(searchQuery, 300)
const showCreateModal = ref(false)

const safeItemsPerPage = computed(() => itemPerPage.value || 10)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / safeItemsPerPage.value)))
const showPagination = computed(() => totalCount.value > 0)
const activeFilterCount = computed(() => (searchQuery.value ? 1 : 0))

async function reload(pageToLoad = page.value || 1) {
  await fetchStudents({
    page: pageToLoad,
    search: searchDebounced.value || undefined,
  })
}

async function onPageChange(nextPage: number) {
  if (nextPage === page.value || nextPage < 1 || nextPage > totalPages.value) return
  await gotoPage(nextPage)
}

async function onCreated() {
  await reload(1)
}

function resetFilters() {
  searchQuery.value = ''
}

watch(searchDebounced, async (newSearch) => {
  const normalizedSearch = newSearch || ''
  if (normalizedSearch === (filters.search || '')) return

  await applyFilters({ search: normalizedSearch || undefined })
})

// Initial fetch if not already loading (e.g. from watcher)
if (students.value.length === 0 && !loading.value) {
  await reload()
}
</script>

<template>
  <div>
    <PageHeaderBar align="center">
      <template #left>
        <h1 class="text-2xl font-bold tracking-tight">
          {{ t('common.titles.students') }}
        </h1>
        <Badge variant="outline" class="text-muted-foreground">
          {{ t('common.counts.student', totalCount) }}
        </Badge>
      </template>

      <template #actions>
        <Button
          class="w-full justify-center cursor-pointer md:w-auto"
          @click="showCreateModal = true"
        >
          <Plus class="w-4 h-4" />
          {{ t('common.actions.addStudent') }}
        </Button>
      </template>
    </PageHeaderBar>

    <FilterBar :active-filter-count="activeFilterCount" @reset="resetFilters">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <Label class="text-xs font-medium text-muted-foreground">{{
            t('common.labels.student')
          }}</Label>
          <Button
            v-if="searchQuery"
            variant="ghost"
            size="icon-sm"
            class="h-5 w-5 cursor-pointer text-muted-foreground hover:text-foreground"
            @click="searchQuery = ''"
          >
            <X class="h-3 w-3" />
          </Button>
        </div>
        <div class="relative">
          <Search
            class="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            v-model="searchQuery"
            :placeholder="t('common.placeholders.searchStudent')"
            class="h-8 pl-8 text-xs"
          />
        </div>
      </div>
    </FilterBar>

    <div v-if="students.length === 0 && !loading" class="py-16 text-center text-muted-foreground">
      {{ t('common.empty.noStudents') }}
    </div>

    <div v-else class="space-y-3">
      <NuxtLink
        v-for="student in students"
        :key="student.id"
        :to="`/students/${student.id}`"
        class="flex flex-wrap items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-secondary-hover sm:flex-nowrap sm:items-center"
      >
        <div
          class="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium shrink-0"
        >
          {{ getInitials(student.first_name, student.last_name) }}
        </div>

        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium">{{ student.first_name }} {{ student.last_name }}</p>
          <div v-if="student.classrooms.length > 0" class="mt-1 flex flex-wrap gap-1.5">
            <Badge
              v-for="classroom in student.classrooms"
              :key="classroom.id"
              variant="outline"
              class="text-xs text-muted-foreground"
            >
              {{ classroom.name }}
            </Badge>
          </div>
          <p v-else class="mt-1 text-xs text-muted-foreground">
            {{ t('students.noClassroom') }}
          </p>
        </div>

        <div class="ml-auto flex items-center gap-5 text-sm">
          <div class="flex items-center gap-1.5 text-warning">
            <Star class="w-3.5 h-3.5" />
            <span class="font-medium">{{ formatPoints(student.available_bonus_points) }}</span>
          </div>

          <div class="flex items-center gap-1.5 text-danger">
            <AlertCircle class="w-3.5 h-3.5" />
            <span class="font-medium">{{ student.penalty_count }}</span>
          </div>

          <ChevronRight class="w-4 h-4 text-muted-foreground" />
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

    <StudentCreateModal v-model:open="showCreateModal" @created="onCreated" />
  </div>
</template>
