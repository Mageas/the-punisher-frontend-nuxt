import { createStaticPaginatedStore } from '../_shared/createStaticPaginatedStore'
import { typeService } from '~/services/type.service'
import type { PunishmentType } from '~/types/api'

export const usePunishmentTypesStore = createStaticPaginatedStore<PunishmentType, {}>({
  id: 'punishment-types',
  resource: 'punishment-types',
  service: {
    list: (params) => typeService.getPunishmentTypes(params),
    create: (payload) => typeService.createPunishmentType(payload),
    update: (id, payload) => typeService.updatePunishmentType(id, payload),
    delete: (id) => typeService.deletePunishmentType(id),
  },
  allowedStableFilterKeys: [],
  staleTimeMs: 30_000,
  maxCachedPages: 20,
})
