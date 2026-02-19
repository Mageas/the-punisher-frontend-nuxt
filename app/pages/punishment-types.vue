<script setup lang="ts">
import { FileWarning } from 'lucide-vue-next'

const { t } = useI18n()
</script>

<template>
  <TypeManagementPage
    endpoint="/punishment-types/"
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
