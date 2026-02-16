<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between gap-3">
        <div>
          <CardTitle>{{ $t('types.title') }}</CardTitle>
          <CardDescription>
            {{ $t('types.description') }}
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <Alert>
        <AlertTitle>{{ $t('types.ready_title') }}</AlertTitle>
        <AlertDescription>
          {{ $t('types.ready_desc') }}
        </AlertDescription>
      </Alert>
    </CardContent>
  </Card>
</template>

