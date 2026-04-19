<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import { getApiErrorStatus } from '~/lib/api-error'
import type { Rule } from '~/types/api'

const { t } = useI18n()
useSeoMeta({ title: () => t('common.titles.rules') })

const { selectedRuleId, openRuleDetails, closeRuleDetails } = useRuleDetailsRouteState()
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
const { notifyUpdateSuccess } = useActionToast()
const { safeItemsPerPage, totalPages, showPagination } = usePaginationMetrics({
  itemPerPage,
  totalCount,
})

const showCreateModal = ref(false)
const showDetailsModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const ruleToEdit = ref<Rule | null>(null)
const ruleToDeleteId = ref<string | null>(null)
const togglingById = ref<Record<string, boolean>>({})
const restoreDetailsAfterEdit = ref(false)
const { selectedRule, loadingSelectedRule, loadRule, clearSelectedRule } = useRuleDetails({
  initialRules: rules,
})

async function reload(pageToLoad = page.value || 1) {
  await fetchRules({ page: pageToLoad })
}

async function onPageChange(nextPage: number) {
  if (nextPage === page.value || nextPage < 1 || nextPage > totalPages.value) return
  await gotoPage(nextPage)
}

async function loadSelectedRule(ruleId: string) {
  clearErrors()

  try {
    await loadRule(ruleId)
  } catch (err) {
    showDetailsModal.value = false

    if (getApiErrorStatus(err) === 404) {
      handleApiError({ error: 'rule_not_found', error_code: 404 })
    } else {
      handleApiError(err)
    }

    await closeRuleDetails()
  }
}

async function onToggleActive(rule: Rule, nextIsActive: boolean) {
  if (togglingById.value[rule.id] || nextIsActive === rule.is_active) return

  clearErrors()
  togglingById.value = { ...togglingById.value, [rule.id]: true }

  try {
    await updateRule(rule.id, { is_active: nextIsActive })
    await reload(page.value)

    if (selectedRuleId.value === rule.id) {
      await loadSelectedRule(rule.id)
    }

    notifyUpdateSuccess()
  } catch (err) {
    handleApiError(err)
  } finally {
    const { [rule.id]: _ignored, ...rest } = togglingById.value
    togglingById.value = rest
  }
}

function openEditModal(rule: Rule, options?: { restoreDetails?: boolean }) {
  restoreDetailsAfterEdit.value = options?.restoreDetails ?? false
  ruleToEdit.value = rule
  showEditModal.value = true
}

function openDeleteModal(ruleId: string) {
  ruleToDeleteId.value = ruleId
  showDeleteModal.value = true
}

function onDetailsModalOpenChange(nextOpen: boolean) {
  showDetailsModal.value = nextOpen

  if (!nextOpen) {
    void closeRuleDetails()
  }
}

function onEditFromDetails() {
  if (!selectedRule.value) return

  showDetailsModal.value = false
  openEditModal(selectedRule.value, { restoreDetails: true })
}

async function onCreated() {
  await reload(1)
}

async function onUpdated() {
  await reload(page.value)

  if (selectedRuleId.value) {
    await loadSelectedRule(selectedRuleId.value)
  }
}

async function onDeleteConfirmed() {
  await reload(page.value)
}

watch(
  selectedRuleId,
  async (ruleId) => {
    if (!ruleId) {
      showDetailsModal.value = false
      clearSelectedRule()
      restoreDetailsAfterEdit.value = false
      return
    }

    showDetailsModal.value = true
    await loadSelectedRule(ruleId)
  },
  { immediate: true },
)

watch(showEditModal, (isOpen, wasOpen) => {
  if (!isOpen && wasOpen && restoreDetailsAfterEdit.value && selectedRuleId.value) {
    showDetailsModal.value = true
    restoreDetailsAfterEdit.value = false
  }
})

await reload()
</script>

<template>
  <div>
    <PageHeaderBar align="center">
      <template #left>
        <h1 class="text-2xl font-bold tracking-tight">
          {{ t('common.titles.rules') }}
        </h1>
      </template>

      <template #actions>
        <Button
          class="w-full justify-center cursor-pointer md:w-auto"
          @click="showCreateModal = true"
        >
          <Plus class="w-4 h-4" />
          {{ t('common.actions.addRule') }}
        </Button>
      </template>
    </PageHeaderBar>

    <Alert v-if="globalError" variant="destructive" class="mb-6">
      <AlertDescription>{{ globalError }}</AlertDescription>
    </Alert>

    <div v-if="rules.length === 0 && !loading" class="py-16 text-center text-muted-foreground">
      {{ t('common.empty.noRules') }}
    </div>

    <div v-else class="space-y-3">
      <RuleCard
        v-for="rule in rules"
        :key="rule.id"
        :name="rule.name"
        :penalty-type-name="rule.penalty_type_name"
        :punishment-type-name="rule.resulting_punishment_type_name"
        :threshold="rule.threshold"
        :due-at-mode="rule.due_at_mode"
        :due-at-after-days="rule.due_at_after_days"
        :due-at-after-lessons="rule.due_at_after_lessons"
        :mode="rule.mode"
        :is-active="rule.is_active"
        :toggling="Boolean(togglingById[rule.id])"
        @toggle-active="(nextIsActive) => onToggleActive(rule, nextIsActive)"
        @view="openRuleDetails(rule.id)"
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
    <RuleDetailsModal
      :open="showDetailsModal"
      :rule="selectedRule"
      :loading="loadingSelectedRule"
      show-edit-action
      @update:open="onDetailsModalOpenChange"
      @edit="onEditFromDetails"
    />
    <RuleEditModal v-model:open="showEditModal" :rule="ruleToEdit" @updated="onUpdated" />
    <RuleDeleteModal
      v-model:open="showDeleteModal"
      :rule-id="ruleToDeleteId"
      :delete-fn="deleteRule"
      @confirmed="onDeleteConfirmed"
    />
  </div>
</template>
