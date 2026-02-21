<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'
import { usePenaltyTypesStore } from '~/stores/types/penalty-types.store'

const { t } = useI18n()
const store = usePenaltyTypesStore()
</script>

<template>
  <TypeManagementPage
    :store="store"
    :title="t('penaltyTypes.title')"
    :new-label="t('penaltyTypes.newType')"
    :empty-label="t('penaltyTypes.noTypes')"
    :create-title="t('penaltyTypes.createTitle')"
    :create-placeholder="t('penaltyTypes.placeholder')"
    :edit-title="t('penaltyTypes.editTitle')"
    :delete-message="t('penaltyTypes.deleteMessage')"
    :icon="AlertCircle"
    icon-class="text-red-400"
    icon-wrapper-class="bg-red-400/10"
  />
</template>
