<script setup lang="ts">
import { Gift, Plus, Search, Trash2 } from 'lucide-vue-next'
import { refDebounced } from '@vueuse/core'
import CustomPagination from '~/components/CustomPagination.vue'
import BonusCreateModal from '~/components/modals/BonusCreateModal.vue'
import BonusDeleteModal from '~/components/modals/BonusDeleteModal.vue'
import BonusUseModal from '~/components/modals/BonusUseModal.vue'

const { t } = useI18n()
const {
  bonuses,
  loading,
  page,
  itemPerPage,
  totalCount,
  fetchBonuses,
  useBonus,
  deleteBonus,
} = useBonuses()

// Search
const searchQuery = ref('')
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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatPoints(points: number): string {
  return `+${points}`
}

// Fetch with current filters
async function reload(pageToLoad = page.value || 1) {
  await fetchBonuses({
    page: pageToLoad,
    search: searchDebounced.value || undefined,
  })
}

async function onPageChange(nextPage: number) {
  if (nextPage === page.value || nextPage < 1 || nextPage > totalPages.value) return
  await reload(nextPage)
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

function onDeleteConfirmed() {
  reload(page.value)
}

function onUseConfirmed() {
  reload(page.value)
}

function onCreated() {
  reload(1)
}

watch(searchDebounced, () => {
  reload(1)
})

await reload()
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
        <Button class="w-full justify-center cursor-pointer xl:w-auto" @click="showCreateModal = true">
          <Plus class="w-4 h-4" />
          {{ t('bonuses.newBonus') }}
        </Button>
      </template>
    </PageHeaderBar>

    <div class="relative mb-6">
      <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        v-model="searchQuery"
        :placeholder="t('bonuses.searchPlaceholder')"
        class="pl-9"
      />
    </div>

    <div v-if="bonuses.length === 0 && !loading" class="py-16 text-center text-muted-foreground">
      {{ t('bonuses.noBonuses') }}
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="bonus in bonuses"
        :key="bonus.id"
        class="flex flex-wrap items-start gap-4 rounded-lg border border-border p-4 sm:flex-nowrap sm:items-center"
        :class="{ 'opacity-60': bonus.used_at }"
      >
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
          :class="bonus.used_at ? 'bg-secondary text-muted-foreground' : 'bg-amber-400/10 text-amber-400'"
        >
          {{ formatPoints(bonus.points) }}
        </div>

        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium">
            {{ bonus.student_first_name }} {{ bonus.student_last_name }}
          </p>
          <p class="mt-0.5 text-xs text-muted-foreground">
            {{ bonus.bonus_type_name }} — {{ formatDate(bonus.created_at) }}
          </p>
        </div>

        <div class="flex w-full items-center justify-start gap-2 sm:ml-auto sm:w-auto sm:shrink-0 sm:justify-end">
          <div class="flex items-center gap-2 text-left sm:mr-2 sm:block sm:text-right">
            <Badge
              variant="outline"
              :class="bonus.used_at ? 'text-muted-foreground' : 'text-green-400 border-green-400/30'"
            >
              {{ bonus.used_at ? t('common.used') : t('common.available') }}
            </Badge>
            <p v-if="bonus.used_at" class="text-xs text-muted-foreground sm:mt-1">
              {{ t('bonuses.usedAt', { date: formatDate(bonus.used_at) }) }}
            </p>
          </div>

          <button
            v-if="!bonus.used_at"
            class="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
            :title="t('common.consume')"
            @click="openUseModal(bonus.id)"
          >
            <Gift class="w-5 h-5 text-amber-400" />
          </button>

          <button
            class="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
            :title="t('modals.delete.confirm')"
            @click="openDeleteModal(bonus.id)"
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
