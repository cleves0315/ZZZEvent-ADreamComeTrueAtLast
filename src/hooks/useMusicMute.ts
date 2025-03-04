import { computed } from "vue"
import { useStore } from "../stores"

export const useMusicMute = () => {
  const store = useStore()
  const isMute = computed(() => store.isMute)

  const toggleMute = () => {
    store.toggleMute()
  }

  return {
    isMute,
    toggleMute,
  }
}
