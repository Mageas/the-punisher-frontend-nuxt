<script setup lang="ts">
import type { Component } from 'vue'
import { Plus } from 'lucide-vue-next'
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
} = useTypeCollection<ManagedType>(props.service)

// Wrappers to pass to modals
const handleCreate = (name: string) => createType(name)
const handleUpdate = (id: string, name: string) => updateType(id, name)
const handleDelete = (id: string) => deleteType(id)

const safeItemsPerPage = computed(() => itemPerPage.value || 10)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / safeItemsPerPage.value)))
const showPagination = computed(() => totalCount.value > 0)

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const typeToEdit = ref<ManagedType | null>(null)
const typeToDeleteId = ref<string | null>(null)

async function reload(pageToLoad = page.value || 1) {
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
  await reload(1)
}

async function onUpdated() {
  await reload(page.value)
}

async function onDeleteConfirmed() {
  await reload(page.value)
}

await reload()
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
