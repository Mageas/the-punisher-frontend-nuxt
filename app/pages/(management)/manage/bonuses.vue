<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between gap-3">
        <div>
          <CardTitle>{{ $t('bonuses.title') }}</CardTitle>
          <CardDescription>
            {{ $t('bonuses.description') }}
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <Alert>
        <AlertTitle>{{ $t('bonuses.ready_title') }}</AlertTitle>
        <AlertDescription>
          {{ $t('bonuses.ready_desc') }}
        </AlertDescription>
      </Alert>
    </CardContent>
  </Card>
</template>

