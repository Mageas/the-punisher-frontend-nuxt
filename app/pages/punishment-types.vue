<script setup lang="ts">
import { FileWarning } from 'lucide-vue-next'
import { typeService } from '~/services/type.service'

const { t } = useI18n()

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
    :title="t('punishmentTypes.title')"
    :new-label="t('punishmentTypes.newType')"
    :empty-label="t('punishmentTypes.noTypes')"
    :create-title="t('punishmentTypes.createTitle')"
    :create-placeholder="t('punishmentTypes.placeholder')"
    :edit-title="t('punishmentTypes.editTitle')"
    :delete-message="t('punishmentTypes.deleteMessage')"
    :icon="FileWarning"
    icon-class="text-red-400"
    icon-wrapper-class="bg-red-400/10"
  />
</template>
