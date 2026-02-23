<script setup lang="ts">
import type { Classroom, DashboardResponse } from '~/types/api'
import { Star, AlertTriangle, Gavel } from 'lucide-vue-next'

const { t } = useI18n()
const route = useRoute()

// Services
const dashboardService = useDashboardService()
const punishmentService = usePunishmentService()

// Classroom filter
const { classrooms: allClassrooms, fetchClassrooms } = useAllClassrooms()
const classrooms = ref<Classroom[]>([])
const selectedClassroomId = ref<string>('')

// Dashboard data
const dashboard = ref<DashboardResponse | null>(null)
const loading = ref(true)

// Modal states
const showBonusModal = ref(false)
const showPenaltyModal = ref(false)
const showPunishmentModal = ref(false)

function snapshotClassrooms(list: readonly Classroom[]): Classroom[] {
  return list.map((classroom) => ({
    ...classroom,
    students_preview: classroom.students_preview.map((student) => ({ ...student })),
  }))
}

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
    await fetchClassrooms()

    const [dashboardData, classroomsData] = await Promise.all([
      dashboardService.getDashboard({
        classroomId: selectedClassroomId.value || undefined,
      }),
      Promise.resolve(snapshotClassrooms(allClassrooms.value)),
    ])

    return {
      classrooms: classroomsData,
      dashboard: dashboardData,
    }
  },
  {
    server: true,
  },
)

if (initialData.value) {
  classrooms.value = initialData.value.classrooms
  dashboard.value = initialData.value.dashboard
  loading.value = false
}
</script>

<template>
  <div>
    <!-- Header & Filtre Global -->
    <PageHeaderBar align="start">
      <template #left>
        <h1 class="text-2xl font-bold tracking-tight whitespace-nowrap">
          {{ t('dashboard.title') }}
        </h1>
        <ClassroomSelect v-model="selectedClassroomId" :classrooms="classrooms" />
      </template>

      <template #actions>
        <Button
          variant="outline"
          class="justify-center cursor-pointer"
          @click="showBonusModal = true"
        >
          <Star class="w-4 h-4" />
          {{ t('dashboard.newBonus') }}
        </Button>
        <Button
          variant="outline"
          class="justify-center cursor-pointer"
          @click="showPenaltyModal = true"
        >
          <AlertTriangle class="w-4 h-4" />
          {{ t('dashboard.newPenalty') }}
        </Button>
        <Button class="justify-center cursor-pointer" @click="showPunishmentModal = true">
          <Gavel class="w-4 h-4" />
          {{ t('dashboard.newPunishment') }}
        </Button>
      </template>
    </PageHeaderBar>

    <template v-if="dashboard">
      <!-- KPI Cards -->
      <DashboardKpiCards :kpis="dashboard.kpis" class="mb-8" />

      <!-- Historique Récent (Split View) -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DashboardRecentPenalties :penalties="dashboard.recent_penalties" />
        <DashboardRecentBonuses :bonuses="dashboard.recent_bonuses" />
      </div>

      <!-- Punitions en attente -->
      <div class="mt-8">
        <DashboardPendingPunishments
          :punishments="dashboard.pending_punishments"
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
