<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between gap-3">
        <div>
          <CardTitle>{{ $t('classrooms.title') }}</CardTitle>
          <CardDescription>
            {{ $t('classrooms.description') }}
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <Alert>
        <AlertTitle>{{ $t('classrooms.ready_title') }}</AlertTitle>
        <AlertDescription>
          {{ $t('classrooms.ready_desc') }}
        </AlertDescription>
      </Alert>
    </CardContent>
  </Card>
</template>

