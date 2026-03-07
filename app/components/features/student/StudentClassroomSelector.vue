<script setup lang="ts">
import { Check, Info } from 'lucide-vue-next'
import ChoicePillsList from '~/components/shared/ChoicePillsList.vue'
import CollapsedChoiceSummary from '~/components/shared/CollapsedChoiceSummary.vue'
import ExpandableChoicePanel from '~/components/shared/ExpandableChoicePanel.vue'
import ExpandableChoicePanelHeader from '~/components/shared/ExpandableChoicePanelHeader.vue'

interface ClassroomOption {
  id: string
  name: string
}

const props = withDefaults(
  defineProps<{
    classrooms: readonly ClassroomOption[]
    selectedClassroomId?: string | null
    loading?: boolean
    hint: string
  }>(),
  {
    selectedClassroomId: '',
    loading: false,
  },
)

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  select: [classroomId: string]
}>()

const { t } = useI18n()

const selectedClassroomName = computed(
  () =>
    props.classrooms.find((classroom) => classroom.id === props.selectedClassroomId)?.name ?? '',
)

function selectClassroom(classroomId: string) {
  emit('select', classroomId)
  open.value = false
}
</script>

<template>
  <ExpandableChoicePanel :expanded="open" tone="info">
    <template #expanded>
      <ExpandableChoicePanelHeader
        :hint="props.hint"
        :hide-label="t('common.actions.hide')"
        tone="info"
        @hide="open = false"
      >
        <template #icon>
          <Info class="mt-0.5 size-4 shrink-0 text-info-foreground" />
        </template>
      </ExpandableChoicePanelHeader>

      <ChoicePillsList>
        <button
          v-for="classroom in props.classrooms"
          :key="classroom.id"
          data-testid="student-classroom-option"
          type="button"
          :disabled="props.loading"
          :class="[
            'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            props.selectedClassroomId === classroom.id
              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
              : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary-bg-subtle',
          ]"
          @click="selectClassroom(classroom.id)"
        >
          <Check v-if="props.selectedClassroomId === classroom.id" class="size-3.5" />
          {{ classroom.name }}
        </button>
      </ChoicePillsList>
    </template>

    <template #collapsed>
      <CollapsedChoiceSummary
        :title="
          selectedClassroomName
            ? t('common.actions.viewSelectedClassroom')
            : t('common.actions.chooseClassroom')
        "
        :subtitle="selectedClassroomName"
        tone="info"
        @click="open = true"
      >
        <template #icon>
          <Info class="mt-0.5 size-4 shrink-0 text-info-foreground" />
        </template>
      </CollapsedChoiceSummary>
    </template>
  </ExpandableChoicePanel>
</template>
