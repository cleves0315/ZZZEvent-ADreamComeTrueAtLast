import { Ref, ref } from "vue"

export const useBoolean = (initialValue = false) => {
  const visible = ref(initialValue)

  const setValue = (value: boolean) => {
    visible.value = value
  }

  const toggle = () => {
    visible.value = !visible.value
  }

  return [visible, { toggle, setValue }] as unknown as [
    Ref<boolean, boolean>,
    { toggle: () => void; setValue: (value: boolean) => void },
  ]
}
