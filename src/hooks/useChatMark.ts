import { ref } from "vue"
import { getStorage, setStorage, StorageKey } from "../utils/storage"

export type ChatMarkAction = { index: number; opIndex: number }

export type ChatMark = {
  user: string
  chatEnd: boolean
  actions: ChatMarkAction[]
}

const defaultChatMarked: ChatMark[] = [{ user: "zhuyuan", chatEnd: false, actions: [] }]

export const useChatMarked = () => {
  const chatsMarked = ref((getStorage(StorageKey.CHATS_MARKED) as ChatMark[]) || defaultChatMarked)

  const markChatEnd = (user: string, actions: ChatMarkAction[]) => {
    const chat = chatsMarked.value.find((chat) => chat.user === user)
    if (chat) {
      chat.chatEnd = true
      chat.actions = actions
      setStorage(StorageKey.CHATS_MARKED, chatsMarked.value)
    }
  }

  return {
    chatsMarked,
    markChatEnd,
  }
}
