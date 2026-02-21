<script setup lang="ts">
import { Gift } from 'lucide-vue-next'

interface AvailableBonus {
  id: string
  bonus_type_name: string
  points: number
  created_at: string
}

const props = defineProps<{
  bonuses: AvailableBonus[]
  title?: string
  emptyLabel?: string
  useFn?: (id: string) => Promise<void>
}>()

const emit = defineEmits<{
  used: []
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
    <h2 class="mb-4 text-lg font-semibold">
      {{ sectionTitle }}
    </h2>

    <div
      v-if="bonuses.length === 0"
      class="rounded-lg border border-border p-6 text-sm text-muted-foreground"
    >
      {{ sectionEmptyLabel }}
    </div>

    <div v-else class="space-y-2">
      <BonusCard
        v-for="bonus in bonuses"
        :key="bonus.id"
        :bonus-type-name="bonus.bonus_type_name"
        :points="bonus.points"
        :created-at="bonus.created_at"
      >
        <template v-if="hasConsumeAction" #actions>
          <Button
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer text-muted-foreground hover:text-foreground"
            :title="t('common.consume')"
            :aria-label="t('common.consume')"
            @click="openUseBonusModal(bonus.id)"
          >
            <Gift class="h-5 w-5 text-amber-400" />
          </Button>
        </template>
      </BonusCard>
    </div>

    <BonusUseModal
      v-if="hasConsumeAction"
      v-model:open="showUseModal"
      :bonus-id="bonusToUseId"
      :use-fn="consumeBonus"
      @confirmed="onUsed"
    />
  </div>
</template>
