<script setup lang="ts">
import { Trophy } from 'lucide-vue-next'

const { t } = useI18n()
</script>

<template>
  <TypeManagementPage
    endpoint="/bonus-types/"
    :title="t('bonusTypes.title')"
    :new-label="t('bonusTypes.newType')"
    :empty-label="t('bonusTypes.noTypes')"
    :create-title="t('bonusTypes.createTitle')"
    :create-placeholder="t('bonusTypes.placeholder')"
    :edit-title="t('bonusTypes.editTitle')"
    :delete-message="t('bonusTypes.deleteMessage')"
    :icon="Trophy"
    icon-class="text-amber-400"
    icon-wrapper-class="bg-amber-400/10"
  />
</template>
