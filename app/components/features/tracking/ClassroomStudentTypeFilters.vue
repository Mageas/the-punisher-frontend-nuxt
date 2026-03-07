<script setup lang="ts">
const props = defineProps<{
  typeKind: 'bonus' | 'penalty' | 'punishment'
}>()

const classroomId = defineModel<string>('classroomId', { default: '' })
const studentId = defineModel<string>('studentId', { default: '' })
const typeId = defineModel<string>('typeId', { default: '' })

const { t } = useI18n()

const typeComponent = computed(() =>
  props.typeKind === 'bonus'
    ? 'BonusTypeSelect'
    : props.typeKind === 'penalty'
      ? 'PenaltyTypeSelect'
      : 'PunishmentTypeSelect',
)
</script>

<template>
  <ClassroomSelect
    v-model="classroomId"
    :label="t('common.labels.classroom')"
    :placeholder="t('common.options.allClassrooms')"
    :search-placeholder="t('common.placeholders.searchClassroom')"
    :none-option-label="t('common.options.allClassrooms')"
    :none-value-label="t('common.options.allClassrooms')"
    full-width
  />

  <StudentSelect
    v-model="studentId"
    :classroom-id="classroomId || undefined"
    :label="t('common.labels.student')"
    :placeholder="t('common.options.allStudents')"
    :search-placeholder="t('common.placeholders.searchStudent')"
    full-width
  />

  <component
    :is="typeComponent"
    v-model="typeId"
    :label="t('common.labels.type')"
    :placeholder="t('common.options.allTypes')"
    :search-placeholder="t('common.placeholders.searchType')"
  />
</template>
