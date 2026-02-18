<script setup lang="ts">
import type { DashboardResponse } from '~/types/api'
import { Star, AlertTriangle, Gavel } from 'lucide-vue-next'

const { t } = useI18n()
const { $api } = useNuxtApp()

// Classroom filter
const { classrooms, fetchAllClassrooms } = useClassrooms()
const selectedClassroomId = ref<string>('')

// Dashboard data
const dashboard = ref<DashboardResponse | null>(null)
const loading = ref(true)

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
  await fetchDashboard()
}

// Watch filter changes
watch(selectedClassroomId, () => {
  fetchDashboard()
})

// Initial load
await Promise.all([fetchAllClassrooms(), fetchDashboard()])
</script>

<template>
  <div>
    <!-- Header & Filtre Global -->
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
      <div class="flex items-center gap-4 shrink-0">
        <h1 class="text-2xl font-bold tracking-tight whitespace-nowrap">
          {{ t('dashboard.title') }}
        </h1>
        <ClassroomSelect v-model="selectedClassroomId" :classrooms="classrooms" />
      </div>
      <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <Button variant="outline" class="justify-center">
          <Star class="w-4 h-4" />
          {{ t('dashboard.newBonus') }}
        </Button>
        <Button variant="outline" class="justify-center">
          <AlertTriangle class="w-4 h-4" />
          {{ t('dashboard.newPenalty') }}
        </Button>
        <Button class="justify-center">
          <Gavel class="w-4 h-4" />
          {{ t('dashboard.newPunishment') }}
        </Button>
      </div>
    </div>

    <template v-if="dashboard">
      <!-- KPI Cards -->
      <DashboardKpiCards :kpis="dashboard.kpis" class="mb-8" />

      <!-- Historique Récent (Split View) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardRecentPenalties :penalties="dashboard.recent_penalties" />
        <DashboardRecentBonuses :bonuses="dashboard.recent_bonuses" />
      </div>

      <!-- Punitions en attente -->
      <div class="mt-8">
        <DashboardPendingPunishments
          :punishments="dashboard.pending_punishments"
          @resolve="resolvePunishment"
        />
      </div>
    </template>
  </div>
</template>
