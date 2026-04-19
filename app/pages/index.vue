<script setup lang="ts">
import type { DashboardResponse } from '~/types/api'
import {
  createLatestOnlyAsyncRunner,
  reloadDashboardSectionsOnClassroomChange,
  resetDashboardSectionPageOnCreate,
  type DashboardSectionKey,
} from '~/lib/dashboard-page'
import { computeTotalPages, formatPunishmentsProgress, formatRatio } from '~/lib/kpi-formatters'
import TrackingCreateMenu from '~/components/features/tracking/TrackingCreateMenu.vue'
import {
  mapBonusApiFiltersToSectionFilter,
  mapBonusSectionFilterToApiFilters,
  mapPunishmentApiFiltersToSectionFilter,
  mapPunishmentSectionFilterToApiFilters,
  type BonusSectionFilter,
  type PunishmentSectionFilter,
  useTrackingOverviewSectionFilters,
} from '~/composables/useTrackingOverviewSectionFilters'

const { t } = useI18n()
useSeoMeta({ title: () => t('common.titles.dashboard') })

const nuxtApp = useNuxtApp()
const route = useRoute()
const router = useRouter()

// Services
const dashboardService = useDashboardService()

// Classroom filter
const selectedClassroomId = ref<string>('')

// Dashboard data
const dashboard = useState<DashboardResponse | null>('dashboard:data', () => null)
const runLatestDashboardFetch = createLatestOnlyAsyncRunner<DashboardResponse>()

const {
  punishments: punishmentsSectionItems,
  loading: loadingPunishments,
  page: punishmentsPage,
  previousPage: previousPunishmentsPage,
  totalCount: punishmentsTotal,
  itemPerPage: punishmentsPerPage,
  filters: punishmentsSectionFilters,
  fetchPunishments,
  gotoPage: gotoPunishmentsPage,
  applyFilters: applyPunishmentsSectionFilters,
  resolvePunishment: resolvePunishmentApi,
} = useDashboardPunishments(selectedClassroomId)

const {
  bonuses: bonusesSectionItems,
  loading: loadingBonuses,
  page: bonusesPage,
  totalCount: bonusesTotal,
  itemPerPage: bonusesPerPage,
  filters: bonusesSectionFilters,
  fetchBonuses,
  gotoPage: gotoBonusesPage,
  applyFilters: applyBonusesSectionFilters,
} = useDashboardBonuses(selectedClassroomId)

const {
  penalties,
  loading: loadingPenalties,
  page: penaltiesPage,
  totalCount: penaltiesTotal,
  itemPerPage: penaltiesPerPage,
  fetchPenalties,
  gotoPage: gotoPenaltiesPage,
} = useDashboardPenalties(selectedClassroomId)

const penaltiesTotalPages = computed(() =>
  computeTotalPages(penaltiesTotal.value, penaltiesPerPage.value),
)
const bonusesTotalPages = computed(() =>
  computeTotalPages(bonusesTotal.value, bonusesPerPage.value),
)
const punishmentsTotalPages = computed(() =>
  computeTotalPages(punishmentsTotal.value, punishmentsPerPage.value),
)

// Modal states
const showBonusModal = ref(false)
const showPenaltyModal = ref(false)
const showPunishmentModal = ref(false)

const { bonusesFilterOptions, punishmentsFilterOptions } = useTrackingOverviewSectionFilters()

const bonusesFilter = computed<BonusSectionFilter>({
  get: () => mapBonusApiFiltersToSectionFilter(bonusesSectionFilters),
  set: (value) => {
    void applyBonusesSectionFilters(mapBonusSectionFilterToApiFilters(value))
  },
})

const punishmentsFilter = computed<PunishmentSectionFilter>({
  get: () => mapPunishmentApiFiltersToSectionFilter(punishmentsSectionFilters),
  set: (value) => {
    void applyPunishmentsSectionFilters(mapPunishmentSectionFilterToApiFilters(value))
  },
})

async function fetchDashboard(classroomId = selectedClassroomId.value) {
  const response = await runLatestDashboardFetch(() =>
    dashboardService.getDashboard({
      classroomId: classroomId || undefined,
    }),
  )

  if (response) {
    dashboard.value = response
  }
}

async function resolvePunishment(id: string) {
  await resolvePunishmentApi(id)
}

async function loadAllData(options?: {
  classroomId?: string
  bonusesPage?: number
  penaltiesPage?: number
  punishmentsPage?: number
}) {
  await Promise.all([
    fetchDashboard(options?.classroomId ?? selectedClassroomId.value),
    fetchPunishments(
      options?.punishmentsPage !== undefined ? { page: options.punishmentsPage } : undefined,
    ),
    fetchBonuses(options?.bonusesPage !== undefined ? { page: options.bonusesPage } : undefined),
    fetchPenalties(
      options?.penaltiesPage !== undefined ? { page: options.penaltiesPage } : undefined,
    ),
  ])
}

// Refresh dashboard after modal creation
async function onModalCreated(section: DashboardSectionKey) {
  const pages = {
    bonuses: bonusesPage.value,
    penalties: penaltiesPage.value,
    punishments: punishmentsPage.value,
  }
  const gotoPage = {
    bonuses: gotoBonusesPage,
    penalties: gotoPenaltiesPage,
    punishments: gotoPunishmentsPage,
  }
  const didResetPage = await resetDashboardSectionPageOnCreate(section, pages, gotoPage)

  await loadAllData({
    bonusesPage: didResetPage && section === 'bonuses' ? 1 : undefined,
    penaltiesPage: didResetPage && section === 'penalties' ? 1 : undefined,
    punishmentsPage: didResetPage && section === 'punishments' ? 1 : undefined,
  })
}

async function onPunishmentResolved() {
  await loadAllData()

  if (punishmentsSectionItems.value.length === 0 && previousPunishmentsPage.value !== null) {
    await gotoPunishmentsPage(previousPunishmentsPage.value)
  }
}

function updateBonusesFilter(value: string) {
  bonusesFilter.value = value as BonusSectionFilter
}

function updatePunishmentsFilter(value: string) {
  punishmentsFilter.value = value as PunishmentSectionFilter
}

// Watch filter changes
watch(selectedClassroomId, async (nextClassroomId, previousClassroomId) => {
  if (nextClassroomId === previousClassroomId) return

  await reloadDashboardSectionsOnClassroomChange({
    classroomId: nextClassroomId,
    query: route.query,
    loadAllData,
    replaceQuery: (query) => router.replace({ query }),
  })
})

if (import.meta.server || !nuxtApp.isHydrating) {
  await loadAllData()
}
</script>

<template>
  <div>
    <!-- Header & Filtre Global -->
    <PageHeaderBar align="start">
      <template #left>
        <h1 class="text-2xl font-bold tracking-tight whitespace-nowrap">
          {{ t('common.titles.dashboard') }}
        </h1>
        <ClassroomSelect v-model="selectedClassroomId" class="hidden lg:inline-flex" />
      </template>

      <template #actions>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center w-full lg:w-auto">
          <div class="flex-1 min-w-0 lg:hidden">
            <ClassroomSelect v-model="selectedClassroomId" />
          </div>
          <div class="shrink-0">
            <TrackingCreateMenu
              :create-label="t('common.actions.add')"
              :add-bonus-label="t('common.actions.addBonus')"
              :add-penalty-label="t('common.actions.addPenalty')"
              :add-punishment-label="t('common.actions.addPunishment')"
              @create-bonus="showBonusModal = true"
              @create-penalty="showPenaltyModal = true"
              @create-punishment="showPunishmentModal = true"
            />
          </div>
        </div>
      </template>
    </PageHeaderBar>

    <template v-if="dashboard">
      <!-- KPI Cards -->
      <DashboardKpiCards :kpis="dashboard.kpis" class="mb-8" />

      <!-- Historique Récent (Split View) -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PenaltiesSection
          :penalties="penalties"
          :title="t('common.titles.recentPenalties')"
          :empty-label="t('common.empty.noPenalties')"
          :badge-text="`${dashboard.kpis.penalty_count}`"
          :badge-help-text="t('common.kpiPopover.dashboardRecentPenalties')"
          :page="penaltiesPage"
          :total-pages="penaltiesTotalPages"
          :loading="loadingPenalties"
          list-class="space-y-3"
          show-student-details
          @update:page="gotoPenaltiesPage($event)"
        />
        <BonusesSection
          :bonuses="bonusesSectionItems"
          :title="t('common.titles.bonuses')"
          :empty-label="t('common.empty.noBonuses')"
          :badge-text="
            formatRatio(dashboard.kpis.available_bonus_points, dashboard.kpis.total_bonus_points)
          "
          :badge-help-text="t('common.kpiPopover.bonusAvailability')"
          :page="bonusesPage"
          :total-pages="bonusesTotalPages"
          :loading="loadingBonuses"
          :filter-options="bonusesFilterOptions"
          :filter-value="bonusesFilter"
          list-class="space-y-3"
          show-student-details
          @update:page="gotoBonusesPage($event)"
          @update:filter-value="updateBonusesFilter"
        />
      </div>

      <!-- Punitions -->
      <div class="mt-8">
        <PunishmentsSection
          :punishments="punishmentsSectionItems"
          :title="t('common.titles.punishments')"
          :empty-label="t('common.empty.noPunishments')"
          :show-count="true"
          compact
          :badge-text="
            formatPunishmentsProgress(
              dashboard.kpis.total_punishment_count,
              dashboard.kpis.pending_punishment_count,
              dashboard.kpis.overdue_punishment_count,
            )
          "
          :badge-help-text="t('common.kpiPopover.pendingPunishmentsProgress')"
          :page="punishmentsPage"
          :total-pages="punishmentsTotalPages"
          :loading="loadingPunishments"
          :filter-options="punishmentsFilterOptions"
          :filter-value="punishmentsFilter"
          :resolve-fn="resolvePunishment"
          @resolved="onPunishmentResolved"
          @update:page="gotoPunishmentsPage($event)"
          @update:filter-value="updatePunishmentsFilter"
        />
      </div>
    </template>

    <!-- Modals -->
    <BonusCreateModal
      v-model:open="showBonusModal"
      :preselected-classroom-id="selectedClassroomId || null"
      @created="onModalCreated('bonuses')"
    />
    <PenaltyCreateModal
      v-model:open="showPenaltyModal"
      :preselected-classroom-id="selectedClassroomId || null"
      @created="onModalCreated('penalties')"
    />
    <PunishmentCreateModal
      v-model:open="showPunishmentModal"
      :preselected-classroom-id="selectedClassroomId || null"
      @created="onModalCreated('punishments')"
    />
  </div>
</template>
