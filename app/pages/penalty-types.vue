<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'

const { t } = useI18n()
</script>

<template>
  <TypeManagementPage
    endpoint="/penalty-types/"
    :title="t('penaltyTypes.title')"
    :new-label="t('penaltyTypes.newType')"
    :empty-label="t('penaltyTypes.noTypes')"
    :create-title="t('penaltyTypes.createTitle')"
    :create-placeholder="t('penaltyTypes.placeholder')"
    :edit-title="t('penaltyTypes.editTitle')"
    :delete-message="t('penaltyTypes.deleteMessage')"
    :icon="AlertCircle"
    icon-class="text-amber-400"
    icon-wrapper-class="bg-amber-400/10"
  />
</template>
