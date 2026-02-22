// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  runtimeConfig: {
    apiBaseUrlServer:
      process.env.NUXT_API_BASE_URL_SERVER ||
      process.env.NUXT_PUBLIC_API_BASE_URL ||
      'http://localhost:8080/v1',
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/v1',
    },
  },
  modules: ['@nuxtjs/tailwindcss', 'shadcn-nuxt', '@nuxtjs/i18n', '@pinia/nuxt', '@nuxt/eslint'],
  imports: {
    dirs: ['composables', 'composables/services'],
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
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
    componentDir: '@/components/ui',
  },
  i18n: {
    locales: [
      {
        code: 'fr',
        language: 'fr-FR',
        name: 'Francais',
        file: 'fr.json',
      },
    ],
    defaultLocale: 'fr',
    strategy: 'no_prefix',
    langDir: 'locales',
    detectBrowserLanguage: false,
  },
})
