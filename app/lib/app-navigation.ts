import type { Component } from 'vue'
import {
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  FileWarning,
  Gavel,
  LayoutDashboard,
  Scale,
  School,
  Star,
  Trophy,
  Users,
} from 'lucide-vue-next'

interface AppNavigationLinkDefinition {
  to: string
  icon: Component
  labelKey: string
}

interface AppNavigationGroupDefinition {
  labelKey: string
  links: AppNavigationLinkDefinition[]
}

export interface AppNavigationLink {
  to: string
  icon: Component
  label: string
}

export interface AppNavigationGroup {
  label: string
  links: AppNavigationLink[]
}

const appNavigationDefinitions: AppNavigationGroupDefinition[] = [
  {
    labelKey: 'sidebar.general',
    links: [{ to: '/', icon: LayoutDashboard, labelKey: 'common.titles.dashboard' }],
  },
  {
    labelKey: 'sidebar.tracking',
    links: [
      { to: '/penalties', icon: AlertTriangle, labelKey: 'common.titles.penalties' },
      { to: '/punishments', icon: Gavel, labelKey: 'common.titles.punishments' },
      { to: '/bonuses', icon: Star, labelKey: 'common.titles.bonuses' },
    ],
  },
  {
    labelKey: 'sidebar.management',
    links: [
      { to: '/students', icon: Users, labelKey: 'common.titles.students' },
      { to: '/classes', icon: School, labelKey: 'common.titles.classes' },
    ],
  },
  {
    labelKey: 'sidebar.configuration',
    links: [
      { to: '/rules', icon: Scale, labelKey: 'common.titles.rules' },
      {
        to: '/penalty-types',
        icon: AlertCircle,
        labelKey: 'common.titles.penaltyTypes',
      },
      {
        to: '/punishment-types',
        icon: FileWarning,
        labelKey: 'common.titles.punishmentTypes',
      },
      { to: '/bonus-types', icon: Trophy, labelKey: 'common.titles.bonusTypes' },
    ],
  },
  {
    labelKey: 'sidebar.schedule',
    links: [
      {
        to: '/schedule/slots',
        icon: CalendarDays,
        labelKey: 'common.titles.schedule.slot',
      },
      {
        to: '/schedule/exceptions',
        icon: CalendarDays,
        labelKey: 'common.titles.schedule.exception',
      },
    ],
  },
]

export function getAppNavigation(resolveLabel: (key: string) => string): AppNavigationGroup[] {
  return appNavigationDefinitions.map((group) => ({
    label: resolveLabel(group.labelKey),
    links: group.links.map((link) => ({
      to: link.to,
      icon: link.icon,
      label: resolveLabel(link.labelKey),
    })),
  }))
}
