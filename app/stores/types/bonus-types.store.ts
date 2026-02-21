import { createStaticPaginatedStore } from '../_shared/createStaticPaginatedStore'
import { typeService } from '~/services/type.service'
import type { BonusType } from '~/types/api'

export const useBonusTypesStore = createStaticPaginatedStore<BonusType, {}>({
  id: 'bonus-types',
  resource: 'bonus-types',
  service: {
    list: (params) => typeService.getBonusTypes(params),
    create: (payload) => typeService.createBonusType(payload),
    update: (id, payload) => typeService.updateBonusType(id, payload),
    delete: (id) => typeService.deleteBonusType(id),
  },
  allowedStableFilterKeys: [],
  staleTimeMs: 30_000,
  maxCachedPages: 20,
})
