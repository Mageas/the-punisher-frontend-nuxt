<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'

const { t } = useI18n()
const typeService = useTypeService()

const penaltyTypeServices = {
  getTypes: typeService.getPenaltyTypes,
  createType: typeService.createPenaltyType,
  updateType: typeService.updatePenaltyType,
  deleteType: typeService.deletePenaltyType,
}
</script>

<template>
  <TypeManagementPage
    :service="penaltyTypeServices"
    :title="t('common.titles.penaltyTypes')"
    :new-label="t('common.actions.addType')"
    :empty-label="t('penaltyTypes.noTypes')"
    :create-title="t('penaltyTypes.createTitle')"
    :create-placeholder="t('penaltyTypes.placeholder')"
    :edit-title="t('penaltyTypes.editTitle')"
    :delete-message="t('penaltyTypes.deleteMessage')"
    :icon="AlertCircle"
    icon-class="text-warning"
    icon-wrapper-class="bg-warning-bg-subtle"
  />
</template>
