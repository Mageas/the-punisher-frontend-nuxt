// https://nuxt.com/docs/api/configuration/nuxt-config
const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: env.NUXT_DEVTOOLS === 'true' },
  runtimeConfig: {
    public: {
      apiBaseUrl: env.NUXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/v1',
    },
  },
  css: ['~/assets/css/tailwind.css'],
  modules: ['@nuxtjs/tailwindcss', 'shadcn-nuxt', '@nuxtjs/i18n'],
  i18n: {
    locales: [
      {
        code: 'fr',
        file: 'fr.json'
      }
    ],
    langDir: 'locales',
    defaultLocale: 'fr',
    strategy: 'no_prefix',
  },
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: '@/components/ui'
  }
})
