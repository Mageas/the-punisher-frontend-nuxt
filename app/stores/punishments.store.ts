import { createStaticPaginatedStore } from './_shared/createStaticPaginatedStore'
import { punishmentService } from '~/services/punishment.service'
import type { Punishment } from '~/types/api'

export const usePunishmentsStore = createStaticPaginatedStore<
  Punishment,
  { search?: string; state?: string }
>({
  id: 'punishments',
  resource: 'punishments',
  service: {
    list: (params) => punishmentService.getPunishments(params),
    create: (payload) => punishmentService.createPunishment(payload),
    update: (id, payload) => punishmentService.updatePunishment(id, payload),
    delete: (id) => punishmentService.deletePunishment(id),
  },
  allowedStableFilterKeys: ['state'],
  staleTimeMs: 30_000,
  maxCachedPages: 20,
})
