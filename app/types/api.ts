export interface PaginatedResponse<T> {
  page: number
  item_per_page: number
  total_count: number
  previous_page: number | null
  next_page: number | null
  data: T[]
}
