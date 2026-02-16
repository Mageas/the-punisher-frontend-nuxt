<script setup lang="ts">
import { parseApiError } from "@/lib/api-error"
import type { Student, Classroom } from "@/types/models"
import { toSingleStudent } from "@/utils/serializers"
import AppPagination from "@/components/AppPagination.vue"

const props = defineProps<{
  open: boolean
  student: Student | null
}>()

const emit = defineEmits<{
  (e: "update:open", value: boolean): void
}>()

const { t } = useI18n()
const apiClient = useApiClient()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
})

const isLoading = ref(false)
const detailError = ref<string | null>(null)
const selectedStudent = ref<Student | null>(null)

// Classrooms pagination logic
const {
  items: classrooms,
  load: loadClassrooms,
  currentPage: classroomPage,
  hasNext: classroomHasNext,
  hasPrevious: classroomHasPrevious,
  isLoading: isClassroomLoading,
  totalCount: classroomTotalCount,
} = usePaginatedList<Classroom>(
  () => selectedStudent.value ? `/students/${selectedStudent.value.id}/classrooms` : "",
  { syncUrl: false, itemsPerPage: 5 }
)

watch(isOpen, async (newValue) => {
  if (newValue && props.student) {
    detailError.value = null
    isLoading.value = true
    selectedStudent.value = null

    try {
      const response = await apiClient.apiFetch<unknown>(`/students/${props.student.id}`)
      selectedStudent.value = toSingleStudent(response) ?? props.student
      
      // Reset to page 1 and load classrooms
      classroomPage.value = 1
      await loadClassrooms()
    } catch (error) {
      detailError.value = parseApiError(error).message
      selectedStudent.value = props.student
    } finally {
      isLoading.value = false
    }
  } else {
    selectedStudent.value = null
  }
})
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ $t('students.detail_title') }}</DialogTitle>
        <DialogDescription>
          {{ $t('students.detail_desc') }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="isLoading" class="space-y-2">
        <div class="h-4 w-full animate-pulse rounded bg-muted" />
        <div class="h-4 w-5/6 animate-pulse rounded bg-muted" />
        <div class="h-4 w-3/5 animate-pulse rounded bg-muted" />
      </div>

      <div v-else class="space-y-4">
        <Alert v-if="detailError" variant="destructive">
          <AlertTitle>{{ $t('students.load_error') }}</AlertTitle>
          <AlertDescription>{{ detailError }}</AlertDescription>
        </Alert>

        <Card v-if="selectedStudent">
          <CardContent class="grid gap-4 pt-6 text-sm">
            <div class="flex items-center justify-between gap-2">
              <span class="text-muted-foreground">{{ $t('students.firstname') }}</span>
              <span class="font-medium">{{ selectedStudent.first_name || "-" }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-muted-foreground">{{ $t('students.lastname') }}</span>
              <span class="font-medium">{{ selectedStudent.last_name || "-" }}</span>
            </div>
            
            <div class="space-y-2 border-t pt-4">
              <h4 class="font-medium">{{ $t('classrooms.title') }}</h4>
              <div v-if="isClassroomLoading" class="space-y-2">
                 <div class="h-8 w-full animate-pulse rounded bg-muted" />
                 <div class="h-8 w-full animate-pulse rounded bg-muted" />
              </div>
              <div v-else-if="classrooms.length > 0" class="space-y-2">
                <div class="flex flex-wrap gap-2">
                  <div v-for="classroom in classrooms" :key="classroom.id" class="rounded-md focus:ring-ring border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    {{ classroom.name }}
                  </div>
                </div>
                <AppPagination
                  v-if="classroomTotalCount > 5"
                  :page="classroomPage"
                  :has-next="Boolean(classroomHasNext)"
                  :has-previous="Boolean(classroomHasPrevious)"
                  :loading="isClassroomLoading"
                  class="justify-center py-2"
                  @update:page="(page) => classroomPage = page"
                />
              </div>
              <div v-else class="text-xs text-muted-foreground">
                {{ $t('students.no_classrooms') }}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DialogFooter>
        <DialogClose as-child>
          <Button variant="outline">{{ $t('general.close') }}</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
