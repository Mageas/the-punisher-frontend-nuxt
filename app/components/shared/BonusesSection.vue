<script setup lang="ts">
import { Gift } from 'lucide-vue-next'
import type { Bonus } from '~/types/api'
import type { SectionFilterOption } from '~/types/ui'

type AvailableBonus = Pick<
  Bonus,
  'id' | 'bonus_type_name' | 'points' | 'created_at' | 'evaluation_label'
> & {
  occurred_at?: Bonus['occurred_at']
  used_at?: Bonus['used_at']
  student_id?: string
  student_first_name?: string
  student_last_name?: string
}

const props = withDefaults(
  defineProps<{
    bonuses: AvailableBonus[]
    title?: string
    emptyLabel?: string
    badgeText?: string
    badgeHelpText?: string
    useFn?: (id: string) => Promise<void>
    page?: number
    totalPages?: number
    loading?: boolean
    disabled?: boolean
    listClass?: string
    showStudentDetails?: boolean
    filterOptions?: SectionFilterOption[]
    filterValue?: string
  }>(),
  {
    title: undefined,
    emptyLabel: undefined,
    badgeText: undefined,
    badgeHelpText: undefined,
    useFn: undefined,
    page: 1,
    totalPages: 1,
    loading: false,
    disabled: false,
    listClass: 'space-y-2',
    showStudentDetails: false,
    filterOptions: undefined,
    filterValue: undefined,
  },
)

const emit = defineEmits<{
  used: []
  'update:page': [value: number]
  'update:filterValue': [value: string]
}>()

const { t } = useI18n()
const sectionTitle = computed(() => props.title ?? t('common.titles.bonuses'))
const sectionEmptyLabel = computed(() => props.emptyLabel ?? t('common.empty.noBonuses'))

const showUseModal = ref(false)
const bonusToUseId = ref<string | null>(null)

const hasConsumeAction = computed(() => typeof props.useFn === 'function')

function openUseBonusModal(id: string) {
  if (!hasConsumeAction.value) return
  bonusToUseId.value = id
  showUseModal.value = true
}

async function consumeBonus(id: string) {
  if (!props.useFn) return
  await props.useFn(id)
}

function onUsed() {
  emit('used')
}
</script>

<template>
  <div>
    <SectionHeaderRow
      :title="sectionTitle"
      :page="props.page"
      :total-pages="props.totalPages"
      :loading="props.loading"
      :disabled="props.disabled"
      :badge-text="props.badgeText"
      :badge-help-text="props.badgeHelpText"
      badge-class="text-muted-foreground"
      :filter-options="props.filterOptions"
      :filter-value="props.filterValue"
      @update:page="emit('update:page', $event)"
      @update:filter-value="emit('update:filterValue', $event)"
    />

    <SectionListBlock
      :is-empty="props.bonuses.length === 0"
      :empty-label="sectionEmptyLabel"
      :list-class="props.listClass"
    >
      <BonusCard
        v-for="bonus in props.bonuses"
        :key="bonus.id"
        :bonus-type-name="bonus.bonus_type_name"
        :points="bonus.points"
        :used-at="bonus.used_at"
        :occurred-at="bonus.occurred_at ?? bonus.created_at"
        :created-at="bonus.created_at"
        :evaluation-label="bonus.evaluation_label"
        :student-id="props.showStudentDetails ? bonus.student_id : undefined"
        :student-first-name="props.showStudentDetails ? bonus.student_first_name : undefined"
        :student-last-name="props.showStudentDetails ? bonus.student_last_name : undefined"
      >
        <template v-if="hasConsumeAction && !bonus.used_at" #actions>
          <Button
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer text-muted-foreground hover:text-foreground"
            :title="t('common.actions.consume')"
            :aria-label="t('common.actions.consume')"
            @click="openUseBonusModal(bonus.id)"
          >
            <Gift class="h-5 w-5 text-warning" />
          </Button>
        </template>
      </BonusCard>
    </SectionListBlock>

    <BonusUseModal
      v-if="hasConsumeAction"
      v-model:open="showUseModal"
      :bonus-id="bonusToUseId"
      :use-fn="consumeBonus"
      @confirmed="onUsed"
    />
  </div>
</template>
