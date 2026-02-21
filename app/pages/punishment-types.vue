<script setup lang="ts">
import { Gavel } from 'lucide-vue-next'
import { usePunishmentTypesStore } from '~/stores/types/punishment-types.store'

const { t } = useI18n()
const store = usePunishmentTypesStore()
</script>

<template>
  <TypeManagementPage
    :store="store"
    :title="t('punishmentTypes.title')"
    :new-label="t('punishmentTypes.newType')"
    :empty-label="t('punishmentTypes.noTypes')"
    :create-title="t('punishmentTypes.createTitle')"
    :create-placeholder="t('punishmentTypes.placeholder')"
    :edit-title="t('punishmentTypes.editTitle')"
    :delete-message="t('punishmentTypes.deleteMessage')"
    :icon="Gavel"
    icon-class="text-purple-400"
    icon-wrapper-class="bg-purple-400/10"
  />
</template>
