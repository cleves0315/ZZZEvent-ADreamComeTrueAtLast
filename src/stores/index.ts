import { defineStore } from "pinia"
import { getStorage, setStorage, StorageKey } from "../utils/storage"

export const useStore = defineStore("mian", {
  state: () => ({
    showModal: false,
    isMute: (getStorage(StorageKey.MUSIC_MUTED) ?? false) as boolean,
  }),
  actions: {
    toggleModal() {
      this.showModal = !this.showModal
    },
    toggleMute() {
      this.isMute = !this.isMute
      setStorage(StorageKey.MUSIC_MUTED, this.isMute)
    },
  },
})
