<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between gap-3">
        <div>
          <CardTitle>{{ $t('penalties.title') }}</CardTitle>
          <CardDescription>
            {{ $t('penalties.description') }}
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <Alert>
        <AlertTitle>{{ $t('penalties.ready_title') }}</AlertTitle>
        <AlertDescription>
          {{ $t('penalties.ready_desc') }}
        </AlertDescription>
      </Alert>
    </CardContent>
  </Card>
</template>

