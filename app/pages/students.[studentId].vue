<script setup lang="ts">
import { Pencil, Trash2 } from 'lucide-vue-next'
import type { Student, StudentKpis } from '~/types/api'
import { computeTotalPages, formatPunishmentsProgress, formatRatio } from '~/lib/kpi-formatters'
import TrackingCreateMenu from '~/components/features/tracking/TrackingCreateMenu.vue'
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
  previousPage: previousPunishmentsPage,
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
  previousPage: previousBonusesPage,
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

const punishmentsTotalPages = computed(() =>
  computeTotalPages(punishmentsTotal.value, punishmentsPerPage.value),
)
const bonusesTotalPages = computed(() =>
  computeTotalPages(bonusesTotal.value, bonusesPerPage.value),
)
const penaltiesTotalPages = computed(() =>
  computeTotalPages(penaltiesTotal.value, penaltiesPerPage.value),
)
const historyTotalPages = computed(() =>
  computeTotalPages(historyTotal.value, historyPerPage.value),
)

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
    fetchPunishments(),
    fetchBonuses(),
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

async function onPunishmentResolved() {
  await loadAllData()

  if (pendingPunishments.value.length === 0 && previousPunishmentsPage.value !== null) {
    await gotoPunishmentsPage(previousPunishmentsPage.value)
  }
}

async function onBonusUsed() {
  await loadAllData()

  if (availableBonuses.value.length === 0 && previousBonusesPage.value !== null) {
    await gotoBonusesPage(previousBonusesPage.value)
  }
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
        { label: t('common.titles.students'), to: '/students' },
        {
          label: student ? `${student.first_name} ${student.last_name}` : '...',
        },
      ]"
    />

    <template v-if="student && kpis">
      <div class="mb-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <StudentAvatar
              :first-name="student.first_name"
              :last-name="student.last_name"
              size="xl"
            />
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

          <TrackingCreateMenu
            :create-label="t('common.actions.add')"
            :add-bonus-label="t('studentProfile.actions.addBonus')"
            :add-penalty-label="t('studentProfile.actions.addPenalty')"
            :add-punishment-label="t('studentProfile.actions.addPunishment')"
            align="end"
            @create-bonus="showBonusCreateModal = true"
            @create-penalty="showPenaltyCreateModal = true"
            @create-punishment="showPunishmentCreateModal = true"
          >
            <template #manage>
              <DropdownMenuItem class="cursor-pointer" @click="showEditModal = true">
                <Pencil class="w-4 h-4" />
                {{ t('common.actions.edit') }}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                class="cursor-pointer"
                @click="showDeleteModal = true"
              >
                <Trash2 class="w-4 h-4" />
                {{ t('common.actions.delete') }}
              </DropdownMenuItem>
            </template>
          </TrackingCreateMenu>
        </div>
      </div>

      <div class="mb-8 space-y-4">
        <PendingPunishmentsSection
          :punishments="pendingPunishments"
          :show-count="true"
          :badge-text="
            formatPunishmentsProgress(
              kpis.total_punishment_count,
              kpis.pending_punishment_count,
              kpis.overdue_punishment_count,
            )
          "
          :badge-help-text="t('common.kpiPopover.pendingPunishmentsProgress')"
          :page="punishmentsPage"
          :total-pages="punishmentsTotalPages"
          :loading="loadingPunishments"
          :resolve-fn="resolvePunishment"
          @resolved="onPunishmentResolved"
          @update:page="gotoPunishmentsPage($event)"
        />
      </div>

      <div class="mb-8 space-y-4">
        <AvailableBonusesSection
          :bonuses="availableBonuses"
          :badge-text="formatRatio(kpis.available_bonus_points, kpis.total_bonus_points)"
          :badge-help-text="t('common.kpiPopover.bonusAvailability')"
          :page="bonusesPage"
          :total-pages="bonusesTotalPages"
          :loading="loadingBonuses"
          :use-fn="useBonus"
          @used="onBonusUsed"
          @update:page="gotoBonusesPage($event)"
        />
      </div>

      <div class="mb-8 space-y-4">
        <PenaltiesSection
          :penalties="penalties"
          :title="t('common.titles.penalties')"
          :empty-label="t('studentProfile.empty.penalties')"
          :badge-text="formatRatio(kpis.penalty_count, kpis.total_penalty_count)"
          :badge-help-text="t('common.kpiPopover.studentPenaltiesProgress')"
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
