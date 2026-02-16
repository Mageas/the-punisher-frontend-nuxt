<script setup lang="ts">
import AppPagination from "@/components/AppPagination.vue"
import { Eye, Pencil, Trash2 } from "lucide-vue-next"

import { getTimestamp } from "@/utils/serializers"
import type { Student } from "@/types/models"

import StudentCreateDialog from "@/components/students/StudentCreateDialog.vue"
import StudentEditDialog from "@/components/students/StudentEditDialog.vue"
import StudentDetailsDialog from "@/components/students/StudentDetailsDialog.vue"
import StudentDeleteDialog from "@/components/students/StudentDeleteDialog.vue"

// Use the new pagination composable
const {
  items: students,
  load: loadStudents,
  isLoading: isListLoading,
  error: listError,
  currentPage,
  hasNext,
  hasPrevious,
  totalCount,
} = usePaginatedList<Student>("/students")

const sortedStudents = computed(() => {
  return [...students.value].sort((a, b) => {
    // Keep existing sorting logic
    const dateDelta = getTimestamp(b.created_at) - getTimestamp(a.created_at)
    if (dateDelta !== 0) {
      return dateDelta
    }

    return `${a.last_name} ${a.first_name}`.localeCompare(
      `${b.last_name} ${b.first_name}`,
      "fr",
      { sensitivity: "base" },
    )
  })
})

const createDialogOpen = ref(false)
const detailsDialogOpen = ref(false)
const editDialogOpen = ref(false)
const deleteDialogOpen = ref(false)

const selectedStudent = ref<Student | null>(null)
const studentPendingDelete = ref<Student | null>(null)

const { t } = useI18n()

function openStudentDetails(student: Student) {
  selectedStudent.value = student
  detailsDialogOpen.value = true
}

function openEditDialog(student: Student) {
  selectedStudent.value = student
  editDialogOpen.value = true
}

function openDeleteDialog(student: Student) {
  studentPendingDelete.value = student
  deleteDialogOpen.value = true
}

useSeoMeta({
  title: t('students.meta_title'),
  description: t('students.meta_description'),
})
</script>

<template>
  <div class="space-y-4">
    <Card>
      <CardHeader class="gap-3 md:flex md:flex-row md:items-start md:justify-between">
        <div class="space-y-1">
          <CardTitle>{{ $t('students.title') }}</CardTitle>
          <CardDescription>
            {{ $t('students.description') }}
          </CardDescription>
        </div>
        <Button class="w-full md:w-auto" @click="createDialogOpen = true">
          {{ $t('students.add_title') }}
        </Button>
      </CardHeader>

      <CardContent>
        <AppRequestState
          :is-loading="isListLoading"
          :error-message="listError?.message"
          :is-empty="!isLoading && students.length === 0"
          :loading-title="$t('students.loading_title')"
          :loading-description="$t('students.loading_desc')"
          :empty-title="$t('students.empty_title')"
          :empty-description="$t('students.empty_desc')"
          @retry="loadStudents"
        >
          <div class="space-y-6">
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div
                v-for="student in sortedStudents"
                :key="student.id"
                class="group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/50"
              >
                <div class="flex flex-1 flex-col items-center justify-center p-6 text-center">
                  <div class="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {{ student.first_name.charAt(0).toUpperCase() }}{{ student.last_name.charAt(0).toUpperCase() }}
                  </div>
                  <h3 class="line-clamp-1 text-lg font-semibold tracking-tight">
                    {{ student.first_name }} {{ student.last_name }}
                  </h3>
                </div>

                <div class="flex items-center justify-center border-t bg-muted/30 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="icon" class="h-8 w-8 hover:text-primary" :title="$t('general.open')" @click="openStudentDetails(student)">
                    <Eye class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" class="h-8 w-8 hover:text-orange-500" :title="$t('general.modify')" @click="openEditDialog(student)">
                    <Pencil class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" class="h-8 w-8 hover:text-destructive" :title="$t('general.delete')" @click="openDeleteDialog(student)">
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <AppPagination
              v-if="totalCount > 0"
              :page="currentPage"
              :has-next="Boolean(hasNext)"
              :has-previous="Boolean(hasPrevious)"
              :loading="isListLoading"
              @update:page="(page) => currentPage = page"
            />
          </div>
        </AppRequestState>
      </CardContent>
    </Card>

    <StudentCreateDialog
      v-model:open="createDialogOpen"
      @created="loadStudents"
    />

    <StudentEditDialog
      v-model:open="editDialogOpen"
      :student="selectedStudent"
      @updated="loadStudents"
    />

    <StudentDetailsDialog
      v-model:open="detailsDialogOpen"
      :student="selectedStudent"
    />

    <StudentDeleteDialog
      v-model:open="deleteDialogOpen"
      :student="studentPendingDelete"
      @deleted="loadStudents"
    />
  </div>
</template>
