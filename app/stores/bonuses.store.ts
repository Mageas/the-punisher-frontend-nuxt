import { createStaticPaginatedStore } from './_shared/createStaticPaginatedStore'
import { bonusService } from '~/services/bonus.service'
import type { Bonus } from '~/types/api'

export const useBonusesStore = createStaticPaginatedStore<
  Bonus,
  { search?: string; state?: string }
>({
  id: 'bonuses',
  resource: 'bonuses',
  service: {
    list: (params) => bonusService.getBonuses(params),
    // bonuses usually are created via specific flows, but standard create is here
    create: (payload) => bonusService.createBonus(payload),
    update: (id, payload) => bonusService.updateBonus(id, payload),
    delete: (id) => bonusService.deleteBonus(id),
  },
  allowedStableFilterKeys: ['state'], // 'state' is stable enough to cache
  staleTimeMs: 30_000,
  maxCachedPages: 20,
})
