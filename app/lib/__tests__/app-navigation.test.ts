import { describe, expect, it } from 'vitest'
import { getAppNavigation } from '../app-navigation'

describe('getAppNavigation', () => {
  it('returns all sidebar groups with translated labels and expected routes', () => {
    const navigation = getAppNavigation((key) => key)

    expect(navigation).toHaveLength(5)
    expect(navigation[0]).toEqual({
      label: 'sidebar.general',
      links: [{ to: '/', icon: navigation[0]!.links[0]!.icon, label: 'common.titles.dashboard' }],
    })
    expect(navigation[1]?.links.map((link) => link.to)).toEqual([
      '/penalties',
      '/punishments',
      '/bonuses',
    ])
    expect(navigation[2]?.links.map((link) => link.to)).toEqual(['/students', '/classes'])
    expect(navigation[3]?.links.map((link) => link.to)).toEqual([
      '/rules',
      '/penalty-types',
      '/punishment-types',
      '/bonus-types',
    ])
    expect(navigation[4]?.links.map((link) => link.to)).toEqual([
      '/schedule/slots',
      '/schedule/exceptions',
    ])
  })
})
