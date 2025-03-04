export enum StorageKey {
  MUSIC_MUTED = "MUSIC_MUTED",
}

export const setStorage = (key: StorageKey, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const getStorage = (key: StorageKey): string | null => {
  return JSON.parse(localStorage.getItem(key) || "null")
}
