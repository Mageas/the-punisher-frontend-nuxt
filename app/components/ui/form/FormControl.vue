<script lang="ts" setup>
import { Slot } from "reka-ui"
import { useFormField } from "./useFormField"

const { hasVisibleError, formItemId, formDescriptionId, formMessageId } = useFormField()
</script>

<template>
  <Slot
    :id="formItemId"
    data-slot="form-control"
    :aria-describedby="!hasVisibleError ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`"
    :aria-invalid="hasVisibleError"
  >
    <slot />
  </Slot>
</template>
