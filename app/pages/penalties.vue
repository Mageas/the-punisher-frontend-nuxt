<script setup lang="ts">
import { Pencil, Trash2 } from 'lucide-vue-next'
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

const classroomId = ref(filters.classroom_id || '')
const studentId = ref(filters.student_id || '')
const penaltyTypeId = ref(filters.penalty_type_id || '')
const createdFrom = ref(filters.created_from || '')
const createdTo = ref(filters.created_to || '')

const activeFilterCount = useActiveFilterCount([
  classroomId,
  studentId,
  penaltyTypeId,
  createdFrom,
  createdTo,
])

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const penaltyToDeleteId = ref<string | null>(null)
const penaltyToEdit = ref<Penalty | null>(null)

function buildFilters() {
  return {
    classroom_id: classroomId.value || undefined,
    student_id: studentId.value || undefined,
    penalty_type_id: penaltyTypeId.value || undefined,
    created_from: createdFrom.value || undefined,
    created_to: createdTo.value || undefined,
  }
}

const { safeItemsPerPage, reload, reloadCurrentPage, reloadFirstPage, onPageChange } =
  useTrackingListPage({
    page,
    itemPerPage,
    totalCount,
    gotoPage,
    fetchPage: fetchPenalties,
    buildFilters,
  })

function openDeleteModal(id: string) {
  penaltyToDeleteId.value = id
  showDeleteModal.value = true
}

function openEditModal(penalty: Penalty) {
  penaltyToEdit.value = penalty
  showEditModal.value = true
}

function resetFilters() {
  classroomId.value = ''
  studentId.value = ''
  penaltyTypeId.value = ''
  createdFrom.value = ''
  createdTo.value = ''
}

useTrackingFiltersSync({
  filterRefs: [classroomId, studentId, penaltyTypeId, createdFrom, createdTo],
  buildFilters,
  applyFilters,
  resetPairs: [{ source: classroomId, target: studentId }],
})

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
    <TrackingListPageHeader
      :title="t('common.titles.penalties')"
      :create-label="t('common.actions.addPenalty')"
      @create="showCreateModal = true"
    />

    <FilterBar :active-filter-count="activeFilterCount" @reset="resetFilters">
      <ClassroomStudentTypeFilters
        v-model:classroom-id="classroomId"
        v-model:student-id="studentId"
        v-model:type-id="penaltyTypeId"
        type-kind="penalty"
      />

      <FilterDateRange
        v-model:from="createdFrom"
        v-model:to="createdTo"
        :label="t('common.labels.dateRange')"
      />
    </FilterBar>

    <TrackingListEmptyState
      v-if="penalties.length === 0 && !loading"
      :items-count="penalties.length"
      :loading="loading"
      :message="t('common.empty.noPenalties')"
    />

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
          <TrackingCardActions>
            <TrackingCardActionButton
              :label="t('common.actions.edit')"
              @click="openEditModal(penalty)"
            >
              <Pencil class="h-4 w-4" />
            </TrackingCardActionButton>

            <TrackingCardActionButton
              :label="t('common.actions.delete')"
              @click="openDeleteModal(penalty.id)"
            >
              <Trash2 class="h-4 w-4 text-danger" />
            </TrackingCardActionButton>
          </TrackingCardActions>
        </template>
      </PenaltyCard>
    </div>

    <TrackingPagePagination
      :page="page"
      :items-per-page="safeItemsPerPage"
      :total="totalCount"
      :loading="loading"
      @update:page="onPageChange"
    />

    <PenaltyCreateModal v-model:open="showCreateModal" @created="reloadFirstPage" />
    <PenaltyEditModal
      v-model:open="showEditModal"
      :penalty="penaltyToEdit"
      @updated="reloadCurrentPage"
    />
    <PenaltyDeleteModal
      v-model:open="showDeleteModal"
      :penalty-id="penaltyToDeleteId"
      :delete-fn="deletePenalty"
      @confirmed="reloadCurrentPage"
    />
  </div>
</template>
