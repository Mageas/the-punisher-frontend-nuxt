<script setup lang="ts">
import { Gift, Plus, Search, Trash2 } from 'lucide-vue-next'
import { refDebounced } from '@vueuse/core'

const { t } = useI18n()
const route = useRoute()
const {
  bonuses,
  loading,
  page,
  filters,
  itemPerPage,
  totalCount,
  fetchBonuses,
  gotoPage,
  applyFilters,
  useBonus,
  deleteBonus,
} = useBonuses()

// Search
const searchQuery = ref(filters.search || '')
const searchDebounced = refDebounced(searchQuery, 300)

const safeItemsPerPage = computed(() => itemPerPage.value || 10)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / safeItemsPerPage.value)))
const showPagination = computed(() => totalCount.value > 0)

// Modals
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const showUseModal = ref(false)
const bonusToDeleteId = ref<string | null>(null)
const bonusToUseId = ref<string | null>(null)

// Fetch with current filters
async function reload(pageToLoad = page.value || 1) {
  await fetchBonuses({
    page: pageToLoad,
    search: searchDebounced.value || undefined,
    state: filters.state,
  })
}

async function onPageChange(nextPage: number) {
  if (nextPage === page.value || nextPage < 1 || nextPage > totalPages.value) return
  await gotoPage(nextPage)
}

async function handleUse(id: string) {
  await useBonus(id)
}

function openDeleteModal(id: string) {
  bonusToDeleteId.value = id
  showDeleteModal.value = true
}

function openUseModal(id: string) {
  bonusToUseId.value = id
  showUseModal.value = true
}

async function onDeleteConfirmed() {
  await reload(page.value)
}

async function onUseConfirmed() {
  await reload(page.value)
}

async function onCreated() {
  await reload(1)
}

watch(searchDebounced, async (newSearch) => {
  await applyFilters({ search: newSearch })
})

await useAsyncData(
  () => `bonuses:initial:${route.fullPath}`,
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
          {{ t('bonuses.title') }}
        </h1>
      </template>

      <template #actions>
        <Button
          class="w-full justify-center cursor-pointer xl:w-auto"
          @click="showCreateModal = true"
        >
          <Plus class="w-4 h-4" />
          {{ t('bonuses.newBonus') }}
        </Button>
      </template>
    </PageHeaderBar>

    <div class="relative mb-6">
      <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input v-model="searchQuery" :placeholder="t('bonuses.searchPlaceholder')" class="pl-9" />
    </div>

    <div v-if="bonuses.length === 0 && !loading" class="py-16 text-center text-muted-foreground">
      {{ t('bonuses.noBonuses') }}
    </div>

    <div v-else class="space-y-3">
      <BonusCard
        v-for="bonus in bonuses"
        :key="bonus.id"
        :bonus-type-name="bonus.bonus_type_name"
        :points="bonus.points"
        :used-at="bonus.used_at"
        :created-at="bonus.created_at"
        :student-id="bonus.student_id"
        :student-first-name="bonus.student_first_name"
        :student-last-name="bonus.student_last_name"
      >
        <template #actions>
          <Button
            v-if="!bonus.used_at"
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer text-muted-foreground hover:text-foreground"
            :title="t('common.consume')"
            :aria-label="t('common.consume')"
            @click="openUseModal(bonus.id)"
          >
            <Gift class="w-5 h-5 text-amber-400" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer text-muted-foreground hover:text-foreground"
            :title="t('modals.delete.confirm')"
            :aria-label="t('modals.delete.confirm')"
            @click="openDeleteModal(bonus.id)"
          >
            <Trash2 class="w-4 h-4 text-red-400" />
          </Button>
        </template>
      </BonusCard>
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

    <BonusCreateModal v-model:open="showCreateModal" @created="onCreated" />
    <BonusDeleteModal
      v-model:open="showDeleteModal"
      :bonus-id="bonusToDeleteId"
      :delete-fn="deleteBonus"
      @confirmed="onDeleteConfirmed"
    />
    <BonusUseModal
      v-model:open="showUseModal"
      :bonus-id="bonusToUseId"
      :use-fn="handleUse"
      @confirmed="onUseConfirmed"
    />
  </div>
</template>
