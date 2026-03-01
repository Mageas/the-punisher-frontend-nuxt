<script setup lang="ts">
import { CircleCheck, Plus, Trash2 } from 'lucide-vue-next'

const { t } = useI18n()
const route = useRoute()
const {
  punishments,
  loading,
  page,
  filters,
  itemPerPage,
  totalCount,
  fetchPunishments,
  gotoPage,
  applyFilters,
  resolvePunishment,
  deletePunishment,
} = usePunishments()

// Filters local state
const classroomId = ref(filters.classroom_id || '')
const studentId = ref(filters.student_id || '')
const punishmentTypeId = ref(filters.punishment_type_id || '')
const state = ref(filters.state || '')
const automated = ref(filters.automated || '')
const overdue = ref(filters.overdue || '')
const createdFrom = ref(filters.created_from || '')
const createdTo = ref(filters.created_to || '')
const dueFrom = ref(filters.due_from || '')
const dueTo = ref(filters.due_to || '')

const classroomService = useClassroomService()
const studentService = useStudentService()
const typeService = useTypeService()

const safeItemsPerPage = computed(() => itemPerPage.value || 10)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / safeItemsPerPage.value)))
const showPagination = computed(() => totalCount.value > 0)
const studentFilterScopeKey = computed(() => classroomId.value || '__all_students__')

const stateOptions = computed(() => [
  { value: 'pending', label: t('filters.statePending') },
  { value: 'resolved', label: t('filters.stateResolved') },
])

const automatedOptions = computed(() => [
  { value: 'true', label: t('filters.automatedYes') },
  { value: 'false', label: t('filters.automatedNo') },
])

const overdueOptions = computed(() => [{ value: 'true', label: t('filters.overdueOnly') }])

// Count active filters
const activeFilterCount = computed(() => {
  let count = 0
  if (classroomId.value) count++
  if (studentId.value) count++
  if (punishmentTypeId.value) count++
  if (state.value) count++
  if (automated.value) count++
  if (overdue.value) count++
  if (createdFrom.value) count++
  if (createdTo.value) count++
  if (dueFrom.value) count++
  if (dueTo.value) count++
  return count
})

// Modals
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const showResolveModal = ref(false)
const punishmentToDeleteId = ref<string | null>(null)
const punishmentToResolveId = ref<string | null>(null)

// Fetch with current filters
async function reload(pageToLoad = page.value || 1) {
  await fetchPunishments({
    page: pageToLoad,
    classroom_id: classroomId.value || undefined,
    student_id: studentId.value || undefined,
    punishment_type_id: punishmentTypeId.value || undefined,
    state: (state.value as 'pending' | 'resolved') || undefined,
    automated: automated.value || undefined,
    overdue: overdue.value || undefined,
    created_from: createdFrom.value || undefined,
    created_to: createdTo.value || undefined,
    due_from: dueFrom.value || undefined,
    due_to: dueTo.value || undefined,
  })
}

async function onPageChange(nextPage: number) {
  if (nextPage === page.value || nextPage < 1 || nextPage > totalPages.value) return
  await gotoPage(nextPage)
}

// Resolve a punishment inline
async function handleResolve(id: string) {
  await resolvePunishment(id)
}

// Open delete modal
function openDeleteModal(id: string) {
  punishmentToDeleteId.value = id
  showDeleteModal.value = true
}

// Open resolve modal
function openResolveModal(id: string) {
  punishmentToResolveId.value = id
  showResolveModal.value = true
}

// After delete confirmed
async function onDeleteConfirmed() {
  await reload(page.value)
}

// After resolve confirmed
async function onResolveConfirmed() {
  await reload(page.value)
}

// After creation
async function onCreated() {
  await reload(1)
}

function resetFilters() {
  classroomId.value = ''
  studentId.value = ''
  punishmentTypeId.value = ''
  state.value = ''
  automated.value = ''
  overdue.value = ''
  createdFrom.value = ''
  createdTo.value = ''
  dueFrom.value = ''
  dueTo.value = ''
}

// Watch filter changes
watch(
  [
    classroomId,
    studentId,
    punishmentTypeId,
    state,
    automated,
    overdue,
    createdFrom,
    createdTo,
    dueFrom,
    dueTo,
  ],
  () => {
    applyFilters({
      classroom_id: classroomId.value || undefined,
      student_id: studentId.value || undefined,
      punishment_type_id: punishmentTypeId.value || undefined,
      state: (state.value as 'pending' | 'resolved') || undefined,
      automated: automated.value || undefined,
      overdue: overdue.value || undefined,
      created_from: createdFrom.value || undefined,
      created_to: createdTo.value || undefined,
      due_from: dueFrom.value || undefined,
      due_to: dueTo.value || undefined,
    })
  },
)

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

async function fetchPunishmentTypeOptions(options: { page: number; search?: string }) {
  const response = await typeService.getPunishmentTypes(options)
  return {
    ...response,
    data: response.data.map((punishmentType) => ({
      id: punishmentType.id,
      name: punishmentType.name,
    })),
  }
}

await useAsyncData(
  () => `punishments:initial:${route.fullPath}`,
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
          {{ t('punishments.title') }}
        </h1>
      </template>

      <template #actions>
        <Button
          class="w-full justify-center cursor-pointer md:w-auto"
          @click="showCreateModal = true"
        >
          <Plus class="w-4 h-4" />
          {{ t('punishments.newPunishment') }}
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
        v-model="punishmentTypeId"
        :label="t('filters.type')"
        :placeholder="t('filters.allTypes')"
        :search-placeholder="t('filters.searchType')"
        :empty-text="t('filters.noTypeFound')"
        :fetch-options="fetchPunishmentTypeOptions"
      />

      <FilterSelect
        v-model="state"
        :label="t('filters.state')"
        :placeholder="t('filters.allStates')"
        :options="stateOptions"
      />

      <FilterSelect
        v-model="automated"
        :label="t('filters.automated')"
        :placeholder="t('filters.allStates')"
        :options="automatedOptions"
      />

      <FilterSelect
        v-model="overdue"
        :label="t('filters.overdue')"
        :placeholder="t('filters.allStates')"
        :options="overdueOptions"
      />

      <FilterDateRange
        v-model:from="createdFrom"
        v-model:to="createdTo"
        :label="t('filters.dateRange')"
      />

      <FilterDateRange
        v-model:from="dueFrom"
        v-model:to="dueTo"
        :label="t('filters.dueDateRange')"
      />
    </FilterBar>

    <div
      v-if="punishments.length === 0 && !loading"
      class="py-16 text-center text-muted-foreground"
    >
      {{ t('punishments.noPunishments') }}
    </div>

    <div v-else class="space-y-3">
      <PunishmentCard
        v-for="punishment in punishments"
        :key="punishment.id"
        :punishment-type-name="punishment.punishment_type_name"
        :automated="punishment.automated"
        :triggering-rule-id="punishment.triggering_rule_id"
        :triggering-rule-name="punishment.triggering_rule_name"
        :due-at="punishment.due_at"
        :resolved-at="punishment.resolved_at"
        :student-id="punishment.student_id"
        :student-first-name="punishment.student_first_name"
        :student-last-name="punishment.student_last_name"
      >
        <template #actions>
          <Button
            v-if="!punishment.resolved_at"
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer text-muted-foreground hover:text-foreground"
            :title="t('common.resolve')"
            :aria-label="t('common.resolve')"
            @click="openResolveModal(punishment.id)"
          >
            <CircleCheck class="w-5 h-5 text-green-400" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer text-muted-foreground hover:text-foreground"
            :title="t('modals.delete.confirm')"
            :aria-label="t('modals.delete.confirm')"
            @click="openDeleteModal(punishment.id)"
          >
            <Trash2 class="w-4 h-4 text-red-400" />
          </Button>
        </template>
      </PunishmentCard>
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

    <PunishmentCreateModal v-model:open="showCreateModal" @created="onCreated" />
    <PunishmentDeleteModal
      v-model:open="showDeleteModal"
      :punishment-id="punishmentToDeleteId"
      :delete-fn="deletePunishment"
      @confirmed="onDeleteConfirmed"
    />
    <PunishmentResolveModal
      v-model:open="showResolveModal"
      :punishment-id="punishmentToResolveId"
      :resolve-fn="handleResolve"
      @confirmed="onResolveConfirmed"
    />
  </div>
</template>
