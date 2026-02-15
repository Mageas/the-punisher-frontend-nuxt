<script setup lang="ts">
type ApiEntity = Record<string, unknown>

const isCreatePunishmentDialogOpen = ref(false)
const apiClient = useApiClient()

const pendingPunishmentsState = useRequestState<ApiEntity[]>({
  isEmpty: (items) => !items || items.length === 0,
})
const unusedBonusesState = useRequestState<ApiEntity[]>({
  isEmpty: (items) => !items || items.length === 0,
})

function toEntities(payload: unknown): ApiEntity[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is ApiEntity => typeof item === "object" && item !== null)
  }

  if (!payload || typeof payload !== "object") {
    return []
  }

  const source = payload as Record<string, unknown>
  const knownCollectionKeys = [
    "data",
    "items",
    "results",
    "punishments",
    "bonuses",
  ]

  for (const key of knownCollectionKeys) {
    const candidate = source[key]
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is ApiEntity => typeof item === "object" && item !== null)
    }
  }

  return []
}

function getByPath(entity: ApiEntity, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, segment) => {
    if (!acc || typeof acc !== "object") {
      return undefined
    }
    return (acc as Record<string, unknown>)[segment]
  }, entity)
}

function readText(entity: ApiEntity, paths: string[]): string {
  for (const path of paths) {
    const value = getByPath(entity, path)
    if (typeof value === "string" && value.trim().length > 0) {
      return value
    }
    if (typeof value === "number") {
      return String(value)
    }
  }
  return "-"
}

function formatLocalDate(raw: unknown): string {
  if (typeof raw !== "string" || raw.length === 0) {
    return "-"
  }

  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) {
    return raw
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

function getStudentName(item: ApiEntity): string {
  const firstName = readText(item, ["student.first_name", "student_first_name", "studentFirstName"]).replace("-", "").trim()
  const lastName = readText(item, ["student.last_name", "student_last_name", "studentLastName"]).replace("-", "").trim()
  const fullName = `${firstName} ${lastName}`.trim()
  if (fullName.length > 0) {
    return fullName
  }
  return readText(item, ["student_id", "studentId"])
}

function getPunishmentLabel(item: ApiEntity): string {
  return readText(item, [
    "punishment_type.name",
    "punishment_type_name",
    "punishmentTypeName",
    "punishment_type_id",
    "punishmentTypeId",
  ])
}

function getBonusLabel(item: ApiEntity): string {
  return readText(item, [
    "bonus_type.name",
    "bonus_type_name",
    "bonusTypeName",
    "bonus_type_id",
    "bonusTypeId",
  ])
}

function isLatePunishment(item: ApiEntity): boolean {
  const resolvedAt = getByPath(item, "resolved_at")
  if (typeof resolvedAt === "string" && resolvedAt.length > 0) {
    return false
  }

  const dueAtRaw = getByPath(item, "due_at")
  if (typeof dueAtRaw !== "string" || dueAtRaw.length === 0) {
    return false
  }

  const dueAt = new Date(dueAtRaw)
  return !Number.isNaN(dueAt.getTime()) && dueAt.getTime() < Date.now()
}

const pendingPunishments = computed(() => pendingPunishmentsState.data.value ?? [])
const unusedBonuses = computed(() => unusedBonusesState.data.value ?? [])

const latePunishmentsCount = computed(() => pendingPunishments.value.filter(isLatePunishment).length)

async function loadPendingPunishments() {
  await pendingPunishmentsState.execute(async () => {
    const response = await apiClient.apiFetch<unknown>("/punishments", {
      query: { page: 1, state: "pending" },
    })
    return toEntities(response)
  })
}

async function loadUnusedBonuses() {
  await unusedBonusesState.execute(async () => {
    const response = await apiClient.apiFetch<unknown>("/bonuses", {
      query: { page: 1, state: "unused" },
    })
    return toEntities(response)
  })
}

async function refreshDashboard() {
  await Promise.all([loadPendingPunishments(), loadUnusedBonuses()])
}

onMounted(async () => {
  await refreshDashboard()
})

useSeoMeta({
  title: "The Punisher",
  description: "Plateforme de gestion disciplinaire pour enseignants.",
})
</script>

<template>
  <div class="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Dashboard discipline</CardTitle>
        <CardDescription>
          Etats reseau centralises: loading, empty, error avec mapping des erreurs API.
        </CardDescription>
      </CardHeader>
      <CardFooter class="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Button>Ajouter une penalite</Button>
        <Button variant="secondary">Ajouter un bonus</Button>
        <Button variant="outline" @click="refreshDashboard">
          Rafraichir
        </Button>
        <Dialog v-model:open="isCreatePunishmentDialogOpen">
          <DialogTrigger as-child>
            <Button variant="outline">Creer une punition</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Creer une punition manuelle</DialogTitle>
              <DialogDescription>
                Exemple de flux UI. L'integration API complete sera faite dans les prochains items backlog.
              </DialogDescription>
            </DialogHeader>

            <div class="grid gap-4 py-2">
              <div class="grid gap-2">
                <Label for="student">Eleve</Label>
                <Input id="student" placeholder="Rechercher un eleve" />
              </div>
              <div class="grid gap-2">
                <Label for="punishment-type">Type de punition</Label>
                <Input id="punishment-type" placeholder="Ex: Retenue" />
              </div>
              <div class="grid gap-2">
                <Label for="due-at">Date d'echeance</Label>
                <Input id="due-at" type="datetime-local" />
              </div>
            </div>

            <DialogFooter>
              <DialogClose as-child>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button @click="isCreatePunishmentDialogOpen = false">
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>

    <div class="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Punitions a faire</CardDescription>
          <CardTitle class="text-3xl">{{ pendingPunishments.length }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Bonus non donnes</CardDescription>
          <CardTitle class="text-3xl">{{ unusedBonuses.length }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardDescription>Punitions en retard</CardDescription>
          <CardTitle class="text-3xl">{{ latePunishmentsCount }}</CardTitle>
        </CardHeader>
      </Card>
    </div>

    <Tabs default-value="pending">
      <TabsList class="grid w-full grid-cols-2 md:w-[380px]">
        <TabsTrigger value="pending">
          Punitions pending
        </TabsTrigger>
        <TabsTrigger value="bonuses">
          Bonus unused
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending">
        <AppRequestState
          :is-loading="pendingPunishmentsState.isLoading.value"
          :error-message="pendingPunishmentsState.error.value?.message"
          :is-empty="pendingPunishmentsState.isEmpty.value"
          loading-title="Chargement des punitions..."
          empty-title="Aucune punition pending"
          empty-description="Toutes les punitions sont traitees."
          @retry="loadPendingPunishments"
        >
          <Card>
            <CardHeader>
              <CardTitle>Liste prioritaire</CardTitle>
              <CardDescription>Tri de demonstration par creation recente.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Eleve</TableHead>
                    <TableHead>Punition</TableHead>
                    <TableHead>Echeance locale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="(item, index) in pendingPunishments" :key="readText(item, ['id']) + index">
                    <TableCell class="font-medium">{{ getStudentName(item) }}</TableCell>
                    <TableCell>{{ getPunishmentLabel(item) }}</TableCell>
                    <TableCell>{{ formatLocalDate(getByPath(item, 'due_at')) }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </AppRequestState>
      </TabsContent>

      <TabsContent value="bonuses">
        <AppRequestState
          :is-loading="unusedBonusesState.isLoading.value"
          :error-message="unusedBonusesState.error.value?.message"
          :is-empty="unusedBonusesState.isEmpty.value"
          loading-title="Chargement des bonus..."
          empty-title="Aucun bonus unused"
          empty-description="Aucun bonus en attente d'application."
          @retry="loadUnusedBonuses"
        >
          <Card>
            <CardHeader>
              <CardTitle>Bonus a appliquer</CardTitle>
              <CardDescription>Les bonus passent en "used" uniquement a l'application.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Eleve</TableHead>
                    <TableHead>Bonus</TableHead>
                    <TableHead>Cree le</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="(item, index) in unusedBonuses" :key="readText(item, ['id']) + index">
                    <TableCell class="font-medium">{{ getStudentName(item) }}</TableCell>
                    <TableCell>{{ getBonusLabel(item) }}</TableCell>
                    <TableCell>{{ formatLocalDate(getByPath(item, 'created_at')) }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </AppRequestState>
      </TabsContent>
    </Tabs>
  </div>
</template>
