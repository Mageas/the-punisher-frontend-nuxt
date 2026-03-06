<script setup lang="ts">
import { Pencil, Plus, Trash2 } from 'lucide-vue-next'
import type { Penalty } from '~/types/api'

const { t } = useI18n()
const route = useRoute()
const {
  penalties,
  loading,
  page,
  filters,
  itemPerPage,
  totalCount,
  fetchPenalties,
  gotoPage,
  applyFilters,
  deletePenalty,
} = usePenalties()

// Filters local state
const classroomId = ref(filters.classroom_id || '')
const studentId = ref(filters.student_id || '')
const penaltyTypeId = ref(filters.penalty_type_id || '')
const createdFrom = ref(filters.created_from || '')
const createdTo = ref(filters.created_to || '')

const classroomService = useClassroomService()
const studentService = useStudentService()
const typeService = useTypeService()

const safeItemsPerPage = computed(() => itemPerPage.value || 10)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / safeItemsPerPage.value)))
const showPagination = computed(() => totalCount.value > 0)
const studentFilterScopeKey = computed(() => classroomId.value || '__all_students__')

// Count active filters
const activeFilterCount = computed(() => {
  let count = 0
  if (classroomId.value) count++
  if (studentId.value) count++
  if (penaltyTypeId.value) count++
  if (createdFrom.value) count++
  if (createdTo.value) count++
  return count
})

// Modals
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const penaltyToDeleteId = ref<string | null>(null)
const penaltyToEdit = ref<Penalty | null>(null)

// Fetch with current filters
async function reload(pageToLoad = page.value || 1) {
  await fetchPenalties({
    page: pageToLoad,
    classroom_id: classroomId.value || undefined,
    student_id: studentId.value || undefined,
    penalty_type_id: penaltyTypeId.value || undefined,
    created_from: createdFrom.value || undefined,
    created_to: createdTo.value || undefined,
  })
}

async function onPageChange(nextPage: number) {
  if (nextPage === page.value || nextPage < 1 || nextPage > totalPages.value) return
  await gotoPage(nextPage)
}

function openDeleteModal(id: string) {
  penaltyToDeleteId.value = id
  showDeleteModal.value = true
}

function openEditModal(penalty: Penalty) {
  penaltyToEdit.value = penalty
  showEditModal.value = true
}

async function onDeleteConfirmed() {
  await reload(page.value)
}

async function onCreated() {
  await reload(1)
}

async function onUpdated() {
  await reload(page.value)
}

function resetFilters() {
  classroomId.value = ''
  studentId.value = ''
  penaltyTypeId.value = ''
  createdFrom.value = ''
  createdTo.value = ''
}

// Watch filter changes
watch([classroomId, studentId, penaltyTypeId, createdFrom, createdTo], () => {
  applyFilters({
    classroom_id: classroomId.value || undefined,
    student_id: studentId.value || undefined,
    penalty_type_id: penaltyTypeId.value || undefined,
    created_from: createdFrom.value || undefined,
    created_to: createdTo.value || undefined,
  })
})

// When classroom changes, reset selected student filter
watch(classroomId, () => {
  studentId.value = ''
})

async function fetchClassroomOptions(options: { page: number; search?: string }) {
  const response = await classroomService.getClassrooms(options)
  return {
    ...response,
    data: response.data.map((classroom) => ({ id: classroom.id, name: classroom.name })),
  }
}

async function fetchStudentOptions(options: { page: number; search?: string }) {
  const response = classroomId.value
    ? await classroomService.getClassroomStudents(classroomId.value, options)
    : await studentService.getStudents(options)

  return {
    ...response,
    data: response.data.map((student) => ({
      id: student.id,
      name: `${student.first_name} ${student.last_name}`,
    })),
  }
}

async function fetchPenaltyTypeOptions(options: { page: number; search?: string }) {
  const response = await typeService.getPenaltyTypes(options)
  return {
    ...response,
    data: response.data.map((penaltyType) => ({ id: penaltyType.id, name: penaltyType.name })),
  }
}

await useAsyncData(
  () => `penalties:initial:${route.fullPath}`,
  async () => {
    await reload()
    return true
  },
  {
    server: true,
  },
)
</script>

<template>
  <div>
    <PageHeaderBar align="center">
      <template #left>
        <h1 class="text-2xl font-bold tracking-tight">
          {{ t('penalties.title') }}
        </h1>
      </template>

      <template #actions>
        <Button
          class="w-full justify-center cursor-pointer md:w-auto"
          @click="showCreateModal = true"
        >
          <Plus class="w-4 h-4" />
          {{ t('penalties.newPenalty') }}
        </Button>
      </template>
    </PageHeaderBar>

    <FilterBar :active-filter-count="activeFilterCount" @reset="resetFilters">
      <FilterIdNameSelect
        v-model="classroomId"
        :label="t('filters.classroom')"
        :placeholder="t('filters.allClassrooms')"
        :search-placeholder="t('common.searchClass')"
        :empty-text="t('common.noClassFound')"
        :fetch-options="fetchClassroomOptions"
      />

      <FilterIdNameSelect
        v-model="studentId"
        :label="t('filters.student')"
        :placeholder="t('filters.allStudents')"
        :search-placeholder="t('filters.searchStudent')"
        :empty-text="t('filters.noStudentFound')"
        :fetch-options="fetchStudentOptions"
        :options-scope-key="studentFilterScopeKey"
      />

      <FilterIdNameSelect
        v-model="penaltyTypeId"
        :label="t('filters.type')"
        :placeholder="t('filters.allTypes')"
        :search-placeholder="t('filters.searchType')"
        :empty-text="t('filters.noTypeFound')"
        :fetch-options="fetchPenaltyTypeOptions"
      />

      <FilterDateRange
        v-model:from="createdFrom"
        v-model:to="createdTo"
        :label="t('filters.dateRange')"
      />
    </FilterBar>

    <div v-if="penalties.length === 0 && !loading" class="py-16 text-center text-muted-foreground">
      {{ t('penalties.noPenalties') }}
    </div>

    <div v-else class="space-y-3">
      <PenaltyCard
        v-for="penalty in penalties"
        :key="penalty.id"
        :penalty-type-name="penalty.penalty_type_name"
        :occurred-at="penalty.occurred_at ?? penalty.created_at"
        :created-at="penalty.created_at"
        :student-id="penalty.student_id"
        :student-first-name="penalty.student_first_name"
        :student-last-name="penalty.student_last_name"
      >
        <template #actions>
          <Button
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer text-muted-foreground hover:text-foreground"
            :title="t('common.edit')"
            :aria-label="t('common.edit')"
            @click="openEditModal(penalty)"
          >
            <Pencil class="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer text-muted-foreground hover:text-foreground"
            :title="t('modals.delete.confirm')"
            :aria-label="t('modals.delete.confirm')"
            @click="openDeleteModal(penalty.id)"
          >
            <Trash2 class="w-4 h-4 text-danger" />
          </Button>
        </template>
      </PenaltyCard>
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

    <PenaltyCreateModal v-model:open="showCreateModal" @created="onCreated" />
    <PenaltyEditModal v-model:open="showEditModal" :penalty="penaltyToEdit" @updated="onUpdated" />
    <PenaltyDeleteModal
      v-model:open="showDeleteModal"
      :penalty-id="penaltyToDeleteId"
      :delete-fn="deletePenalty"
      @confirmed="onDeleteConfirmed"
    />
  </div>
</template>
