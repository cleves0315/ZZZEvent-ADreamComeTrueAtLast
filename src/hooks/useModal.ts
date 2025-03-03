import { gsap } from "gsap"
import { useStore } from "../stores"

export const useModal = () => {
  const store = useStore()

  const toggleModal = async () => {
    store.toggleModal()

    if (store.showModal) {
      gsap.set(".play-view-modal", { display: "block" })
    }

    gsap.to(".play-view-modal-mask", { opacity: store.showModal ? 1 : 0, duration: 0.2 })
    await gsap.to(".play-view-modal-body", { opacity: store.showModal ? 1 : 0, duration: 0.2 })

    if (!store.showModal) {
      gsap.set(".play-view-modal", { display: "none" })
    }
  }

  return {
    showModal: store.showModal,
    toggleModal,
  }
}
