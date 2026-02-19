<script setup lang="ts">
import { Plus, Search, Trash2 } from 'lucide-vue-next'
import { refDebounced } from '@vueuse/core'
import CustomPagination from '~/components/CustomPagination.vue'
import PenaltyCreateModal from '~/components/modals/PenaltyCreateModal.vue'
import PenaltyDeleteModal from '~/components/modals/PenaltyDeleteModal.vue'

const { t } = useI18n()
const {
  penalties,
  loading,
  page,
  itemPerPage,
  totalCount,
  fetchPenalties,
  deletePenalty,
} = usePenalties()

// Search
const searchQuery = ref('')
const searchDebounced = refDebounced(searchQuery, 300)

const safeItemsPerPage = computed(() => itemPerPage.value || 10)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / safeItemsPerPage.value)))
const showPagination = computed(() => totalCount.value > 0)

// Modals
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const penaltyToDeleteId = ref<string | null>(null)

// Fetch with current filters
async function reload(pageToLoad = page.value || 1) {
  await fetchPenalties({
    page: pageToLoad,
    search: searchDebounced.value || undefined,
  })
}

async function onPageChange(nextPage: number) {
  if (nextPage === page.value || nextPage < 1 || nextPage > totalPages.value) return
  await reload(nextPage)
}

function openDeleteModal(id: string) {
  penaltyToDeleteId.value = id
  showDeleteModal.value = true
}

function onDeleteConfirmed() {
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
          {{ t('penalties.title') }}
        </h1>
      </template>

      <template #actions>
        <Button class="w-full justify-center cursor-pointer xl:w-auto" @click="showCreateModal = true">
          <Plus class="w-4 h-4" />
          {{ t('penalties.newPenalty') }}
        </Button>
      </template>
    </PageHeaderBar>

    <div class="relative mb-6">
      <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        v-model="searchQuery"
        :placeholder="t('penalties.searchPlaceholder')"
        class="pl-9"
      />
    </div>

    <div v-if="penalties.length === 0 && !loading" class="py-16 text-center text-muted-foreground">
      {{ t('penalties.noPenalties') }}
    </div>

    <div v-else class="space-y-3">
      <PenaltyCard
        v-for="penalty in penalties"
        :key="penalty.id"
        :penalty-type-name="penalty.penalty_type_name"
        :created-at="penalty.created_at"
        :student-id="penalty.student_id"
        :student-first-name="penalty.student_first_name"
        :student-last-name="penalty.student_last_name"
      >
        <template #actions>
          <Button
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer text-muted-foreground hover:text-foreground"
            :title="t('modals.delete.confirm')"
            :aria-label="t('modals.delete.confirm')"
            @click="openDeleteModal(penalty.id)"
          >
            <Trash2 class="w-4 h-4 text-red-400" />
          </Button>
        </template>
      </PenaltyCard>
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

    <PenaltyCreateModal v-model:open="showCreateModal" @created="onCreated" />
    <PenaltyDeleteModal
      v-model:open="showDeleteModal"
      :penalty-id="penaltyToDeleteId"
      :delete-fn="deletePenalty"
      @confirmed="onDeleteConfirmed"
    />
  </div>
</template>
