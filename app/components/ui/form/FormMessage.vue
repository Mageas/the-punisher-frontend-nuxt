<script lang="ts" setup>
import type { HTMLAttributes } from "vue"
import { FormContextKey, PublicFormContextKey, useFieldError } from "vee-validate"
import { computed, inject, unref } from "vue"
import { cn } from "@/lib/utils"
import { useFormField } from "./useFormField"

const props = defineProps<{
  class?: HTMLAttributes["class"]
  name?: string
}>()

const { error, formMessageId } = useFormField()
const namedError = useFieldError(() => props.name || "")
const privateFormContext = inject(FormContextKey, undefined)
const publicFormContext = inject(PublicFormContextKey, undefined)
const hasSubmitted = computed(() => {
  const submitCount = privateFormContext?.submitCount ?? publicFormContext?.submitCount ?? 0
  return unref(submitCount) > 0
})
const visibleError = computed(() => {
  const resolvedError = props.name ? namedError.value : error.value
  return hasSubmitted.value ? resolvedError : ""
})
</script>

<template>
  <p
    v-if="visibleError"
    :id="formMessageId"
    data-slot="form-message"
    :class="cn('text-destructive text-sm', props.class)"
  >
    {{ visibleError }}
  </p>
</template>
