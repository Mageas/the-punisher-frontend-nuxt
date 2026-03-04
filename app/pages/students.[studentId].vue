<script setup lang="ts">
import { AlertCircle, AlertTriangle, Gavel, Pencil, Star, Trash2 } from 'lucide-vue-next'
import type { Student, StudentKpis } from '~/types/api'
import { getInitials } from '~/lib/utils'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

const { t } = useI18n()
const studentService = useStudentService()

definePageMeta({
  path: '/students/:studentId',
})

const route = useRoute()

const studentId = computed(() => {
  const routeStudentId = route.params.studentId
  return (Array.isArray(routeStudentId) ? routeStudentId[0] : routeStudentId) as string
})

const student = ref<Student | null>(null)
const kpis = ref<StudentKpis | null>(null)
const loadingProfile = ref(false)

const {
  punishments: pendingPunishments,
  loading: loadingPunishments,
  page: punishmentsPage,
  totalCount: punishmentsTotal,
  itemPerPage: punishmentsPerPage,
  fetchPunishments,
  gotoPage: gotoPunishmentsPage,
  resolvePunishment: resolvePunishmentApi,
} = useStudentPunishments(studentId)

const {
  bonuses: availableBonuses,
  loading: loadingBonuses,
  page: bonusesPage,
  totalCount: bonusesTotal,
  itemPerPage: bonusesPerPage,
  fetchBonuses,
  gotoPage: gotoBonusesPage,
  useBonus: useBonusApi,
} = useStudentBonuses(studentId)

const {
  penalties,
  loading: loadingPenalties,
  page: penaltiesPage,
  totalCount: penaltiesTotal,
  itemPerPage: penaltiesPerPage,
  fetchPenalties,
  gotoPage: gotoPenaltiesPage,
} = useStudentPenalties(studentId)

const {
  items: historyItems,
  loading: loadingHistory,
  page: historyPage,
  totalCount: historyTotal,
  itemPerPage: historyPerPage,
  fetchHistory,
  gotoPage: gotoHistoryPage,
} = useStudentHistory(studentId)

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showBonusCreateModal = ref(false)
const showPenaltyCreateModal = ref(false)
const showPunishmentCreateModal = ref(false)

const initials = computed(() => getInitials(student.value?.first_name, student.value?.last_name))

function formatRatio(current: number, total: number): string {
  return `${current} / ${total}`
}

function computeTotalPages(total: number, itemsPerPage: number): number {
  if (itemsPerPage <= 0) return 1
  return Math.max(1, Math.ceil(total / itemsPerPage))
}

const punishmentsTotalPages = computed(() =>
  computeTotalPages(punishmentsTotal.value, punishmentsPerPage.value),
)
const bonusesTotalPages = computed(() => computeTotalPages(bonusesTotal.value, bonusesPerPage.value))
const penaltiesTotalPages = computed(() =>
  computeTotalPages(penaltiesTotal.value, penaltiesPerPage.value),
)
const historyTotalPages = computed(() => computeTotalPages(historyTotal.value, historyPerPage.value))

async function fetchStudentProfile() {
  loadingProfile.value = true
  try {
    const [studentRes, kpisRes] = await Promise.all([
      studentService.getStudentById(studentId.value),
      studentService.getStudentKpis(studentId.value),
    ])
    student.value = studentRes
    kpis.value = kpisRes
  } finally {
    loadingProfile.value = false
  }
}

async function loadAllData() {
  await Promise.all([
    fetchStudentProfile(),
    fetchPunishments({ state: 'pending' }),
    fetchBonuses({ state: 'unused' }),
    fetchPenalties(),
    fetchHistory(),
  ])
}

async function resolvePunishment(id: string) {
  await resolvePunishmentApi(id)
}

async function useBonus(id: string) {
  await useBonusApi(id)
}

async function deleteStudent(id: string) {
  await studentService.deleteStudent(id)
}

async function onActionConfirmed() {
  await loadAllData()
}

async function onDeleteConfirmed() {
  await navigateTo('/students')
}

async function onCreated() {
  await loadAllData()
}

await loadAllData()

watch(studentId, async (nextStudentId, previousStudentId) => {
  if (!nextStudentId || nextStudentId === previousStudentId) return
  await loadAllData()
})
</script>

<template>
  <div>
    <AppBreadcrumb
      :items="[
        { label: t('students.title'), to: '/students' },
        {
          label: student ? `${student.first_name} ${student.last_name}` : '...',
        },
      ]"
    />

    <template v-if="student && kpis">
      <div class="mb-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-xl font-semibold shrink-0"
            >
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
                <Badge
                  v-if="student.classrooms.length === 0"
                  variant="outline"
                  class="text-muted-foreground"
                >
                  {{ t('students.noClassroom') }}
                </Badge>
              </div>
            </div>
          </div>

          <PageActionsMenu :create-label="t('common.add')" align="end">
            <template #create>
              <DropdownMenuItem class="cursor-pointer" @click="showBonusCreateModal = true">
                <Star class="w-4 h-4 text-warning" />
                {{ t('studentProfile.actions.addBonus') }}
              </DropdownMenuItem>
              <DropdownMenuItem class="cursor-pointer" @click="showPenaltyCreateModal = true">
                <AlertTriangle class="w-4 h-4 text-warning" />
                {{ t('studentProfile.actions.addPenalty') }}
              </DropdownMenuItem>
              <DropdownMenuItem class="cursor-pointer" @click="showPunishmentCreateModal = true">
                <Gavel class="w-4 h-4 text-danger" />
                {{ t('studentProfile.actions.addPunishment') }}
              </DropdownMenuItem>
            </template>
            <template #manage>
              <DropdownMenuItem class="cursor-pointer" @click="showEditModal = true">
                <Pencil class="w-4 h-4" />
                {{ t('studentProfile.actions.edit') }}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                class="cursor-pointer"
                @click="showDeleteModal = true"
              >
                <Trash2 class="w-4 h-4" />
                {{ t('studentProfile.actions.delete') }}
              </DropdownMenuItem>
            </template>
          </PageActionsMenu>
        </div>
      </div>

      <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="rounded-lg border border-border p-4 sm:p-6">
          <div class="mb-2 flex items-center justify-between">
            <p class="text-xs sm:text-sm font-medium text-muted-foreground">
              {{ t('studentProfile.kpis.availableBonusPoints') }}
            </p>
            <Star class="w-4 h-4 text-warning" />
          </div>
          <p
            class="text-xl sm:text-3xl font-bold text-warning tabular-nums whitespace-nowrap leading-none"
          >
            {{ formatRatio(kpis.available_bonus_points, kpis.total_bonus_points) }}
          </p>
          <p class="mt-1 text-[11px] sm:text-xs text-muted-foreground">
            {{ t('studentProfile.kpis.activeBonusCount', kpis.active_bonus_count) }}
          </p>
        </div>

        <div class="rounded-lg border border-border p-4 sm:p-6">
          <div class="mb-2 flex items-center justify-between">
            <p class="text-xs sm:text-sm font-medium text-muted-foreground">
              {{ t('studentProfile.kpis.totalPenaltyCount') }}
            </p>
            <AlertCircle class="w-4 h-4 text-muted-foreground" />
          </div>
          <p class="text-xl sm:text-3xl font-bold tabular-nums whitespace-nowrap leading-none">
            {{ formatRatio(kpis.penalty_count, kpis.total_penalty_count) }}
          </p>
          <p class="mt-1 text-[11px] sm:text-xs text-muted-foreground">
            {{ t('common.currentPeriod') }}
          </p>
        </div>

        <div class="rounded-lg border border-border p-4 sm:p-6">
          <div class="mb-2 flex items-center justify-between">
            <p class="text-xs sm:text-sm font-medium text-muted-foreground">
              {{ t('studentProfile.kpis.pendingPunishmentCount') }}
            </p>
            <Gavel class="w-4 h-4 text-danger" />
          </div>
          <p
            class="text-xl sm:text-3xl font-bold text-danger tabular-nums whitespace-nowrap leading-none"
          >
            {{ formatRatio(kpis.pending_punishment_count, kpis.total_punishment_count) }}
          </p>
          <p class="mt-1 text-[11px] sm:text-xs text-muted-foreground">
            {{ t('common.overduePunishments', kpis.overdue_punishment_count) }}
          </p>
        </div>
      </div>

      <div class="mb-8 space-y-4">
        <HistoryPendingPunishmentsSection
          :punishments="pendingPunishments"
          :page="punishmentsPage"
          :total-pages="punishmentsTotalPages"
          :loading="loadingPunishments"
          :resolve-fn="resolvePunishment"
          @resolved="onActionConfirmed"
          @update:page="gotoPunishmentsPage($event)"
        />
      </div>

      <div class="mb-8 space-y-4">
        <HistoryAvailableBonusesSection
          :bonuses="availableBonuses"
          :page="bonusesPage"
          :total-pages="bonusesTotalPages"
          :loading="loadingBonuses"
          :use-fn="useBonus"
          @used="onActionConfirmed"
          @update:page="gotoBonusesPage($event)"
        />
      </div>

      <div class="mb-8 space-y-4">
        <HistoryPenaltiesSection
          :penalties="penalties"
          :page="penaltiesPage"
          :total-pages="penaltiesTotalPages"
          :loading="loadingPenalties"
          @update:page="gotoPenaltiesPage($event)"
        />
      </div>

      <div class="mb-8 space-y-4">
        <HistoryTimelineSection
          :history="historyItems"
          :page="historyPage"
          :total-pages="historyTotalPages"
          :loading="loadingHistory"
          @update:page="gotoHistoryPage($event)"
        />
      </div>
    </template>

    <div v-else-if="loadingProfile" class="py-16 text-center text-muted-foreground">
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
