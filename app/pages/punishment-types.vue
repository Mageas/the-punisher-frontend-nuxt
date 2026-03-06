<script setup lang="ts">
import { FileWarning } from 'lucide-vue-next'

const { t } = useI18n()
const typeService = useTypeService()

const punishmentTypeServices = {
  getTypes: typeService.getPunishmentTypes,
  createType: typeService.createPunishmentType,
  updateType: typeService.updatePunishmentType,
  deleteType: typeService.deletePunishmentType,
}
</script>

<template>
  <TypeManagementPage
    :service="punishmentTypeServices"
    :title="t('common.titles.punishmentTypes')"
    :new-label="t('common.actions.addType')"
    :empty-label="t('punishmentTypes.noTypes')"
    :create-title="t('punishmentTypes.createTitle')"
    :create-placeholder="t('punishmentTypes.placeholder')"
    :edit-title="t('punishmentTypes.editTitle')"
    :delete-message="t('punishmentTypes.deleteMessage')"
    :icon="FileWarning"
    icon-class="text-danger"
    icon-wrapper-class="bg-danger-bg-subtle"
  />
</template>
