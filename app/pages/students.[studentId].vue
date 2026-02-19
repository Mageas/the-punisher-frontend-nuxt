<script setup lang="ts">
import {
  AlertCircle,
  AlertTriangle,
  ChevronLeft,
  CircleCheck,
  Gift,
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
import BonusUseModal from '~/components/modals/BonusUseModal.vue'
import PenaltyCreateModal from '~/components/modals/PenaltyCreateModal.vue'
import PunishmentCreateModal from '~/components/modals/PunishmentCreateModal.vue'
import PunishmentResolveModal from '~/components/modals/PunishmentResolveModal.vue'
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
const showUseBonusModal = ref(false)
const showResolvePunishmentModal = ref(false)
const bonusToUseId = ref<string | null>(null)
const punishmentToResolveId = ref<string | null>(null)

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

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function eventDotClass(item: StudentHistoryItem): string {
  if (item.type === 'bonus') return 'bg-amber-400'
  if (item.type === 'penalty') return 'bg-orange-400'
  return 'bg-red-400'
}

function punishmentSubtitle(item: StudentHistoryPunishmentItem): string {
  if (item.triggering_rule_name) return item.triggering_rule_name
  return t('punishments.manualPunishment')
}

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

function openResolvePunishmentModal(id: string) {
  punishmentToResolveId.value = id
  showResolvePunishmentModal.value = true
}

function openUseBonusModal(id: string) {
  bonusToUseId.value = id
  showUseBonusModal.value = true
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

      <div class="mb-8">
        <h2 class="mb-4 text-lg font-semibold">
          {{ t('studentProfile.pendingPunishments') }}
        </h2>
        <div v-if="pendingPunishments.length === 0" class="rounded-lg border border-border p-6 text-sm text-muted-foreground">
          {{ t('studentProfile.empty.pendingPunishments') }}
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="punishment in pendingPunishments"
            :key="punishment.id"
            class="flex flex-wrap items-center gap-4 rounded-lg border border-border p-4 sm:flex-nowrap"
          >
            <div class="w-9 h-9 rounded-full bg-red-400/10 flex items-center justify-center flex-shrink-0">
              <Gavel class="w-4 h-4 text-red-400" />
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <p class="text-sm font-medium">
                  {{ punishment.punishment_type_name }}
                </p>
                <Badge
                  v-if="punishment.triggering_rule_id"
                  variant="outline"
                  class="text-xs text-blue-400 border-blue-400/30"
                >
                  {{ t('common.auto') }}
                </Badge>
              </div>
              <p class="mt-0.5 text-xs text-muted-foreground">
                {{ punishmentSubtitle(punishment) }}
                <template v-if="punishment.due_at">
                  — {{ formatDate(punishment.due_at) }}
                </template>
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              class="cursor-pointer sm:ml-auto"
              @click="openResolvePunishmentModal(punishment.id)"
            >
              <CircleCheck class="w-3.5 h-3.5" />
              {{ t('studentProfile.actions.resolve') }}
            </Button>
          </div>
        </div>
      </div>

      <div class="mb-8">
        <h2 class="mb-4 text-lg font-semibold">
          {{ t('studentProfile.availableBonuses') }}
        </h2>
        <div v-if="availableBonuses.length === 0" class="rounded-lg border border-border p-6 text-sm text-muted-foreground">
          {{ t('studentProfile.empty.availableBonuses') }}
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="bonus in availableBonuses"
            :key="bonus.id"
            class="flex flex-wrap items-center gap-4 rounded-lg border border-border p-4 sm:flex-nowrap"
          >
            <div class="w-9 h-9 rounded-full bg-amber-400/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-amber-400">
              +{{ bonus.points }}
            </div>

            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium">
                {{ bonus.bonus_type_name }}
              </p>
              <p class="mt-0.5 text-xs text-muted-foreground">
                {{ formatDate(bonus.created_at) }}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              class="cursor-pointer sm:ml-auto"
              @click="openUseBonusModal(bonus.id)"
            >
              <Gift class="w-3.5 h-3.5" />
              {{ t('studentProfile.actions.consume') }}
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h2 class="mb-4 text-lg font-semibold">
          {{ t('studentProfile.historyTitle') }}
        </h2>
        <div v-if="history.length === 0" class="rounded-lg border border-border p-6 text-sm text-muted-foreground">
          {{ t('studentProfile.empty.history') }}
        </div>
        <div v-else class="space-y-0">
          <div v-for="(item, index) in history" :key="item.id" class="flex gap-4">
            <div class="flex flex-col items-center">
              <div class="timeline-dot mt-1.5 h-2 w-2 rounded-full" :class="eventDotClass(item)" />
              <div v-if="index < history.length - 1" class="my-1 w-px flex-1 bg-border" />
            </div>

            <div class="flex-1 pb-6" :class="{ 'pb-2': index === history.length - 1 }">
              <template v-if="item.type === 'punishment'">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-sm font-medium">
                    {{
                      item.triggering_rule_id
                        ? t('studentProfile.history.punishmentAuto', { name: item.punishment_type_name })
                        : t('studentProfile.history.punishment', { name: item.punishment_type_name })
                    }}
                  </p>
                  <Badge
                    v-if="item.triggering_rule_id"
                    variant="outline"
                    class="text-xs text-blue-400 border-blue-400/30"
                  >
                    {{ t('common.auto') }}
                  </Badge>
                  <Badge
                    variant="outline"
                    class="text-xs"
                    :class="item.resolved_at ? 'text-green-400 border-green-400/30' : 'text-amber-400 border-amber-400/30'"
                  >
                    {{ item.resolved_at ? t('punishments.resolved') : t('punishments.pending') }}
                  </Badge>
                </div>
                <p class="mt-1 text-xs text-muted-foreground">
                  {{ punishmentSubtitle(item) }}
                </p>
                <p v-if="item.due_at" class="text-xs text-muted-foreground">
                  {{ t('common.dueAt', { date: formatDate(item.due_at) }) }}
                </p>
                <p v-if="item.resolved_at" class="text-xs text-muted-foreground">
                  {{ t('punishments.resolvedAt', { date: formatDate(item.resolved_at) }) }}
                </p>
                <p class="mt-1 text-xs text-muted-foreground">
                  {{ formatDateTime(item.created_at) }}
                </p>
              </template>

              <template v-else-if="item.type === 'bonus'">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-sm font-medium">
                    {{ t('studentProfile.history.bonus', { name: item.bonus_type_name }) }}
                  </p>
                  <span
                    class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold"
                    :class="item.used_at ? 'bg-secondary text-muted-foreground' : 'bg-amber-400/10 text-amber-400'"
                  >
                    +{{ item.points }}
                  </span>
                  <Badge
                    variant="outline"
                    class="text-xs"
                    :class="item.used_at ? 'text-muted-foreground' : 'text-green-400 border-green-400/30'"
                  >
                    {{ item.used_at ? t('common.used') : t('common.available') }}
                  </Badge>
                </div>
                <p v-if="item.used_at" class="mt-1 text-xs text-muted-foreground">
                  {{ t('bonuses.usedAt', { date: formatDate(item.used_at) }) }}
                </p>
                <p class="mt-1 text-xs text-muted-foreground">
                  {{ formatDateTime(item.created_at) }}
                </p>
              </template>

              <template v-else>
                <p class="text-sm font-medium">
                  {{ t('studentProfile.history.penalty', { name: item.penalty_type_name }) }}
                </p>
                <p class="mt-1 text-xs text-muted-foreground">
                  {{ formatDateTime(item.created_at) }}
                </p>
              </template>
            </div>
          </div>
        </div>
      </div>
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
    <BonusUseModal
      v-model:open="showUseBonusModal"
      :bonus-id="bonusToUseId"
      :use-fn="useBonus"
      @confirmed="onActionConfirmed"
    />
    <PunishmentResolveModal
      v-model:open="showResolvePunishmentModal"
      :punishment-id="punishmentToResolveId"
      :resolve-fn="resolvePunishment"
      @confirmed="onActionConfirmed"
    />
  </div>
</template>
