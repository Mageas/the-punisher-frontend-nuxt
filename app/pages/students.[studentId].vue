<script setup lang="ts">
import {
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  Gavel,
  Pencil,
  Star,
  Trash2,
} from 'lucide-vue-next'
import type {
  Student,
  StudentHistoryBonusItem,
  StudentHistoryItem,
  StudentHistoryPunishmentItem,
  StudentKpis,
} from '~/types/api'
import BonusCreateModal from '~/components/modals/BonusCreateModal.vue'
import PenaltyCreateModal from '~/components/modals/PenaltyCreateModal.vue'
import PunishmentCreateModal from '~/components/modals/PunishmentCreateModal.vue'
import StudentDeleteModal from '~/components/modals/StudentDeleteModal.vue'
import StudentEditModal from '~/components/modals/StudentEditModal.vue'

definePageMeta({
  path: '/students/:studentId',
})

const { t } = useI18n()
const route = useRoute()
const { $api } = useNuxtApp()

const studentId = computed(() => {
  const routeStudentId = route.params.studentId
  return Array.isArray(routeStudentId) ? routeStudentId[0] : routeStudentId
})

if (!studentId.value) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Missing student id',
  })
}

const student = ref<Student | null>(null)
const kpis = ref<StudentKpis | null>(null)
const history = ref<StudentHistoryItem[]>([])
const loading = ref(false)

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showBonusCreateModal = ref(false)
const showPenaltyCreateModal = ref(false)
const showPunishmentCreateModal = ref(false)

const pendingPunishments = computed(() =>
  history.value.filter((item): item is StudentHistoryPunishmentItem => {
    return item.type === 'punishment' && !item.resolved_at
  }),
)

const availableBonuses = computed(() =>
  history.value.filter((item): item is StudentHistoryBonusItem => {
    return item.type === 'bonus' && !item.used_at
  }),
)

const initials = computed(() => {
  if (!student.value) return ''
  const firstInitial = student.value.first_name?.charAt(0) ?? ''
  const lastInitial = student.value.last_name?.charAt(0) ?? ''
  return `${firstInitial}${lastInitial}`.toUpperCase()
})

async function fetchStudentProfile() {
  loading.value = true
  try {
    const [studentRes, kpisRes, historyRes] = await Promise.all([
      $api<Student>(`/students/${studentId.value}`),
      $api<StudentKpis>(`/students/${studentId.value}/kpis`),
      $api<StudentHistoryItem[]>(`/students/${studentId.value}/history`),
    ])
    student.value = studentRes
    kpis.value = kpisRes
    history.value = historyRes
  }
  finally {
    loading.value = false
  }
}

async function resolvePunishment(id: string) {
  await $api(`/punishments/${id}/resolve`, {
    method: 'POST',
  })
}

async function useBonus(id: string) {
  await $api(`/bonuses/${id}/use`, {
    method: 'POST',
  })
}

async function deleteStudent(id: string) {
  await $api(`/students/${id}`, {
    method: 'DELETE',
  })
}

function onActionConfirmed() {
  fetchStudentProfile()
}

async function onDeleteConfirmed() {
  await navigateTo('/students')
}

function onCreated() {
  fetchStudentProfile()
}

await fetchStudentProfile()

watch(studentId, (nextStudentId, previousStudentId) => {
  if (!nextStudentId || nextStudentId === previousStudentId) return
  fetchStudentProfile()
})
</script>

<template>
  <div>
    <div class="mb-6">
      <NuxtLink to="/students" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft class="w-4 h-4" />
        {{ t('studentProfile.backToStudents') }}
      </NuxtLink>
    </div>

    <template v-if="student && kpis">
      <div class="mb-8">
        <div class="mb-4 flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-xl font-semibold shrink-0">
            {{ initials }}
          </div>
          <div class="min-w-0">
            <h1 class="text-2xl font-bold tracking-tight">
              {{ student.first_name }} {{ student.last_name }}
            </h1>
            <div class="mt-1 flex flex-wrap gap-1.5">
              <Badge
                v-for="classroom in student.classrooms"
                :key="classroom.id"
                variant="outline"
                class="text-muted-foreground"
              >
                {{ classroom.name }}
              </Badge>
              <Badge v-if="student.classrooms.length === 0" variant="outline" class="text-muted-foreground">
                {{ t('students.noClassroom') }}
              </Badge>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <Button variant="outline" class="cursor-pointer" @click="showEditModal = true">
            <Pencil class="w-4 h-4" />
            {{ t('studentProfile.actions.edit') }}
          </Button>
          <Button variant="outline" class="cursor-pointer" @click="showBonusCreateModal = true">
            <Star class="w-4 h-4" />
            {{ t('studentProfile.actions.addBonus') }}
          </Button>
          <Button variant="outline" class="cursor-pointer" @click="showPenaltyCreateModal = true">
            <AlertTriangle class="w-4 h-4" />
            {{ t('studentProfile.actions.addPenalty') }}
          </Button>
          <Button variant="outline" class="cursor-pointer" @click="showPunishmentCreateModal = true">
            <Gavel class="w-4 h-4" />
            {{ t('studentProfile.actions.addPunishment') }}
          </Button>
          <Button variant="outline" class="cursor-pointer text-destructive hover:text-destructive" @click="showDeleteModal = true">
            <Trash2 class="w-4 h-4" />
            {{ t('studentProfile.actions.delete') }}
          </Button>
        </div>
      </div>

      <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="rounded-lg border border-border p-6">
          <div class="mb-2 flex items-center justify-between">
            <p class="text-sm font-medium text-muted-foreground">
              {{ t('studentProfile.kpis.availableBonusPoints') }}
            </p>
            <Star class="w-4 h-4 text-amber-400" />
          </div>
          <p class="text-3xl font-bold text-amber-400">
            {{ kpis.available_bonus_points }}
          </p>
          <p class="mt-1 text-xs text-muted-foreground">
            {{ t('studentProfile.kpis.activeBonusCount', kpis.active_bonus_count) }}
          </p>
        </div>

        <div class="rounded-lg border border-border p-6">
          <div class="mb-2 flex items-center justify-between">
            <p class="text-sm font-medium text-muted-foreground">
              {{ t('studentProfile.kpis.totalPenaltyCount') }}
            </p>
            <AlertCircle class="w-4 h-4 text-muted-foreground" />
          </div>
          <p class="text-3xl font-bold">
            {{ kpis.total_penalty_count }}
          </p>
        </div>

        <div class="rounded-lg border border-border p-6">
          <div class="mb-2 flex items-center justify-between">
            <p class="text-sm font-medium text-muted-foreground">
              {{ t('studentProfile.kpis.pendingPunishmentCount') }}
            </p>
            <Gavel class="w-4 h-4 text-red-400" />
          </div>
          <p class="text-3xl font-bold text-red-400">
            {{ kpis.pending_punishment_count }}
          </p>
        </div>
      </div>

      <HistoryPendingPunishmentsSection
        class="mb-8"
        :punishments="pendingPunishments"
        :resolve-fn="resolvePunishment"
        @resolved="onActionConfirmed"
      />

      <HistoryAvailableBonusesSection
        class="mb-8"
        :bonuses="availableBonuses"
        :use-fn="useBonus"
        @used="onActionConfirmed"
      />

      <HistoryTimelineSection :history="history" />
    </template>

    <div v-else-if="loading" class="py-16 text-center text-muted-foreground">
      {{ t('studentProfile.loading') }}
    </div>

    <StudentEditModal
      v-model:open="showEditModal"
      :student-id="student?.id ?? null"
      :first-name="student?.first_name ?? ''"
      :last-name="student?.last_name ?? ''"
      @updated="onActionConfirmed"
    />
    <StudentDeleteModal
      v-model:open="showDeleteModal"
      :student-id="student?.id ?? null"
      :delete-fn="deleteStudent"
      @confirmed="onDeleteConfirmed"
    />
    <BonusCreateModal
      v-model:open="showBonusCreateModal"
      :preselected-student-id="student?.id ?? null"
      :preselected-classroom-id="student?.classrooms?.[0]?.id ?? null"
      @created="onCreated"
    />
    <PenaltyCreateModal
      v-model:open="showPenaltyCreateModal"
      :preselected-student-id="student?.id ?? null"
      :preselected-classroom-id="student?.classrooms?.[0]?.id ?? null"
      @created="onCreated"
    />
    <PunishmentCreateModal
      v-model:open="showPunishmentCreateModal"
      :preselected-student-id="student?.id ?? null"
      :preselected-classroom-id="student?.classrooms?.[0]?.id ?? null"
      @created="onCreated"
    />
  </div>
</template>
