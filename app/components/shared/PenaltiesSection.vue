<script setup lang="ts">
import type { Penalty } from '~/types/api'
import type { SectionFilterOption } from '~/types/ui'

type PenaltySectionItem = Pick<
  Penalty,
  'id' | 'penalty_type_name' | 'created_at' | 'evaluation_label'
> & {
  occurred_at?: string | null
  student_id?: string
  student_first_name?: string
  student_last_name?: string
}

const props = withDefaults(
  defineProps<{
    penalties: PenaltySectionItem[]
    title: string
    emptyLabel: string
    badgeText?: string
    badgeHelpText?: string
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
    badgeText: undefined,
    badgeHelpText: undefined,
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
  'update:page': [value: number]
  'update:filterValue': [value: string]
}>()
</script>

<template>
  <div>
    <SectionHeaderRow
      :title="props.title"
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
      :is-empty="props.penalties.length === 0"
      :empty-label="props.emptyLabel"
      :list-class="props.listClass"
    >
      <PenaltyCard
        v-for="penalty in props.penalties"
        :key="penalty.id"
        :penalty-type-name="penalty.penalty_type_name"
        :evaluation-label="penalty.evaluation_label"
        :occurred-at="penalty.occurred_at ?? penalty.created_at"
        :created-at="penalty.created_at"
        :student-id="props.showStudentDetails ? penalty.student_id : undefined"
        :student-first-name="props.showStudentDetails ? penalty.student_first_name : undefined"
        :student-last-name="props.showStudentDetails ? penalty.student_last_name : undefined"
      />
    </SectionListBlock>
  </div>
</template>
