<script setup lang="ts">
import type { Component } from 'vue'
import type { BonusType, PenaltyType, PunishmentType } from '~/types/api'
import type { TypeServiceFunctions, NamedTypeResource } from '~/composables/useTypeCollection'

type ManagedType = (BonusType | PenaltyType | PunishmentType) & NamedTypeResource

const props = withDefaults(
  defineProps<{
    service: TypeServiceFunctions<ManagedType>
    title: string
    newLabel: string
    emptyLabel: string
    createTitle: string
    createPlaceholder: string
    editTitle: string
    deleteMessage: string
    icon: Component
    iconClass?: string
    iconWrapperClass?: string
  }>(),
  {
    iconClass: 'text-muted-foreground',
    iconWrapperClass: 'bg-secondary',
  },
)
const { t } = useI18n()

const {
  types,
  loading,
  page,
  filters,
  itemPerPage,
  totalCount,
  fetchTypes,
  gotoPage,
  applyFilters,
  createType,
  updateType,
  deleteType,
} = useTypeCollection<ManagedType>(props.service)

// Wrappers to pass to modals
const handleCreate = (name: string) => createType(name)
const handleUpdate = (id: string, name: string) => updateType(id, name)
const handleDelete = (id: string) => deleteType(id)

const {
  searchQuery,
  activeFilterCount,
  safeItemsPerPage,
  showPagination,
  reload,
  reloadCurrentPage,
  reloadFirstPage,
  onPageChange,
  resetFilters,
} = useSearchListPage({
  page,
  itemPerPage,
  totalCount,
  gotoPage,
  fetchPage: fetchTypes,
  applyFilters,
  buildFilters: (search) => ({
    search: search || undefined,
  }),
  getAppliedSearch: () => filters.search,
  initialSearch: filters.search || '',
})

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const typeToEdit = ref<ManagedType | null>(null)
const typeToDeleteId = ref<string | null>(null)

function openEditModal(item: ManagedType) {
  typeToEdit.value = item
  showEditModal.value = true
}

function openDeleteModal(itemId: string) {
  typeToDeleteId.value = itemId
  showDeleteModal.value = true
}

async function onCreated() {
  await reloadFirstPage()
}

async function onUpdated() {
  await reloadCurrentPage()
}

async function onDeleteConfirmed() {
  await reloadCurrentPage()
}

await reload()
</script>

<template>
  <SearchListPageShell
    :title="props.title"
    :create-label="props.newLabel"
    :active-filter-count="activeFilterCount"
    :items-count="types.length"
    :empty-message="props.emptyLabel"
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
        :label="t('common.labels.type')"
        :placeholder="t('common.placeholders.searchType')"
      />
    </template>

    <div class="space-y-3">
      <TypeCard
        v-for="item in types"
        :key="item.id"
        :name="item.name"
        :created-at="item.created_at"
        :icon="props.icon"
        :icon-class="props.iconClass"
        :icon-wrapper-class="props.iconWrapperClass"
        @edit="openEditModal(item)"
        @delete="openDeleteModal(item.id)"
      />
    </div>

    <TypeCreateModal
      v-model:open="showCreateModal"
      :title="props.createTitle"
      :placeholder="props.createPlaceholder"
      :create-fn="handleCreate"
      @created="onCreated"
    />
    <TypeEditModal
      v-model:open="showEditModal"
      :item="typeToEdit"
      :title="props.editTitle"
      :update-fn="handleUpdate"
      @updated="onUpdated"
    />
    <TypeDeleteModal
      v-model:open="showDeleteModal"
      :type-id="typeToDeleteId"
      :delete-fn="handleDelete"
      :message="props.deleteMessage"
      @confirmed="onDeleteConfirmed"
    />
  </SearchListPageShell>
</template>
