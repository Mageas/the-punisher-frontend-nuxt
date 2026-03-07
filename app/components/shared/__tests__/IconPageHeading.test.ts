import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, markRaw } from 'vue'
import IconPageHeading from '../IconPageHeading.vue'

const IconStub = markRaw(defineComponent({
  template: '<svg data-testid="heading-icon" />',
}))

describe('IconPageHeading', () => {
  it('renders the icon, title and description with the default tone', () => {
    const wrapper = mount(IconPageHeading, {
      props: {
        icon: IconStub,
        title: 'Parametres utilisateur',
        description: 'Gerez la securite de votre compte.',
      },
    })

    expect(wrapper.find('[data-testid="heading-icon"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Parametres utilisateur')
    expect(wrapper.text()).toContain('Gerez la securite de votre compte.')
    expect(wrapper.get('[data-testid="icon-page-heading-icon-wrapper"]').classes()).toContain(
      'bg-primary/10',
    )
  })

  it('supports the danger tone for destructive pages', () => {
    const wrapper = mount(IconPageHeading, {
      props: {
        icon: IconStub,
        title: 'Zone de danger',
        description: 'Actions irreversibles.',
        tone: 'danger',
      },
    })

    expect(wrapper.get('[data-testid="icon-page-heading-icon-wrapper"]').classes()).toContain(
      'bg-destructive-bg-subtle',
    )
  })
})
