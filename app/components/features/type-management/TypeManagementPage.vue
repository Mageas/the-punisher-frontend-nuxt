<script setup lang="ts">
import type { Component } from 'vue'
import { Plus } from 'lucide-vue-next'
import type { BonusType, PenaltyType, PunishmentType } from '~/types/api'
import { useTypeCollection, type TypeServiceFunctions, type NamedTypeResource } from '~/composables/useTypeCollection'
import { useTypeStoreCollection } from '~/composables/useTypeStoreCollection'

type ManagedType = (BonusType | PenaltyType | PunishmentType) & NamedTypeResource

interface Props {
  service?: TypeServiceFunctions<ManagedType>
  store?: any // Pinia store instance
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
}

const props = withDefaults(defineProps<Props>(), {
  service: undefined,
  store: undefined,
  iconClass: 'text-muted-foreground',
  iconWrapperClass: 'bg-secondary',
})

// Determine if we use store or service
const isStore = !!props.store

// Use computed to unify API
let collection: any
if (isStore) {
  collection = useTypeStoreCollection<ManagedType>(props.store)
} else {
  collection = useTypeCollection<ManagedType>(props.service!)
}

const {
  types,
  loading,
  page,
  itemPerPage,
  totalCount,
  fetchTypes,
  gotoPage,
  createType,
  updateType,
  deleteType,
} = collection

// Wrappers to pass to modals
const handleCreate = async (name: string) => {
  await createType(name)
}
const handleUpdate = async (id: string, name: string) => {
  await updateType(id, name)
}
const handleDelete = async (id: string) => {
  await deleteType(id)
}

const safeItemsPerPage = computed(() => itemPerPage.value || 10)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / safeItemsPerPage.value)))
const showPagination = computed(() => totalCount.value > 0)

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const typeToEdit = ref<ManagedType | null>(null)
const typeToDeleteId = ref<string | null>(null)

async function reload(pageToLoad = page.value || 1) {
  // If store, fetchTypes handles caching logic, but page reload might force
  // For simplicity, just call fetchTypes
  await fetchTypes({ page: pageToLoad }) 
}

async function onPageChange(nextPage: number) {
  if (nextPage === page.value || nextPage < 1 || nextPage > totalPages.value) return
  await gotoPage(nextPage)
}

function openEditModal(item: ManagedType) {
  typeToEdit.value = item
  showEditModal.value = true
}

function openDeleteModal(itemId: string) {
  typeToDeleteId.value = itemId
  showDeleteModal.value = true
}

async function onCreated() {
  if (isStore) {
    await gotoPage(1)
  } else {
    await reload(1)
  }
}

async function onUpdated() {
  if (!isStore) await reload(page.value)
}

async function onDeleteConfirmed() {
  if (!isStore) await reload(page.value)
}

// Initial load
if (!isStore) {
  // Only manually load if service based. Store based handles via watcher in composable.
  // Actually, composable watcher might need initial run. 
  // useTypeStoreCollection has { immediate: true } on watcher, so it handles it.
  
  // Wait, service based useTypeCollection DOES NOT have watcher on route query?
  // Let's check usePaginatedCollection.
  // Yes, usePaginatedCollection has watcher { immediate: true, deep: true }.
  
  // So both should handle initial load automatically if query params exist?
  // usePaginatedCollection:
  // const initialState = getStateFromRoute()
  // page.value = initialState.page
  
  // But usePaginatedCollection watcher triggers fetchPage if state changes.
  // Initial state setup does NOT trigger watcher immediately because it sets state before watcher.
  
  // So standard pattern is to call reload() manually on mount?
  // In `usePaginatedCollection.ts`:
  // watch( ... { immediate: true }) -> wait, if immediate is true, it runs.
  
  // But TypeManagementPage was calling `await reload()` at the end of script.
  // So explicit load is expected.
  
  // For store: useTypeStoreCollection watcher has immediate: true.
  // So it will fetch.
  
  // For service: we should call reload().
   reload()
}
</script>

<template>
  <div>
    <PageHeaderBar align="center">
      <template #left>
        <h1 class="text-2xl font-bold tracking-tight">
          {{ props.title }}
        </h1>
      </template>

      <template #actions>
        <Button
          class="w-full justify-center cursor-pointer xl:w-auto"
          @click="showCreateModal = true"
        >
          <Plus class="h-4 w-4" />
          {{ props.newLabel }}
        </Button>
      </template>
    </PageHeaderBar>

    <div v-if="types.length === 0 && !loading" class="py-16 text-center text-muted-foreground">
      {{ props.emptyLabel }}
    </div>

    <div v-else class="space-y-3">
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

    <CustomPagination
      v-show="showPagination"
      class="mt-4"
      :page="page"
      :items-per-page="safeItemsPerPage"
      :total="totalCount"
      :loading="loading"
      @update:page="onPageChange"
    />

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
  </div>
</template>
