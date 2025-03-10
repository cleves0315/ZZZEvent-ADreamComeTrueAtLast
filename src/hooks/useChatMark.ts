import { ref } from "vue"
import { getStorage, setStorage, StorageKey } from "../utils/storage"

type ChatMark = {
  user: string
  chatEnd: boolean
}

export const useChatMarked = () => {
  const chatsMarked = ref(
    (getStorage(StorageKey.CHATS_MARKED) as ChatMark[]) || [{ user: "zhuyuan", chatEnd: false }],
  )

  const markChatEnd = (user: string) => {
    const chat = chatsMarked.value.find((chat) => chat.user === user)
    if (chat) {
      chat.chatEnd = true
      setStorage(StorageKey.CHATS_MARKED, chatsMarked.value)
    }
  }

  return {
    chatsMarked,
    markChatEnd,
  }
}
