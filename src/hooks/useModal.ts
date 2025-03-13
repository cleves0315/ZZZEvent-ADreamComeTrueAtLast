import { gsap } from "gsap"
import { useStore } from "../stores"
import throttle from "lodash/throttle"

export const useModal = () => {
  const store = useStore()

  const toggleModal = throttle(
    async () => {
      store.toggleModal()

      if (store.showModal) {
        gsap.set(".view-modal", { display: "block" })
      }

      gsap.to(".view-modal-mask", { opacity: store.showModal ? 1 : 0, duration: 0.2 })
      await gsap.to(".view-modal-body", { opacity: store.showModal ? 1 : 0, duration: 0.2 })

      if (!store.showModal) {
        gsap.set(".view-modal", { display: "none" })
      }
    },
    500,
    { trailing: false },
  )

  return {
    showModal: store.showModal,
    toggleModal,
  }
}
