<script setup lang="ts">
import type { DashboardResponse } from '~/types/api'
import { Star, AlertTriangle, Gavel } from 'lucide-vue-next'
import BonusCreateModal from '~/components/modals/BonusCreateModal.vue'
import PenaltyCreateModal from '~/components/modals/PenaltyCreateModal.vue'
import PunishmentCreateModal from '~/components/modals/PunishmentCreateModal.vue'
import PunishmentResolveModal from '~/components/modals/PunishmentResolveModal.vue'

const { t } = useI18n()
const { $api } = useNuxtApp()

// Classroom filter
const { classrooms, fetchClassrooms } = useAllClassrooms()
const selectedClassroomId = ref<string>('')

// Dashboard data
const dashboard = ref<DashboardResponse | null>(null)
const loading = ref(true)

// Modal states
const showBonusModal = ref(false)
const showPenaltyModal = ref(false)
const showPunishmentModal = ref(false)
const showResolveModal = ref(false)
const punishmentToResolveId = ref<string | null>(null)

// Fetch dashboard data
async function fetchDashboard() {
  loading.value = true
  const params: Record<string, string> = {}
  if (selectedClassroomId.value) {
    params.classroom_id = selectedClassroomId.value
  }
  dashboard.value = await $api<DashboardResponse>('/dashboard', { params })
  loading.value = false
}

// Resolve a punishment
async function resolvePunishment(id: string) {
  await $api(`/punishments/${id}/resolve`, { method: 'POST' })
}

function openResolveModal(id: string) {
  punishmentToResolveId.value = id
  showResolveModal.value = true
}

function onResolveConfirmed() {
  fetchDashboard()
}

// Refresh dashboard after modal creation
function onModalCreated() {
  fetchDashboard()
}

// Watch filter changes
watch(selectedClassroomId, () => {
  fetchDashboard()
})

// Initial load
await Promise.all([fetchClassrooms(), fetchDashboard()])
</script>

<template>
  <div>
    <!-- Header & Filtre Global -->
    <div class="mb-8 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div class="flex flex-wrap items-center gap-4">
        <h1 class="text-2xl font-bold tracking-tight whitespace-nowrap">
          {{ t('dashboard.title') }}
        </h1>
        <ClassroomSelect v-model="selectedClassroomId" :classrooms="classrooms" />
      </div>
      <div class="flex flex-wrap gap-2 xl:justify-end">
        <Button variant="outline" class="justify-center cursor-pointer" @click="showBonusModal = true">
          <Star class="w-4 h-4" />
          {{ t('dashboard.newBonus') }}
        </Button>
        <Button variant="outline" class="justify-center cursor-pointer" @click="showPenaltyModal = true">
          <AlertTriangle class="w-4 h-4" />
          {{ t('dashboard.newPenalty') }}
        </Button>
        <Button class="justify-center cursor-pointer" @click="showPunishmentModal = true">
          <Gavel class="w-4 h-4" />
          {{ t('dashboard.newPunishment') }}
        </Button>
      </div>
    </div>

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
          @resolve="openResolveModal"
        />
      </div>
    </template>

    <!-- Modals -->
    <BonusCreateModal v-model:open="showBonusModal" @created="onModalCreated" />
    <PenaltyCreateModal v-model:open="showPenaltyModal" @created="onModalCreated" />
    <PunishmentCreateModal v-model:open="showPunishmentModal" @created="onModalCreated" />
    <PunishmentResolveModal
      v-model:open="showResolveModal"
      :punishment-id="punishmentToResolveId"
      :resolve-fn="resolvePunishment"
      @confirmed="onResolveConfirmed"
    />
  </div>
</template>
