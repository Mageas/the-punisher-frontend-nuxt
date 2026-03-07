<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    page: number
    itemsPerPage: number
    total: number
    loading?: boolean
  }>(),
  {
    loading: false,
  },
)

const emit = defineEmits<{
  'update:page': [value: number]
}>()
</script>

<template>
  <CustomPagination
    v-if="props.total > 0"
    class="mt-4"
    :page="props.page"
    :items-per-page="props.itemsPerPage"
    :total="props.total"
    :loading="props.loading"
    @update:page="emit('update:page', $event)"
  />
</template>
