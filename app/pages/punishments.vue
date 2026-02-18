<script setup lang="ts">
import { CircleCheck, Gavel, Plus, Search, Trash2 } from 'lucide-vue-next'
import { refDebounced } from '@vueuse/core'
import CustomPagination from '~/components/CustomPagination.vue'
import PunishmentCreateModal from '~/components/modals/PunishmentCreateModal.vue'
import PunishmentDeleteModal from '~/components/modals/PunishmentDeleteModal.vue'

const { t } = useI18n()
const {
  punishments,
  loading,
  page,
  itemPerPage,
  totalCount,
  fetchPunishments,
  resolvePunishment,
  deletePunishment,
} = usePunishments()

// Search
const searchQuery = ref('')
const searchDebounced = refDebounced(searchQuery, 300)

const safeItemsPerPage = computed(() => itemPerPage.value || 10)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / safeItemsPerPage.value)))
const showPagination = computed(() => totalCount.value > 0)

// Modals
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const punishmentToDeleteId = ref<string | null>(null)

// Format date helper
function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Fetch with current filters
async function reload(pageToLoad = page.value || 1) {
  await fetchPunishments({
    page: pageToLoad,
    search: searchDebounced.value || undefined,
  })
}

async function onPageChange(nextPage: number) {
  if (nextPage === page.value || nextPage < 1 || nextPage > totalPages.value) return
  await reload(nextPage)
}

// Resolve a punishment inline
async function handleResolve(id: string) {
  await resolvePunishment(id)
  await reload(page.value)
}

// Open delete modal
function openDeleteModal(id: string) {
  punishmentToDeleteId.value = id
  showDeleteModal.value = true
}

// After delete confirmed
function onDeleteConfirmed() {
  reload(page.value)
}

// After creation
function onCreated() {
  reload(1)
}

// Watch search changes
watch(searchDebounced, () => {
  reload(1)
})

// Initial load
await reload()
</script>

<template>
  <div>
    <div class="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <h1 class="text-2xl font-bold tracking-tight">
        {{ t('punishments.title') }}
      </h1>
      <Button class="w-full justify-center cursor-pointer xl:w-auto" @click="showCreateModal = true">
        <Plus class="w-4 h-4" />
        {{ t('punishments.newPunishment') }}
      </Button>
    </div>

    <div class="relative mb-6">
      <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        v-model="searchQuery"
        :placeholder="t('punishments.searchPlaceholder')"
        class="pl-9"
      />
    </div>

    <div v-if="punishments.length === 0 && !loading" class="py-16 text-center text-muted-foreground">
      {{ t('punishments.noPunishments') }}
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="punishment in punishments"
        :key="punishment.id"
        class="flex flex-wrap items-start gap-4 rounded-lg border border-border p-4 sm:flex-nowrap sm:items-center"
        :class="{ 'opacity-60': punishment.resolved_at }"
      >
        <div class="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
          <Gavel class="w-4 h-4 text-muted-foreground" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <p class="text-sm font-medium">
              {{ punishment.student_first_name }} {{ punishment.student_last_name }}
            </p>
            <Badge
              v-if="punishment.triggering_rule_id"
              variant="outline"
              class="text-blue-400 border-blue-400/30 text-xs"
            >
              {{ t('common.auto') }}
            </Badge>
          </div>
          <p class="mt-0.5 text-xs text-muted-foreground">
            {{ punishment.punishment_type_name }}
            <template v-if="punishment.triggering_rule_name">
              — {{ punishment.triggering_rule_name }}
            </template>
            <template v-else-if="!punishment.triggering_rule_id">
              — {{ t('punishments.manualPunishment') }}
            </template>
          </p>
        </div>

        <div class="flex w-full items-center justify-between gap-2 sm:ml-auto sm:w-auto sm:shrink-0 sm:justify-end">
          <div class="text-left sm:mr-2 sm:text-right">
            <Badge
              v-if="!punishment.resolved_at"
              variant="outline"
              class="text-amber-400 border-amber-400/30"
            >
              {{ t('punishments.pending') }}
            </Badge>
            <Badge
              v-else
              variant="outline"
              class="text-green-400 border-green-400/30"
            >
              {{ t('punishments.resolved') }}
            </Badge>
            <p v-if="!punishment.resolved_at && punishment.due_at" class="mt-1 text-xs text-muted-foreground">
              {{ t('common.dueAt', { date: formatDate(punishment.due_at) }) }}
            </p>
            <p v-else-if="punishment.resolved_at" class="mt-1 text-xs text-muted-foreground">
              {{ t('punishments.resolvedAt', { date: formatDate(punishment.resolved_at) }) }}
            </p>
          </div>

          <button
            v-if="!punishment.resolved_at"
            class="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
            :title="t('common.resolve')"
            @click="handleResolve(punishment.id)"
          >
            <CircleCheck class="w-5 h-5 text-green-400" />
          </button>

          <button
            class="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
            @click="openDeleteModal(punishment.id)"
          >
            <Trash2 class="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
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

    <PunishmentCreateModal v-model:open="showCreateModal" @created="onCreated" />
    <PunishmentDeleteModal
      v-model:open="showDeleteModal"
      :punishment-id="punishmentToDeleteId"
      :delete-fn="deletePunishment"
      @confirmed="onDeleteConfirmed"
    />
  </div>
</template>
