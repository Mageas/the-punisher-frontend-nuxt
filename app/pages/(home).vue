<script setup lang="ts">
const isCreatePunishmentDialogOpen = ref(false)

const pendingPunishments = [
  { student: "Alice Martin", type: "Retenue", dueAt: "20 Feb 2026 17:00" },
  { student: "Nolan Petit", type: "Excuses ecrites", dueAt: "21 Feb 2026 08:00" },
  { student: "Lina Robert", type: "Mot aux parents", dueAt: "22 Feb 2026 18:00" },
]

const unusedBonuses = [
  { student: "Alice Martin", bonus: "+2 controle", createdAt: "15 Feb 2026 10:20" },
  { student: "Lina Robert", bonus: "Participation", createdAt: "15 Feb 2026 11:05" },
]

useSeoMeta({
  title: "The Punisher",
  description: "Plateforme de gestion disciplinaire pour enseignants.",
})
</script>

<template>
  <div class="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Fondation UI MVP</CardTitle>
        <CardDescription>
          Base frontend initiale: composants chadcn-vue, tailwindcss, et theme light-only.
        </CardDescription>
      </CardHeader>
      <CardFooter class="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Button>Ajouter une penalite</Button>
        <Button variant="secondary">Ajouter un bonus</Button>
        <Dialog v-model:open="isCreatePunishmentDialogOpen">
          <DialogTrigger as-child>
            <Button variant="outline">Creer une punition</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Creer une punition manuelle</DialogTitle>
              <DialogDescription>
                Exemple de flux UI. L'integration API sera faite dans les prochains items backlog.
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
          <CardTitle class="text-3xl">1</CardTitle>
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
                <TableRow v-for="item in pendingPunishments" :key="`${item.student}-${item.type}`">
                  <TableCell class="font-medium">{{ item.student }}</TableCell>
                  <TableCell>{{ item.type }}</TableCell>
                  <TableCell>{{ item.dueAt }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="bonuses">
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
                <TableRow v-for="item in unusedBonuses" :key="`${item.student}-${item.bonus}`">
                  <TableCell class="font-medium">{{ item.student }}</TableCell>
                  <TableCell>{{ item.bonus }}</TableCell>
                  <TableCell>{{ item.createdAt }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <Alert>
      <AlertTitle>MVP-00 complete</AlertTitle>
      <AlertDescription>
        Les prochaines etapes du backlog brancheront ces ecrans sur l'API backend.
      </AlertDescription>
    </Alert>
  </div>
</template>
