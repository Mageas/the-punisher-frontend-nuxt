/**
 * This file extends Vue's global HTML attributes to allow custom attributes
 * used by Shadcn and other libraries (like `data-slot`) in templates.
 *
 * This prevents TypeScript errors during `nuxt typecheck` when these attributes
 * are used on standard HTML elements.
 */
import '@vue/runtime-dom'

declare module '@vue/runtime-dom' {
  interface HTMLAttributes {
    'data-slot'?: string
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
  }
}

export {}
