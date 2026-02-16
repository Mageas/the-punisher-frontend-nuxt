<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between gap-3">
        <div>
          <CardTitle>{{ $t('rules.title') }}</CardTitle>
          <CardDescription>
            {{ $t('rules.description') }}
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <Alert>
        <AlertTitle>{{ $t('rules.ready_title') }}</AlertTitle>
        <AlertDescription>
          {{ $t('rules.ready_desc') }}
        </AlertDescription>
      </Alert>
    </CardContent>
  </Card>
</template>

