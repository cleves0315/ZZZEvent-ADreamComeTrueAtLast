import { defineStore } from "pinia"
import { getStorage, setStorage, StorageKey } from "../utils/storage"
import { Assets } from "../assets-list"

export const useStore = defineStore("mian", {
  state: () => ({
    assetList: {} as Record<Assets, string>,
    isMute: (getStorage(StorageKey.MUSIC_MUTED) ?? false) as boolean,
    index: 100,
  }),
  actions: {
    setAssetList(data: Record<Assets, string>) {
      this.assetList = data
    },
    toggleMute() {
      this.isMute = !this.isMute
      setStorage(StorageKey.MUSIC_MUTED, this.isMute)
    },
    setIndex(index: number) {
      this.index = index
    },
  },
})
