<script setup lang="ts">
import { CircleCheck, Pencil, Plus, Trash2 } from 'lucide-vue-next'
import type { Punishment } from '~/types/api'

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
  { value: 'pending', label: t('common.states.pending') },
  { value: 'resolved', label: t('common.states.resolved') },
])

const automatedOptions = computed(() => [
  { value: 'true', label: t('common.states.automatedYes') },
  { value: 'false', label: t('common.states.automatedNo') },
])

const overdueOptions = computed(() => [{ value: 'true', label: t('common.states.overdueOnly') }])

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
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showResolveModal = ref(false)
const punishmentToDeleteId = ref<string | null>(null)
const punishmentToResolveId = ref<string | null>(null)
const punishmentToEdit = ref<Punishment | null>(null)

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

// Open edit modal
function openEditModal(punishment: Punishment) {
  punishmentToEdit.value = punishment
  showEditModal.value = true
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

async function onUpdated() {
  await reload(page.value)
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
          {{ t('common.titles.punishments') }}
        </h1>
      </template>

      <template #actions>
        <Button
          class="w-full justify-center cursor-pointer md:w-auto"
          @click="showCreateModal = true"
        >
          <Plus class="w-4 h-4" />
          {{ t('common.actions.addPunishment') }}
        </Button>
      </template>
    </PageHeaderBar>

    <FilterBar :active-filter-count="activeFilterCount" @reset="resetFilters">
      <FilterIdNameSelect
        v-model="classroomId"
        :label="t('common.labels.classroom')"
        :placeholder="t('common.options.allClassrooms')"
        :search-placeholder="t('common.placeholders.searchClassroom')"
        :empty-text="t('common.empty.noClasses')"
        :fetch-options="fetchClassroomOptions"
      />

      <FilterIdNameSelect
        v-model="studentId"
        :label="t('common.labels.student')"
        :placeholder="t('common.options.allStudents')"
        :search-placeholder="t('common.placeholders.searchStudent')"
        :empty-text="t('common.empty.noStudents')"
        :fetch-options="fetchStudentOptions"
        :options-scope-key="studentFilterScopeKey"
      />

      <FilterIdNameSelect
        v-model="punishmentTypeId"
        :label="t('common.labels.type')"
        :placeholder="t('common.options.allTypes')"
        :search-placeholder="t('common.placeholders.searchType')"
        :empty-text="t('common.empty.noTypeFound')"
        :fetch-options="fetchPunishmentTypeOptions"
      />

      <FilterSelect
        v-model="state"
        :label="t('common.labels.state')"
        :placeholder="t('common.options.allStates')"
        :options="stateOptions"
      />

      <FilterSelect
        v-model="automated"
        :label="t('filters.automated')"
        :placeholder="t('common.options.allStates')"
        :options="automatedOptions"
      />

      <FilterSelect
        v-model="overdue"
        :label="t('filters.overdue')"
        :placeholder="t('common.options.allStates')"
        :options="overdueOptions"
      />

      <FilterDateRange
        v-model:from="createdFrom"
        v-model:to="createdTo"
        :label="t('common.labels.dateRange')"
      />

      <FilterDateRange
        v-model:from="dueFrom"
        v-model:to="dueTo"
        :label="t('common.labels.dueDateRange')"
      />
    </FilterBar>

    <div
      v-if="punishments.length === 0 && !loading"
      class="py-16 text-center text-muted-foreground"
    >
      {{ t('common.empty.noPunishments') }}
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
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer text-muted-foreground hover:text-foreground"
            :title="t('common.actions.edit')"
            :aria-label="t('common.actions.edit')"
            @click="openEditModal(punishment)"
          >
            <Pencil class="w-4 h-4" />
          </Button>

          <Button
            v-if="!punishment.resolved_at"
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer text-muted-foreground hover:text-foreground"
            :title="t('common.actions.resolve')"
            :aria-label="t('common.actions.resolve')"
            @click="openResolveModal(punishment.id)"
          >
            <CircleCheck class="w-5 h-5 text-success" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer text-muted-foreground hover:text-foreground"
            :title="t('common.actions.delete')"
            :aria-label="t('common.actions.delete')"
            @click="openDeleteModal(punishment.id)"
          >
            <Trash2 class="w-4 h-4 text-danger" />
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
    <PunishmentEditModal
      v-model:open="showEditModal"
      :punishment="punishmentToEdit"
      @updated="onUpdated"
    />
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
