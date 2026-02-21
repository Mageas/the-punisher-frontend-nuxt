import { createStaticPaginatedStore } from '../_shared/createStaticPaginatedStore'
import { typeService } from '~/services/type.service'
import type { PenaltyType } from '~/types/api'

export const usePenaltyTypesStore = createStaticPaginatedStore<PenaltyType, {}>({
  id: 'penalty-types',
  resource: 'penalty-types',
  service: {
    list: (params) => typeService.getPenaltyTypes(params),
    create: (payload) => typeService.createPenaltyType(payload),
    update: (id, payload) => typeService.updatePenaltyType(id, payload),
    delete: (id) => typeService.deletePenaltyType(id),
  },
  allowedStableFilterKeys: [],
  staleTimeMs: 30_000,
  maxCachedPages: 20,
})
