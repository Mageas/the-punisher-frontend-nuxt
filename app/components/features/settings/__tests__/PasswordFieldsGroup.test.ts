import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PasswordFieldsGroup from '../PasswordFieldsGroup.vue'

const mockI18n = {
  t: (key: string) =>
    ({
      'userSettings.currentPassword': 'Mot de passe actuel',
      'userSettings.newPassword': 'Nouveau mot de passe',
      'userSettings.confirmPassword': 'Confirmer le mot de passe',
    })[key] ?? key,
  te: () => true,
}

vi.mock('vue-i18n', () => ({
  useI18n: () => mockI18n,
}))

const stubs = {
  PasswordFieldControl: {
    props: ['id', 'modelValue', 'label', 'fieldName', 'error', 'hint', 'placeholder'],
    template: `
      <div :data-testid="'password-field-' + fieldName">
        <span>{{ label }}</span>
        <span v-if="error">{{ error }}</span>
        <span v-if="hint">{{ hint }}</span>
        <button type="button" :data-testid="'clear-' + fieldName" @click="$emit('clear-error', fieldName)">clear</button>
        <button type="button" :data-testid="'update-' + fieldName" @click="$emit('update:modelValue', fieldName + '-value')">update</button>
      </div>
    `,
  },
}

describe('PasswordFieldsGroup', () => {
  it('renders the three password field controls with their labels, errors and hint', () => {
    const wrapper = mount(PasswordFieldsGroup, {
      props: {
        currentPassword: 'old',
        newPassword: 'new',
        confirmPassword: 'confirm',
        currentPasswordError: 'Erreur actuelle',
        newPasswordHint: 'Au moins 8 caracteres',
      },
      global: {
        stubs,
      },
    })

    expect(wrapper.text()).toContain('Mot de passe actuel')
    expect(wrapper.text()).toContain('Nouveau mot de passe')
    expect(wrapper.text()).toContain('Confirmer le mot de passe')
    expect(wrapper.text()).toContain('Erreur actuelle')
    expect(wrapper.text()).toContain('Au moins 8 caracteres')
  })

  it('forwards clear-field-error and named v-model updates', async () => {
    const wrapper = mount(PasswordFieldsGroup, {
      props: {
        currentPassword: 'old',
        newPassword: 'new',
        confirmPassword: 'confirm',
      },
      global: {
        stubs,
      },
    })

    await wrapper.get('[data-testid="clear-new_password"]').trigger('click')
    await wrapper.get('[data-testid="update-current_password"]').trigger('click')
    await wrapper.get('[data-testid="update-confirm_password"]').trigger('click')

    expect(wrapper.emitted('clear-field-error')).toEqual([['new_password']])
    expect(wrapper.emitted('update:currentPassword')).toEqual([['current_password-value']])
    expect(wrapper.emitted('update:confirmPassword')).toEqual([['confirm_password-value']])
  })
})
