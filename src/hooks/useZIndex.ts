import { ref } from "vue"
import { useStore } from "../stores"

export const useZIndex = () => {
  const store = useStore()

  const idx = store.index++
  store.setIndex(store.index)

  const index = ref(idx)

  return index
}
