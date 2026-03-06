<script setup lang="ts">
import { Gift, Pencil, Plus, Trash2 } from 'lucide-vue-next'
import type { Bonus } from '~/types/api'

const { t } = useI18n()
const route = useRoute()
const {
  bonuses,
  loading,
  page,
  filters,
  itemPerPage,
  totalCount,
  fetchBonuses,
  gotoPage,
  applyFilters,
  useBonus,
  deleteBonus,
} = useBonuses()

// Filters local state (synced via applyFilters)
const classroomId = ref(filters.classroom_id || '')
const studentId = ref(filters.student_id || '')
const bonusTypeId = ref(filters.bonus_type_id || '')
const state = ref(filters.state || '')
const createdFrom = ref(filters.created_from || '')
const createdTo = ref(filters.created_to || '')

const classroomService = useClassroomService()
const studentService = useStudentService()
const typeService = useTypeService()

const safeItemsPerPage = computed(() => itemPerPage.value || 10)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / safeItemsPerPage.value)))
const showPagination = computed(() => totalCount.value > 0)
const studentFilterScopeKey = computed(() => classroomId.value || '__all_students__')

const stateOptions = computed(() => [
  { value: 'unused', label: t('filters.stateUnused') },
  { value: 'used', label: t('filters.stateUsed') },
])

// Count active filters
const activeFilterCount = computed(() => {
  let count = 0
  if (classroomId.value) count++
  if (studentId.value) count++
  if (bonusTypeId.value) count++
  if (state.value) count++
  if (createdFrom.value) count++
  if (createdTo.value) count++
  return count
})

// Modals
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showUseModal = ref(false)
const bonusToDeleteId = ref<string | null>(null)
const bonusToUseId = ref<string | null>(null)
const bonusToEdit = ref<Bonus | null>(null)

// Fetch with current filters
async function reload(pageToLoad = page.value || 1) {
  await fetchBonuses({
    page: pageToLoad,
    classroom_id: classroomId.value || undefined,
    student_id: studentId.value || undefined,
    bonus_type_id: bonusTypeId.value || undefined,
    state: (state.value as 'used' | 'unused') || undefined,
    created_from: createdFrom.value || undefined,
    created_to: createdTo.value || undefined,
  })
}

async function onPageChange(nextPage: number) {
  if (nextPage === page.value || nextPage < 1 || nextPage > totalPages.value) return
  await gotoPage(nextPage)
}

async function handleUse(id: string) {
  await useBonus(id)
}

function openDeleteModal(id: string) {
  bonusToDeleteId.value = id
  showDeleteModal.value = true
}

function openEditModal(bonus: Bonus) {
  bonusToEdit.value = bonus
  showEditModal.value = true
}

function openUseModal(id: string) {
  bonusToUseId.value = id
  showUseModal.value = true
}

async function onDeleteConfirmed() {
  await reload(page.value)
}

async function onUseConfirmed() {
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
  bonusTypeId.value = ''
  state.value = ''
  createdFrom.value = ''
  createdTo.value = ''
}

// Watch filter changes and apply with debounce
watch([classroomId, studentId, bonusTypeId, state, createdFrom, createdTo], () => {
  applyFilters({
    classroom_id: classroomId.value || undefined,
    student_id: studentId.value || undefined,
    bonus_type_id: bonusTypeId.value || undefined,
    state: (state.value as 'used' | 'unused') || undefined,
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

async function fetchBonusTypeOptions(options: { page: number; search?: string }) {
  const response = await typeService.getBonusTypes(options)
  return {
    ...response,
    data: response.data.map((bonusType) => ({ id: bonusType.id, name: bonusType.name })),
  }
}

await useAsyncData(
  () => `bonuses:initial:${route.fullPath}`,
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
          {{ t('bonuses.title') }}
        </h1>
      </template>

      <template #actions>
        <Button
          class="w-full justify-center cursor-pointer md:w-auto"
          @click="showCreateModal = true"
        >
          <Plus class="w-4 h-4" />
          {{ t('bonuses.newBonus') }}
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
        v-model="bonusTypeId"
        :label="t('filters.type')"
        :placeholder="t('filters.allTypes')"
        :search-placeholder="t('filters.searchType')"
        :empty-text="t('filters.noTypeFound')"
        :fetch-options="fetchBonusTypeOptions"
      />

      <FilterSelect
        v-model="state"
        :label="t('filters.state')"
        :placeholder="t('filters.allStates')"
        :options="stateOptions"
      />

      <FilterDateRange
        v-model:from="createdFrom"
        v-model:to="createdTo"
        :label="t('filters.dateRange')"
      />
    </FilterBar>

    <div v-if="bonuses.length === 0 && !loading" class="py-16 text-center text-muted-foreground">
      {{ t('bonuses.noBonuses') }}
    </div>

    <div v-else class="space-y-3">
      <BonusCard
        v-for="bonus in bonuses"
        :key="bonus.id"
        :bonus-type-name="bonus.bonus_type_name"
        :points="bonus.points"
        :used-at="bonus.used_at"
        :created-at="bonus.created_at"
        :student-id="bonus.student_id"
        :student-first-name="bonus.student_first_name"
        :student-last-name="bonus.student_last_name"
      >
        <template #actions>
          <Button
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer text-muted-foreground hover:text-foreground"
            :title="t('common.edit')"
            :aria-label="t('common.edit')"
            @click="openEditModal(bonus)"
          >
            <Pencil class="w-4 h-4" />
          </Button>

          <Button
            v-if="!bonus.used_at"
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer text-muted-foreground hover:text-foreground"
            :title="t('common.consume')"
            :aria-label="t('common.consume')"
            @click="openUseModal(bonus.id)"
          >
            <Gift class="w-5 h-5 text-warning" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer text-muted-foreground hover:text-foreground"
            :title="t('modals.delete.confirm')"
            :aria-label="t('modals.delete.confirm')"
            @click="openDeleteModal(bonus.id)"
          >
            <Trash2 class="w-4 h-4 text-danger" />
          </Button>
        </template>
      </BonusCard>
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

    <BonusCreateModal v-model:open="showCreateModal" @created="onCreated" />
    <BonusEditModal v-model:open="showEditModal" :bonus="bonusToEdit" @updated="onUpdated" />
    <BonusDeleteModal
      v-model:open="showDeleteModal"
      :bonus-id="bonusToDeleteId"
      :delete-fn="deleteBonus"
      @confirmed="onDeleteConfirmed"
    />
    <BonusUseModal
      v-model:open="showUseModal"
      :bonus-id="bonusToUseId"
      :use-fn="handleUse"
      @confirmed="onUseConfirmed"
    />
  </div>
</template>
