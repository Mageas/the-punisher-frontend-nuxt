<script setup lang="ts">
import { Gift, Pencil, Trash2 } from 'lucide-vue-next'
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

const classroomId = ref(filters.classroom_id || '')
const studentId = ref(filters.student_id || '')
const bonusTypeId = ref(filters.bonus_type_id || '')
const state = ref(filters.state || '')
const createdFrom = ref(filters.created_from || '')
const createdTo = ref(filters.created_to || '')

const stateOptions = computed(() => [
  { value: 'unused', label: t('common.states.unused') },
  { value: 'used', label: t('common.states.used') },
])

const activeFilterCount = useActiveFilterCount([
  classroomId,
  studentId,
  bonusTypeId,
  state,
  createdFrom,
  createdTo,
])

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showUseModal = ref(false)
const bonusToDeleteId = ref<string | null>(null)
const bonusToUseId = ref<string | null>(null)
const bonusToEdit = ref<Bonus | null>(null)

function buildFilters() {
  return {
    classroom_id: classroomId.value || undefined,
    student_id: studentId.value || undefined,
    bonus_type_id: bonusTypeId.value || undefined,
    state: (state.value as 'used' | 'unused') || undefined,
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
    fetchPage: fetchBonuses,
    buildFilters,
  })

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

function resetFilters() {
  classroomId.value = ''
  studentId.value = ''
  bonusTypeId.value = ''
  state.value = ''
  createdFrom.value = ''
  createdTo.value = ''
}

useTrackingFiltersSync({
  filterRefs: [classroomId, studentId, bonusTypeId, state, createdFrom, createdTo],
  buildFilters,
  applyFilters,
  resetPairs: [{ source: classroomId, target: studentId }],
})

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
    <TrackingListPageHeader
      :title="t('common.titles.bonuses')"
      :create-label="t('common.actions.addBonus')"
      @create="showCreateModal = true"
    />

    <FilterBar :active-filter-count="activeFilterCount" @reset="resetFilters">
      <ClassroomStudentTypeFilters
        v-model:classroom-id="classroomId"
        v-model:student-id="studentId"
        v-model:type-id="bonusTypeId"
        type-kind="bonus"
      />

      <FilterSelect
        v-model="state"
        :label="t('common.labels.state')"
        :placeholder="t('common.options.allStates')"
        :options="stateOptions"
      />

      <FilterDateRange
        v-model:from="createdFrom"
        v-model:to="createdTo"
        :label="t('common.labels.dateRange')"
      />
    </FilterBar>

    <TrackingListEmptyState
      v-if="bonuses.length === 0 && !loading"
      :items-count="bonuses.length"
      :loading="loading"
      :message="t('common.empty.noBonuses')"
    />

    <div v-else class="space-y-3">
      <BonusCard
        v-for="bonus in bonuses"
        :key="bonus.id"
        :bonus-type-name="bonus.bonus_type_name"
        :points="bonus.points"
        :used-at="bonus.used_at"
        :occurred-at="bonus.occurred_at ?? bonus.created_at"
        :created-at="bonus.created_at"
        :student-id="bonus.student_id"
        :student-first-name="bonus.student_first_name"
        :student-last-name="bonus.student_last_name"
      >
        <template #actions>
          <TrackingCardActions>
            <TrackingCardActionButton
              :label="t('common.actions.edit')"
              @click="openEditModal(bonus)"
            >
              <Pencil class="h-4 w-4" />
            </TrackingCardActionButton>

            <TrackingCardActionButton
              v-if="!bonus.used_at"
              :label="t('common.actions.consume')"
              @click="openUseModal(bonus.id)"
            >
              <Gift class="h-5 w-5 text-warning" />
            </TrackingCardActionButton>

            <TrackingCardActionButton
              :label="t('common.actions.delete')"
              @click="openDeleteModal(bonus.id)"
            >
              <Trash2 class="h-4 w-4 text-danger" />
            </TrackingCardActionButton>
          </TrackingCardActions>
        </template>
      </BonusCard>
    </div>

    <TrackingPagePagination
      :page="page"
      :items-per-page="safeItemsPerPage"
      :total="totalCount"
      :loading="loading"
      @update:page="onPageChange"
    />

    <BonusCreateModal v-model:open="showCreateModal" @created="reloadFirstPage" />
    <BonusEditModal
      v-model:open="showEditModal"
      :bonus="bonusToEdit"
      @updated="reloadCurrentPage"
    />
    <BonusDeleteModal
      v-model:open="showDeleteModal"
      :bonus-id="bonusToDeleteId"
      :delete-fn="deleteBonus"
      @confirmed="reloadCurrentPage"
    />
    <BonusUseModal
      v-model:open="showUseModal"
      :bonus-id="bonusToUseId"
      :use-fn="handleUse"
      @confirmed="reloadCurrentPage"
    />
  </div>
</template>
