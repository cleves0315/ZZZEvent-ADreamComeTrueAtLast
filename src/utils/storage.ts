export enum StorageKey {
  FIRST_VISIT = "first_visit",
  MUSIC_MUTED = "music_muted",
  DIALOG_STATE = "dialog_state",
}

export const setStorage = (key: StorageKey, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const getStorage = (key: StorageKey): any | null => {
  return JSON.parse(localStorage.getItem(key) || "null")
}
