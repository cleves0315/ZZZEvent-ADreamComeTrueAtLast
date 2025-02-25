export enum StorageKey {
  MUSIC_MUTED = "MUSIC_MUTED",
}

export const setStorage = (key: StorageKey, value: any) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const getStorage = (key: StorageKey) => {
  return JSON.parse(localStorage.getItem(key) || "")
}
