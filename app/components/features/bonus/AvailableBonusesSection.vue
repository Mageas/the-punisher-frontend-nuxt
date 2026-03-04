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
const currentPage = computed(() => props.page ?? 1)
const currentTotalPages = computed(() => props.totalPages ?? 1)
const paginationLoading = computed(() => props.loading ?? false)
const paginationDisabled = computed(() => props.disabled ?? false)

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
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div class="flex min-w-0 items-center gap-3">
        <h2 class="text-lg font-semibold">
          {{ sectionTitle }}
        </h2>
        <SectionHeaderPagination
          :page="currentPage"
          :total-pages="currentTotalPages"
          :loading="paginationLoading"
          :disabled="paginationDisabled"
          @update:page="emit('update:page', $event)"
        />
      </div>
    </div>

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
            <Gift class="h-5 w-5 text-warning" />
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
