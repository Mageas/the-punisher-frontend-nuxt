import { createStaticPaginatedStore } from './_shared/createStaticPaginatedStore'
import { penaltyService } from '~/services/penalty.service'
import type { Penalty } from '~/types/api'

export const usePenaltiesStore = createStaticPaginatedStore<
  Penalty,
  { search?: string }
>({
  id: 'penalties',
  resource: 'penalties',
  service: {
    list: (params) => penaltyService.getPenalties(params),
    create: (payload) => penaltyService.createPenalty(payload),
    update: (id, payload) => penaltyService.updatePenalty(id, payload),
    delete: (id) => penaltyService.deletePenalty(id),
  },
  allowedStableFilterKeys: [],
  staleTimeMs: 30_000,
  maxCachedPages: 20,
})
