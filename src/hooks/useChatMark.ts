import { ref } from "vue"
import { getStorage, setStorage, StorageKey } from "../utils/storage"

export type ChatMarkAction = { index: number; opIndex: number }

export interface ChatMark {
  user: string
  chatEnd: boolean
  actions: ChatMarkAction[]
  game: {
    finished: boolean
    bestScore: number
  }
}

const defaultChatMarked: ChatMark[] = [
  { user: "zhuyuan", chatEnd: false, game: { bestScore: 0, finished: false }, actions: [] },
]

export const useChatMarked = () => {
  const chatsMarked = ref((getStorage(StorageKey.DIALOG_STATE) as ChatMark[]) || defaultChatMarked)

  const markChatEnd = (user: string, actions: ChatMarkAction[]) => {
    const chat = chatsMarked.value.find((chat) => chat.user === user)
    if (chat) {
      chat.chatEnd = true
      chat.actions = actions
      setStorage(StorageKey.DIALOG_STATE, chatsMarked.value)
    }
  }

  const markGameEnd = (user: string, score: number) => {
    const chat = chatsMarked.value.find((chat) => chat.user === user)
    if (chat) {
      chat.game = {
        bestScore: Math.max(score, chat.game.bestScore),
        finished: true,
      }
      setStorage(StorageKey.DIALOG_STATE, chatsMarked.value)
    }
  }

  return {
    chatsMarked,
    markChatEnd,
    markGameEnd,
  }
}
