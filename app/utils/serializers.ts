import type { ApiEntity, Student } from "@/types/models"

export function toEntityList(payload: unknown): ApiEntity[] {
  if (Array.isArray(payload)) {
    return payload.filter((entry): entry is ApiEntity => typeof entry === "object" && entry !== null)
  }

  if (!payload || typeof payload !== "object") {
    return []
  }

  const source = payload as ApiEntity
  const collectionKeys = ["data", "items", "results", "students"]
  for (const key of collectionKeys) {
    const candidate = source[key]
    if (Array.isArray(candidate)) {
      return candidate.filter((entry): entry is ApiEntity => typeof entry === "object" && entry !== null)
    }
  }

  return []
}

export function readString(source: ApiEntity, keys: string[]): string {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim()
    }
    if (typeof value === "number") {
      return String(value)
    }
  }
  return ""
}

export function readOptionalString(source: ApiEntity, keys: string[]): string | undefined {
  const value = readString(source, keys)
  return value.length > 0 ? value : undefined
}

export function normalizeStudent(payload: unknown): Student | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null
  }

  const source = payload as ApiEntity
  const id = readString(source, ["id", "student_id", "studentId"])
  if (!id) {
    return null
  }

  return {
    id,
    first_name: readString(source, ["first_name", "firstName"]),
    last_name: readString(source, ["last_name", "lastName"]),
    created_at: readOptionalString(source, ["created_at", "createdAt"]),
    updated_at: readOptionalString(source, ["updated_at", "updatedAt"]),
  }
}

export function toSingleStudent(payload: unknown): Student | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null
  }

  const source = payload as ApiEntity
  const direct = normalizeStudent(source)
  if (direct) {
    return direct
  }

  const nestedKeys = ["data", "item", "result", "student"]
  for (const key of nestedKeys) {
    const nested = source[key]
    const normalized = normalizeStudent(nested)
    if (normalized) {
      return normalized
    }
  }

  return null
}

export function getTimestamp(rawDate: string | undefined): number {
  if (!rawDate) {
    return 0
  }

  const parsed = new Date(rawDate)
  if (Number.isNaN(parsed.getTime())) {
    return 0
  }

  return parsed.getTime()
}

export function formatStudentDate(rawDate: string | undefined): string {
  if (!rawDate) {
    return "-"
  }

  const parsed = new Date(rawDate)
  if (Number.isNaN(parsed.getTime())) {
    return rawDate
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed)
}
