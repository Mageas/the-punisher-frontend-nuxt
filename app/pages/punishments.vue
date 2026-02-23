<script setup lang="ts">
import { CircleCheck, Plus, Search, Trash2 } from 'lucide-vue-next'
import { refDebounced } from '@vueuse/core'

const { t } = useI18n()
const route = useRoute()
const {
  punishments,
  loading,
  page,
  filters,
  itemPerPage,
  totalCount,
  fetchPunishments,
  gotoPage,
  applyFilters,
  resolvePunishment,
  deletePunishment,
} = usePunishments()

// Search
const searchQuery = ref(filters.search || '')
const searchDebounced = refDebounced(searchQuery, 300)

const safeItemsPerPage = computed(() => itemPerPage.value || 10)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / safeItemsPerPage.value)))
const showPagination = computed(() => totalCount.value > 0)

// Modals
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const showResolveModal = ref(false)
const punishmentToDeleteId = ref<string | null>(null)
const punishmentToResolveId = ref<string | null>(null)

// Fetch with current filters
async function reload(pageToLoad = page.value || 1) {
  await fetchPunishments({
    page: pageToLoad,
    search: searchDebounced.value || undefined,
    state: filters.state,
  })
}

async function onPageChange(nextPage: number) {
  if (nextPage === page.value || nextPage < 1 || nextPage > totalPages.value) return
  await gotoPage(nextPage)
}

// Resolve a punishment inline
async function handleResolve(id: string) {
  await resolvePunishment(id)
}

// Open delete modal
function openDeleteModal(id: string) {
  punishmentToDeleteId.value = id
  showDeleteModal.value = true
}

// Open resolve modal
function openResolveModal(id: string) {
  punishmentToResolveId.value = id
  showResolveModal.value = true
}

// After delete confirmed
async function onDeleteConfirmed() {
  await reload(page.value)
}

// After resolve confirmed
async function onResolveConfirmed() {
  await reload(page.value)
}

// After creation
async function onCreated() {
  await reload(1)
}

// Watch search changes
watch(searchDebounced, async (newSearch) => {
  await applyFilters({ search: newSearch })
})

await useAsyncData(
  () => `punishments:initial:${route.fullPath}`,
  async () => {
    await reload()
    return true
  },
  {
    server: true,
  },
)
</script>

<template>
  <div>
    <PageHeaderBar align="center">
      <template #left>
        <h1 class="text-2xl font-bold tracking-tight">
          {{ t('punishments.title') }}
        </h1>
      </template>

      <template #actions>
        <Button
          class="w-full justify-center cursor-pointer xl:w-auto"
          @click="showCreateModal = true"
        >
          <Plus class="w-4 h-4" />
          {{ t('punishments.newPunishment') }}
        </Button>
      </template>
    </PageHeaderBar>

    <div class="relative mb-6">
      <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="searchQuery" :placeholder="t('punishments.searchPlaceholder')" class="pl-9" />
    </div>

    <div
      v-if="punishments.length === 0 && !loading"
      class="py-16 text-center text-muted-foreground"
    >
      {{ t('punishments.noPunishments') }}
    </div>

    <div v-else class="space-y-3">
      <PunishmentCard
        v-for="punishment in punishments"
        :key="punishment.id"
        :punishment-type-name="punishment.punishment_type_name"
        :automated="punishment.automated"
        :triggering-rule-id="punishment.triggering_rule_id"
        :triggering-rule-name="punishment.triggering_rule_name"
        :due-at="punishment.due_at"
        :resolved-at="punishment.resolved_at"
        :student-id="punishment.student_id"
        :student-first-name="punishment.student_first_name"
        :student-last-name="punishment.student_last_name"
      >
        <template #actions>
          <Button
            v-if="!punishment.resolved_at"
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer text-muted-foreground hover:text-foreground"
            :title="t('common.resolve')"
            :aria-label="t('common.resolve')"
            @click="openResolveModal(punishment.id)"
          >
            <CircleCheck class="w-5 h-5 text-green-400" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer text-muted-foreground hover:text-foreground"
            :title="t('modals.delete.confirm')"
            :aria-label="t('modals.delete.confirm')"
            @click="openDeleteModal(punishment.id)"
          >
            <Trash2 class="w-4 h-4 text-red-400" />
          </Button>
        </template>
      </PunishmentCard>
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
    <PunishmentResolveModal
      v-model:open="showResolveModal"
      :punishment-id="punishmentToResolveId"
      :resolve-fn="handleResolve"
      @confirmed="onResolveConfirmed"
    />
  </div>
</template>
