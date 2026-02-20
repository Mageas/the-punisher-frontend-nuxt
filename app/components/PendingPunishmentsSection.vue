<script setup lang="ts">
import { CircleCheck } from 'lucide-vue-next'
import PunishmentResolveModal from '~/components/modals/PunishmentResolveModal.vue'

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
  compact?: boolean
  resolveFn?: (id: string) => Promise<void>
}>()

const emit = defineEmits<{
  resolved: []
}>()

const { t } = useI18n()

const showResolveModal = ref(false)
const punishmentToResolveId = ref<string | null>(null)

const hasResolveAction = computed(() => typeof props.resolveFn === 'function')
const sectionTitle = computed(() => props.title ?? t('studentProfile.pendingPunishments'))
const sectionEmptyLabel = computed(() => props.emptyLabel ?? t('studentProfile.empty.pendingPunishments'))
const useCompactMode = computed(() => props.compact ?? false)
const showCountBadge = computed(() => props.showCount ?? false)

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
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-semibold">
        {{ sectionTitle }}
      </h2>
      <Badge v-if="showCountBadge" variant="outline" class="border-red-400/30 text-red-400">
        {{ t('common.nToResolve', { count: punishments.length }) }}
      </Badge>
    </div>

    <div v-if="punishments.length === 0" class="rounded-lg border border-border p-6 text-sm text-muted-foreground">
      {{ sectionEmptyLabel }}
    </div>

    <div v-else class="space-y-2">
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
            :title="t('common.resolve')"
            :aria-label="t('common.resolve')"
            @click="openResolveModal(punishment.id)"
          >
            <CircleCheck class="h-5 w-5 text-green-400" />
          </Button>
        </template>
      </PunishmentCard>
    </div>

    <PunishmentResolveModal
      v-if="hasResolveAction"
      v-model:open="showResolveModal"
      :punishment-id="punishmentToResolveId"
      :resolve-fn="resolvePunishment"
      @confirmed="onResolved"
    />
  </div>
</template>
