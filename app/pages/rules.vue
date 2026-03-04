<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import type { Rule } from '~/types/api'

const { t } = useI18n()
const {
  rules,
  loading,
  page,
  itemPerPage,
  totalCount,
  fetchRules,
  gotoPage,
  updateRule,
  deleteRule,
} = useRules()
const { globalError, handleApiError, clearErrors } = useApiErrors()

const safeItemsPerPage = computed(() => itemPerPage.value || 10)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / safeItemsPerPage.value)))
const showPagination = computed(() => totalCount.value > 0)

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const ruleToEdit = ref<Rule | null>(null)
const ruleToDeleteId = ref<string | null>(null)
const togglingById = ref<Record<string, boolean>>({})

async function reload(pageToLoad = page.value || 1) {
  await fetchRules({ page: pageToLoad })
}

async function onPageChange(nextPage: number) {
  if (nextPage === page.value || nextPage < 1 || nextPage > totalPages.value) return
  await gotoPage(nextPage)
}

async function onToggleActive(rule: Rule, nextIsActive: boolean) {
  if (togglingById.value[rule.id] || nextIsActive === rule.is_active) return

  clearErrors()
  togglingById.value = { ...togglingById.value, [rule.id]: true }

  try {
    await updateRule(rule.id, { is_active: nextIsActive })
    await reload(page.value)
  } catch (err) {
    handleApiError(err)
  } finally {
    const { [rule.id]: _ignored, ...rest } = togglingById.value
    togglingById.value = rest
  }
}

function openEditModal(rule: Rule) {
  ruleToEdit.value = rule
  showEditModal.value = true
}

function openDeleteModal(ruleId: string) {
  ruleToDeleteId.value = ruleId
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
          {{ t('rules.title') }}
        </h1>
      </template>

      <template #actions>
        <Button
          class="w-full justify-center cursor-pointer md:w-auto"
          @click="showCreateModal = true"
        >
          <Plus class="w-4 h-4" />
          {{ t('rules.newRule') }}
        </Button>
      </template>
    </PageHeaderBar>

    <Alert v-if="globalError" variant="destructive" class="mb-6">
      <AlertDescription>{{ globalError }}</AlertDescription>
    </Alert>

    <div v-if="rules.length === 0 && !loading" class="py-16 text-center text-muted-foreground">
      {{ t('rules.noRules') }}
    </div>

    <div v-else class="space-y-3">
      <RuleCard
        v-for="rule in rules"
        :key="rule.id"
        :name="rule.name"
        :penalty-type-name="rule.penalty_type_name"
        :punishment-type-name="rule.resulting_punishment_type_name"
        :threshold="rule.threshold"
        :due-at-after-days="rule.due_at_after_days"
        :mode="rule.mode"
        :is-active="rule.is_active"
        :toggling="Boolean(togglingById[rule.id])"
        @toggle-active="(nextIsActive) => onToggleActive(rule, nextIsActive)"
        @edit="openEditModal(rule)"
        @delete="openDeleteModal(rule.id)"
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

    <RuleCreateModal v-model:open="showCreateModal" @created="onCreated" />
    <RuleEditModal v-model:open="showEditModal" :rule="ruleToEdit" @updated="onUpdated" />
    <RuleDeleteModal
      v-model:open="showDeleteModal"
      :rule-id="ruleToDeleteId"
      :delete-fn="deleteRule"
      @confirmed="onDeleteConfirmed"
    />
  </div>
</template>
