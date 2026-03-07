import { FieldContextKey, FormContextKey, PublicFormContextKey } from "vee-validate"
import { computed, inject, unref } from "vue"
import { FORM_ITEM_INJECTION_KEY } from "./injectionKeys"

export function useFormField() {
  const fieldContext = inject(FieldContextKey)
  const fieldItemContext = inject(FORM_ITEM_INJECTION_KEY)
  const privateFormContext = inject(FormContextKey, undefined)
  const publicFormContext = inject(PublicFormContextKey, undefined)

  if (!fieldContext)
    throw new Error("useFormField should be used within <FormField>")

  const { name, errorMessage: error, meta } = fieldContext
  const id = fieldItemContext
  const hasSubmitted = computed(() => {
    const submitCount = privateFormContext?.submitCount ?? publicFormContext?.submitCount ?? 0
    return unref(submitCount) > 0
  })
  const hasVisibleError = computed(() => !!error.value && hasSubmitted.value)
  const visibleError = computed(() => (hasVisibleError.value ? error.value : ""))

  const fieldState = {
    valid: computed(() => meta.valid),
    isDirty: computed(() => meta.dirty),
    isTouched: computed(() => meta.touched),
    error: visibleError,
    hasVisibleError,
  }

  return {
    id,
    name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}
