<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between gap-3">
        <div>
          <CardTitle>{{ $t('punishments.title') }}</CardTitle>
          <CardDescription>
            {{ $t('punishments.description') }}
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <Alert>
        <AlertTitle>{{ $t('punishments.ready_title') }}</AlertTitle>
        <AlertDescription>
          {{ $t('punishments.ready_desc') }}
        </AlertDescription>
      </Alert>
    </CardContent>
  </Card>
</template>

