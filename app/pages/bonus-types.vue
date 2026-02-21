<script setup lang="ts">
import { Trophy } from 'lucide-vue-next'
import { useBonusTypesStore } from '~/stores/types/bonus-types.store'

const { t } = useI18n()
const store = useBonusTypesStore()
</script>

<template>
  <TypeManagementPage
    :store="store"
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
