import { ref } from "vue"

export const useBoolean = (initialValue = false) => {
  const visible = ref(initialValue)

  const toggle = () => {
    visible.value = !visible.value
  }

  return [visible, { toggle }] as unknown as [boolean, { toggle: () => void }]
}
