import { computed } from "vue"
import { useStore } from "../stores"
import throttle from "lodash/throttle"

export const useMusicMute = () => {
  const store = useStore()
  const isMute = computed(() => store.isMute)

  const toggleMute = throttle(
    () => {
      store.toggleMute()
    },
    500,
    { trailing: false },
  )

  return {
    isMute,
    toggleMute,
  }
}
