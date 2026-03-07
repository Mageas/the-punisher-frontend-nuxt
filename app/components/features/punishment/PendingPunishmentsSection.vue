<script setup lang="ts">
import { CircleCheck } from 'lucide-vue-next'

interface PendingPunishment {
  id: string
  student_id?: string
  punishment_type_name: string
  automated: boolean
  triggering_rule_id?: string | null
  triggering_rule_name?: string | null
  due_at?: string | null
  student_first_name?: string
  student_last_name?: string
}

const props = defineProps<{
  punishments: PendingPunishment[]
  title?: string
  emptyLabel?: string
  showCount?: boolean
  countOverride?: number
  badgeText?: string
  badgeHelpText?: string
  compact?: boolean
  resolveFn?: (id: string) => Promise<void>
  page?: number
  totalPages?: number
  loading?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  resolved: []
  'update:page': [value: number]
}>()

const { t } = useI18n()

const showResolveModal = ref(false)
const punishmentToResolveId = ref<string | null>(null)

const hasResolveAction = computed(() => typeof props.resolveFn === 'function')
const sectionTitle = computed(() => props.title ?? t('common.titles.pendingPunishments'))
const sectionEmptyLabel = computed(
  () => props.emptyLabel ?? t('studentProfile.empty.pendingPunishments'),
)
const useCompactMode = computed(() => props.compact ?? false)
const showCountBadge = computed(() => props.showCount ?? false)
const displayedBadgeText = computed(
  () => props.badgeText ?? props.countOverride ?? props.punishments.length,
)

function openResolveModal(id: string) {
  if (!hasResolveAction.value) return
  punishmentToResolveId.value = id
  showResolveModal.value = true
}

async function resolvePunishment(id: string) {
  if (!props.resolveFn) return
  await props.resolveFn(id)
}

function onResolved() {
  emit('resolved')
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
      :badge-text="showCountBadge ? displayedBadgeText : undefined"
      :badge-help-text="props.badgeHelpText"
      badge-class="border-danger-border text-danger"
      @update:page="emit('update:page', $event)"
    />

    <SectionListBlock :is-empty="punishments.length === 0" :empty-label="sectionEmptyLabel" list-class="space-y-2">
      <PunishmentCard
        v-for="punishment in punishments"
        :key="punishment.id"
        :punishment-type-name="punishment.punishment_type_name"
        :automated="punishment.automated"
        :triggering-rule-id="punishment.triggering_rule_id"
        :triggering-rule-name="punishment.triggering_rule_name"
        :due-at="punishment.due_at"
        :student-id="punishment.student_id"
        :student-first-name="punishment.student_first_name"
        :student-last-name="punishment.student_last_name"
        :compact="useCompactMode"
      >
        <template v-if="hasResolveAction" #actions>
          <Button
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer text-muted-foreground hover:text-foreground"
            :title="t('common.actions.resolve')"
            :aria-label="t('common.actions.resolve')"
            @click="openResolveModal(punishment.id)"
          >
            <CircleCheck class="h-5 w-5 text-success" />
          </Button>
        </template>
      </PunishmentCard>
    </SectionListBlock>

    <PunishmentResolveModal
      v-if="hasResolveAction"
      v-model:open="showResolveModal"
      :punishment-id="punishmentToResolveId"
      :resolve-fn="resolvePunishment"
      @confirmed="onResolved"
    />
  </div>
</template>
