<script setup lang="ts">
import { CircleCheck, Pencil, Trash2 } from 'lucide-vue-next'
import type { Punishment } from '~/types/api'

const { t } = useI18n()
useSeoMeta({ title: () => t('common.titles.punishments') })

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

const stateOptions = computed(() => [
  { value: 'pending', label: t('common.states.pending') },
  { value: 'resolved', label: t('common.states.resolved') },
])

const automatedOptions = computed(() => [
  { value: 'true', label: t('common.states.automatedYes') },
  { value: 'false', label: t('common.states.automatedNo') },
])

const overdueOptions = computed(() => [{ value: 'true', label: t('common.states.overdueOnly') }])

const activeFilterCount = useActiveFilterCount([
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
])

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showResolveModal = ref(false)
const punishmentToDeleteId = ref<string | null>(null)
const punishmentToResolveId = ref<string | null>(null)
const punishmentToEdit = ref<Punishment | null>(null)

function buildFilters() {
  return {
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
  }
}

const { safeItemsPerPage, reload, reloadCurrentPage, reloadFirstPage, onPageChange } =
  useTrackingListPage({
    page,
    itemPerPage,
    totalCount,
    gotoPage,
    fetchPage: fetchPunishments,
    buildFilters,
  })

function openDeleteModal(id: string) {
  punishmentToDeleteId.value = id
  showDeleteModal.value = true
}

function openEditModal(punishment: Punishment) {
  punishmentToEdit.value = punishment
  showEditModal.value = true
}

function openResolveModal(id: string) {
  punishmentToResolveId.value = id
  showResolveModal.value = true
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

useTrackingFiltersSync({
  filterRefs: [
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
  buildFilters,
  applyFilters,
  resetPairs: [{ source: classroomId, target: studentId }],
})

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
    <TrackingListPageHeader
      :title="t('common.titles.punishments')"
      :create-label="t('common.actions.addPunishment')"
      @create="showCreateModal = true"
    />

    <FilterBar :active-filter-count="activeFilterCount" @reset="resetFilters">
      <ClassroomStudentTypeFilters
        v-model:classroom-id="classroomId"
        v-model:student-id="studentId"
        v-model:type-id="punishmentTypeId"
        type-kind="punishment"
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

    <TrackingListEmptyState
      v-if="punishments.length === 0 && !loading"
      :items-count="punishments.length"
      :loading="loading"
      :message="t('common.empty.noPunishments')"
    />

    <div v-else class="space-y-3">
      <PunishmentCard
        v-for="punishment in punishments"
        :key="punishment.id"
        :punishment-type-name="punishment.punishment_type_name"
        :automated="punishment.automated"
        :triggering-rule-id="punishment.triggering_rule_id"
        :triggering-rule-name="punishment.triggering_rule_name"
        :evaluation-label="punishment.evaluation_label"
        :due-at="punishment.due_at"
        :resolved-at="punishment.resolved_at"
        :student-id="punishment.student_id"
        :student-first-name="punishment.student_first_name"
        :student-last-name="punishment.student_last_name"
      >
        <template #actions>
          <TrackingCardActions>
            <TrackingCardActionButton
              :label="t('common.actions.edit')"
              @click="openEditModal(punishment)"
            >
              <Pencil class="h-4 w-4" />
            </TrackingCardActionButton>

            <TrackingCardActionButton
              v-if="!punishment.resolved_at"
              :label="t('common.actions.resolve')"
              @click="openResolveModal(punishment.id)"
            >
              <CircleCheck class="h-5 w-5 text-success" />
            </TrackingCardActionButton>

            <TrackingCardActionButton
              :label="t('common.actions.delete')"
              @click="openDeleteModal(punishment.id)"
            >
              <Trash2 class="h-4 w-4 text-danger" />
            </TrackingCardActionButton>
          </TrackingCardActions>
        </template>
      </PunishmentCard>
    </div>

    <TrackingPagePagination
      :page="page"
      :items-per-page="safeItemsPerPage"
      :total="totalCount"
      :loading="loading"
      @update:page="onPageChange"
    />

    <PunishmentCreateModal v-model:open="showCreateModal" @created="reloadFirstPage" />
    <PunishmentEditModal
      v-model:open="showEditModal"
      :punishment="punishmentToEdit"
      @updated="reloadCurrentPage"
    />
    <PunishmentDeleteModal
      v-model:open="showDeleteModal"
      :punishment-id="punishmentToDeleteId"
      :delete-fn="deletePunishment"
      @confirmed="reloadCurrentPage"
    />
    <PunishmentResolveModal
      v-model:open="showResolveModal"
      :punishment-id="punishmentToResolveId"
      :resolve-fn="resolvePunishment"
      @confirmed="reloadCurrentPage"
    />
  </div>
</template>
