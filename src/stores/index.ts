import { defineStore } from "pinia"

export const useStore = defineStore("mian", {
  state: () => ({
    showModal: false,
  }),
  actions: {
    toggleModal() {
      this.showModal = !this.showModal
    },
  },
})
