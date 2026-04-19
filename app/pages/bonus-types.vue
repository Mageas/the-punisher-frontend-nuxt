<script setup lang="ts">
import { Trophy } from 'lucide-vue-next'

const { t } = useI18n()
useSeoMeta({ title: () => t('common.titles.bonusTypes') })

const typeService = useTypeService()

const bonusTypeServices = {
  getTypes: typeService.getBonusTypes,
  createType: typeService.createBonusType,
  updateType: typeService.updateBonusType,
  deleteType: typeService.deleteBonusType,
}
</script>

<template>
  <TypeManagementPage
    :service="bonusTypeServices"
    :title="t('common.titles.bonusTypes')"
    :new-label="t('common.actions.addType')"
    :empty-label="t('bonusTypes.noTypes')"
    :create-title="t('bonusTypes.createTitle')"
    :create-placeholder="t('bonusTypes.placeholder')"
    :edit-title="t('bonusTypes.editTitle')"
    :delete-message="t('bonusTypes.deleteMessage')"
    :icon="Trophy"
    icon-class="text-warning"
    icon-wrapper-class="bg-warning-bg-subtle"
  />
</template>
