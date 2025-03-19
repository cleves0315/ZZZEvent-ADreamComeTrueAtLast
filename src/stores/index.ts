import { defineStore } from "pinia"
import { getStorage, setStorage, StorageKey } from "../utils/storage"
import { Assets } from "../assets-list"

export const useStore = defineStore("mian", {
  state: () => ({
    assetList: {} as Record<Assets, string>,
    showModal: false,
    isMute: (getStorage(StorageKey.MUSIC_MUTED) ?? false) as boolean,
  }),
  actions: {
    setAssetList(data: Record<Assets, string>) {
      this.assetList = data
    },
    toggleModal() {
      this.showModal = !this.showModal
    },
    toggleMute() {
      this.isMute = !this.isMute
      setStorage(StorageKey.MUSIC_MUTED, this.isMute)
    },
  },
})
