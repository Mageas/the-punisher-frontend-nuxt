import withNuxt from './.nuxt/eslint.config.mjs'
import unusedImports from 'eslint-plugin-unused-imports'

export default withNuxt([
  // Global ignores
  {
    ignores: ['app/components/ui/**', '.nuxt/**', '.output/**', 'node_modules/**', 'dist/**'],
  },
  // Custom rules & Plugins
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'vue/multi-word-component-names': 'off',

      // Semicolons & Quotes
      semi: ['error', 'never'],
      quotes: ['error', 'single'],

      // Unused imports & variables (Errors)
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
])
