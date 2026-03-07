<script setup lang="ts">
import { Check, ChevronDown, Info } from 'lucide-vue-next'

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
  <div class="rounded-lg border border-info-border bg-info-bg-subtle">
    <div v-if="open" class="p-3.5 space-y-3">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-2.5">
          <Info class="size-4 mt-0.5 text-info-foreground shrink-0" />
          <p class="text-sm text-info-foreground leading-snug">
            {{ props.hint }}
          </p>
        </div>

        <button
          type="button"
          class="shrink-0 text-xs font-medium text-info-foreground/80 hover:text-info-foreground"
          @click="open = false"
        >
          {{ t('common.actions.hide') }}
        </button>
      </div>

      <div class="flex flex-wrap gap-2">
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
      </div>
    </div>

    <button
      v-else
      type="button"
      class="flex w-full items-center justify-between gap-3 rounded-lg px-3.5 py-3 text-left transition-colors hover:bg-info-bg-subtle/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      @click="open = true"
    >
      <div class="flex min-w-0 items-start gap-2.5">
        <Info class="size-4 mt-0.5 text-info-foreground shrink-0" />
        <div class="min-w-0">
          <p class="text-sm font-medium text-info-foreground">
            {{
              selectedClassroomName
                ? t('common.actions.viewSelectedClassroom')
                : t('common.actions.chooseClassroom')
            }}
          </p>
          <p v-if="selectedClassroomName" class="text-sm text-info-foreground/80">
            {{ selectedClassroomName }}
          </p>
        </div>
      </div>
      <ChevronDown class="size-4 shrink-0 text-info-foreground" />
    </button>
  </div>
</template>
