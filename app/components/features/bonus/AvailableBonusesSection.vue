<script setup lang="ts">
import { Gift } from 'lucide-vue-next'

interface AvailableBonus {
  id: string
  bonus_type_name: string
  points: number
  occurred_at?: string
  created_at: string
}

const props = defineProps<{
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
}>()

const emit = defineEmits<{
  used: []
  'update:page': [value: number]
}>()

const { t } = useI18n()

const showUseModal = ref(false)
const bonusToUseId = ref<string | null>(null)

const hasConsumeAction = computed(() => typeof props.useFn === 'function')
const sectionTitle = computed(() => props.title ?? t('studentProfile.availableBonuses'))
const sectionEmptyLabel = computed(
  () => props.emptyLabel ?? t('studentProfile.empty.availableBonuses'),
)

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
      @update:page="emit('update:page', $event)"
    />

    <SectionListBlock :is-empty="bonuses.length === 0" :empty-label="sectionEmptyLabel" list-class="space-y-2">
      <BonusCard
        v-for="bonus in bonuses"
        :key="bonus.id"
        :bonus-type-name="bonus.bonus_type_name"
        :points="bonus.points"
        :occurred-at="bonus.occurred_at ?? bonus.created_at"
        :created-at="bonus.created_at"
      >
        <template v-if="hasConsumeAction" #actions>
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
