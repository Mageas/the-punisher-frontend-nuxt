<script setup lang="ts">
const { t } = useI18n()
const {
  students,
  loading,
  page,
  filters,
  itemPerPage,
  totalCount,
  fetchStudents,
  gotoPage,
  applyFilters,
} = useStudents()

const showCreateModal = ref(false)

const {
  searchQuery,
  activeFilterCount,
  safeItemsPerPage,
  showPagination,
  reload,
  reloadFirstPage,
  onPageChange,
  resetFilters,
} = useSearchListPage({
  page,
  itemPerPage,
  totalCount,
  gotoPage,
  fetchPage: fetchStudents,
  applyFilters,
  buildFilters: (search) => ({
    search: search || undefined,
  }),
  getAppliedSearch: () => filters.search,
  initialSearch: filters.search || '',
})

async function onCreated() {
  await reloadFirstPage()
}

// Initial fetch if not already loading (e.g. from watcher)
if (students.value.length === 0 && !loading.value) {
  await reload()
}
</script>

<template>
  <SearchListPageShell
    :title="t('common.titles.students')"
    :count-label="t('common.counts.student', totalCount)"
    :create-label="t('common.actions.addStudent')"
    :active-filter-count="activeFilterCount"
    :items-count="students.length"
    :empty-message="t('common.empty.noStudents')"
    :page="page"
    :items-per-page="safeItemsPerPage"
    :total="totalCount"
    :loading="loading"
    :show-pagination="showPagination"
    @create="showCreateModal = true"
    @reset="resetFilters"
    @update:page="onPageChange"
  >
    <template #filters>
      <SearchFilterField
        v-model="searchQuery"
        :label="t('common.labels.student')"
        :placeholder="t('common.placeholders.searchStudent')"
      />
    </template>

    <div class="space-y-3">
      <StudentListItem v-for="student in students" :key="student.id" :student="student" />
    </div>

    <StudentCreateModal v-model:open="showCreateModal" @created="onCreated" />
  </SearchListPageShell>
</template>
