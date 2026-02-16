export type Student = {
  id: string
  first_name: string
  last_name: string
  created_at?: string
  updated_at?: string
}

export type Classroom = {
  id: string
  name: string
}

export type ApiEntity = Record<string, unknown>
