import { ref } from "vue"
import { getStorage, setStorage, StorageKey } from "../utils/storage"

export const useFirstVisit = () => {
  const isFirstVisit = ref((getStorage(StorageKey.FIRST_VISIT) as boolean) || false)

  const markVisit = () => {
    setStorage(StorageKey.FIRST_VISIT, true)
    isFirstVisit.value = true
  }

  return {
    isFirstVisit,
    markVisit,
  }
}
