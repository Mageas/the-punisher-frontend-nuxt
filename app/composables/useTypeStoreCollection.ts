import { storeToRefs } from 'pinia'
import { watch, type Ref } from 'vue'

interface TypeStore<T> {
  fetchPage(params: { page?: number; force?: boolean }): Promise<void>
  createOne(payload: { name: string }): Promise<any>
  updateOne(id: string, payload: { name: string }): Promise<any>
  deleteOne(id: string): Promise<any>
  
  // State from storeToRefs usually
  currentPage: Ref<number>
  items: Readonly<Ref<T[]>>
  loading: Readonly<Ref<boolean>>
  totalCount: Readonly<Ref<number>>
  itemPerPage: Readonly<Ref<number>>
}

export function useTypeStoreCollection<T>(store: any) {
  const route = useRoute()
  const router = useRouter()

  const { 
    items, 
    loading, 
    currentPage: page, 
    totalCount, 
    itemPerPage 
  } = storeToRefs(store)

  async function fetchTypes(options?: { page?: number; force?: boolean }) {
    await store.fetchPage(options || {})
  }

  async function gotoPage(newPage: number) {
    const query = { ...route.query, page: String(newPage) }
    await router.push({ query })
  }

  async function createType(name: string) {
    await store.createOne({ name })
  }

  async function updateType(id: string, name: string) {
    await store.updateOne(id, { name })
  }

  async function deleteType(id: string) {
    await store.deleteOne(id)
  }

  // URL Sync
  watch(
    () => route.query.page,
    async (newPage) => {
      const p = Number(newPage) || 1
      await fetchTypes({ page: p })
    },
    { immediate: true }
  )

  return {
    types: items as Readonly<Ref<T[]>>,
    loading: loading as Readonly<Ref<boolean>>,
    page: page as Ref<number>,
    totalCount: totalCount as Readonly<Ref<number>>,
    itemPerPage: itemPerPage as Readonly<Ref<number>>,
    fetchTypes,
    gotoPage,
    createType,
    updateType,
    deleteType,
  }
}
