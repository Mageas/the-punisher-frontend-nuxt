<script setup lang="ts">
import type { DashboardResponse } from '~/types/api'
import { formatPunishmentsProgress, formatRatio } from '~/lib/kpi-formatters'
import TrackingCreateMenu from '~/components/features/tracking/TrackingCreateMenu.vue'

const { t } = useI18n()
const route = useRoute()

// Services
const dashboardService = useDashboardService()
const punishmentService = usePunishmentService()

// Classroom filter
const selectedClassroomId = ref<string>('')

// Dashboard data
const dashboard = ref<DashboardResponse | null>(null)
const loading = ref(true)

// Modal states
const showBonusModal = ref(false)
const showPenaltyModal = ref(false)
const showPunishmentModal = ref(false)

async function fetchDashboard() {
  loading.value = true

  try {
    dashboard.value = await dashboardService.getDashboard({
      classroomId: selectedClassroomId.value || undefined,
    })
  } finally {
    loading.value = false
  }
}

async function resolvePunishment(id: string) {
  await punishmentService.resolvePunishment(id, {})
}

// Refresh dashboard after modal creation
async function onModalCreated() {
  await fetchDashboard()
}

// Watch filter changes
watch(selectedClassroomId, async () => {
  await fetchDashboard()
})

const { data: initialData } = await useAsyncData(
  () => `dashboard:initial:${route.fullPath}`,
  async () => {
    return dashboardService.getDashboard({
      classroomId: selectedClassroomId.value || undefined,
    })
  },
  {
    server: true,
  },
)

if (initialData.value) {
  dashboard.value = initialData.value
  loading.value = false
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
        <DashboardRecentPenalties
          :penalties="dashboard.recent_penalties"
          :badge-text="`${dashboard.kpis.penalty_count}`"
          :badge-help-text="t('common.kpiPopover.dashboardRecentPenalties')"
        />
        <DashboardRecentBonuses
          :bonuses="dashboard.recent_bonuses"
          :badge-text="
            formatRatio(dashboard.kpis.available_bonus_points, dashboard.kpis.total_bonus_points)
          "
          :badge-help-text="t('common.kpiPopover.bonusAvailability')"
        />
      </div>

      <!-- Punitions en attente -->
      <div class="mt-8">
        <DashboardPendingPunishments
          :punishments="dashboard.pending_punishments"
          :badge-text="
            formatPunishmentsProgress(
              dashboard.kpis.total_punishment_count,
              dashboard.kpis.pending_punishment_count,
              dashboard.kpis.overdue_punishment_count,
            )
          "
          :badge-help-text="t('common.kpiPopover.pendingPunishmentsProgress')"
          :resolve-fn="resolvePunishment"
          @resolved="onModalCreated"
        />
      </div>
    </template>

    <!-- Modals -->
    <BonusCreateModal
      v-model:open="showBonusModal"
      :preselected-classroom-id="selectedClassroomId || null"
      @created="onModalCreated"
    />
    <PenaltyCreateModal
      v-model:open="showPenaltyModal"
      :preselected-classroom-id="selectedClassroomId || null"
      @created="onModalCreated"
    />
    <PunishmentCreateModal
      v-model:open="showPunishmentModal"
      :preselected-classroom-id="selectedClassroomId || null"
      @created="onModalCreated"
    />
  </div>
</template>
