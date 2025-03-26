<script setup lang="ts">
import { useRouter } from "vue-router"
import { formatNumber, slideEnter } from "../utils"
import throttle from "lodash/throttle"
import { computed, onMounted, ref } from "vue"
import { Howl } from "howler"
import gsap from "gsap"
import {
  chatList as chats,
  roomName,
  toptips,
  firstIndex as chatFirstIndex,
} from "../assets/data/zhuyuan_chat.json"
import { useBgm } from "../hooks/useBgm"
import { useMusicMute } from "../hooks/useMusicMute"
import ViewModal from "./ViewModal.vue"
import { ChatMarkAction, useChatMarked } from "../hooks/useChatMark"
import { CinemaUserEnum } from "../router"

import zhuyuanAvatar from "../assets/zhuyuan_task.png"
import DynamicBg from "./DynamicBg.vue"
import { useStore } from "../stores"
import { useBoolean } from "../hooks/useBoolean"

const dialogList = ref([
  { isLock: false, user: "zhuyuan", name: "朱鸢", avatar: zhuyuanAvatar },
  { isLock: true, user: "bot", name: "朱鸢", avatar: zhuyuanAvatar },
  { isLock: true, user: "bot", name: "朱鸢", avatar: zhuyuanAvatar },
  { isLock: true, user: "bot", name: "朱鸢", avatar: zhuyuanAvatar },
  { isLock: true, user: "bot", name: "朱鸢", avatar: zhuyuanAvatar },
])

const bookContents = [
  {
    title: "活动时间",
    content: ["2025/1/24 10:00:00 ~ 2025/2/5 03:59:59"],
  },
  {
    title: "参与条件",
    content: ["纯网管级≥8级，在主线序章：嘉间中解锁「活动」功能后即可参与。"],
  },
  {
    title: "活动简介",
    content: [
      "约定的聚餐近在眼前，突发全员爽约危机！",
      "好消息，您只需付出一点点额外电费，即可消除烦恼。",
    ],
  },
  {
    title: "活动玩法说明",
    content: ["帮助 Fairy 赚取电费，解决朋友们的烦恼，守护期盼已久的聚餐。"],
  },
  {
    title: "赚取电费",
    content: ["通过划动合并相同的电费单元来获得电费，满足关卡目标即可结束关卡。"],
  },
  {
    title: "友情支援",
    content: ["达成友情支援的条件，可以获得「电费加倍」数字，组成「电费加倍」倍率。"],
  },
  {
    title: "电费加倍",
    content: [
      "电费加倍」倍率 ≥3 位数的可以点击按钮使用「电费加倍」，下一次合成获得的电费将乘以「电费加倍」倍率！积极利用「电费加倍」，赚取更多电费吧！",
    ],
  },
]

const store = useStore()

const { isMute, toggleMute } = useMusicMute()

const { chatsMarked, markChatEnd, markAchv } = useChatMarked()

const { bgmSound } = useBgm(store.assetList["bgm_home"])

const [visAlert, { toggle: toggleAlert }] = useBoolean(false)

const [visBook, { toggle: toggleBook }] = useBoolean(false)

const [visAchv, { toggle: toggleAchv }] = useBoolean(false)

const [visGiftAlert, { toggle: toggleGiftAlert }] = useBoolean(false)

const curDialogIndex = ref(0)

const showScreenMask = ref(false)

const showReply = ref(false)

const router = useRouter()

const curReplys = ref<string[]>([])

const curChatList = ref(chats.slice(0, 0))

const chatListRef = ref<HTMLDivElement>()

const msgSound = ref()

const initing = ref(true)

const opRecords = ref<ChatMarkAction[]>([])

const curChatMarked = computed(() => chatsMarked.value[curDialogIndex.value])

const fisdGameCount = computed(() => {
  let count = 0
  chatsMarked.value.forEach((item) => {
    if (item.game.finished) {
      count++
    }
  })
  return count
})

const achvCount = computed(() => {
  let count = 0
  chatsMarked.value.forEach((item) => {
    if (item.achv) {
      count++
    }
  })
  return count
})

const curDialogOpRecords = computed(() => {
  const acc: Record<string, number> = {}
  curChatMarked.value.actions.forEach(({ index, opIndex }) => {
    acc[index] = opIndex
  })
  return acc
})

const markOpRecords = (action: ChatMarkAction) => {
  opRecords.value.push(action)
}

const markCurChat = () => {
  markChatEnd(curChatMarked.value.user, opRecords.value)
}

const initChatList = () => {
  if (curChatMarked.value.chatEnd) {
    curChatList.value = chats
    initing.value = false
    chatListScrollToBottom()
    toggleMask(true)
  } else {
    setTimeout(() => {
      const interval = 400
      for (let i = 0; i < chatFirstIndex; i++) {
        setTimeout(
          () => {
            const newChat = chats[i]
            if (newChat.reply?.length) {
              handleReplyChat()
            } else {
              curChatList.value.push(newChat)
            }

            if (i === chatFirstIndex - 1) {
              requestAnimationFrame(() => {
                initing.value = false
              })
            }
          },
          interval * i + 1,
        )
      }
    }, 2000)
  }
}

onMounted(() => {
  msgSound.value = new Howl({
    src: [store.assetList["message_answer"]],
    format: ["mp3"],
    volume: 1.0,
  })
  initChatList()
})

const handleChangeMuteState = () => {
  toggleMute()

  if (isMute.value) {
    bgmSound.value?.pause()
  } else {
    bgmSound.value?.play()
  }
}

const playMsgSound = () => {
  if (isMute.value) return
  msgSound.value.play()
}

const handleBack = async () => {
  await slideEnter()
  router.back()
}

const chatListScrollToBottom = () => {
  setTimeout(() => {
    if (chatListRef.value) {
      gsap.set(".chat-list,.chat-list-inner", { pointerEvents: "none" })
      chatListRef.value.scrollTo({
        top: chatListRef.value.scrollHeight,
        behavior: "smooth",
      })
      setTimeout(() => {
        gsap.set(".chat-list,.chat-list-inner", { pointerEvents: "auto" })
      }, 500)
    }
  })
}

const toggleReply = async () => {
  showReply.value = !showReply.value
  const cls = ".chat-operate,.chat-operate-bg"

  if (showReply.value) {
    gsap.set(".chat-list", { overflow: "hidden" })
    gsap.set(cls, { display: "block", opacity: 0 })
    await gsap.to(cls, { duration: 0.3, opacity: 1 })
  } else {
    await gsap.to(cls, { duration: 0.3, opacity: 0 })
    gsap.set(cls, { display: "none" })
    gsap.set(".chat-list", { overflow: "scroll" })
  }
}

const toggleMask = (mask?: boolean) => {
  showScreenMask.value = !showScreenMask.value
  const cls = ".home-view-mask"

  if (showScreenMask.value) {
    gsap.set(cls, { display: "block", opacity: 0 }).then(() => {
      if (mask) {
        gsap.set(".mask-wrap", { display: "none" })
      }
      gsap.to(cls, { duration: 0.3, opacity: 1 })
    })
  } else {
    gsap.to(cls, { duration: 0.3, opacity: 0 }).then(() => {
      if (mask) {
        gsap.set(".mask-wrap", { display: "block" })
      }
      gsap.set(cls, { display: "none" })
    })
  }
}

const chatEndCallback = () => {
  markCurChat()
  setTimeout(() => {
    toggleMask()
  }, 1500)
}

const handleClickDialog = () => {
  toggleAlert()
}

const handleReplyChat = () => {
  const newChat = chats[curChatList.value.length]
  curReplys.value = newChat.reply as string[]

  toggleReply()

  const h = document.querySelector(".chat-list-inner")?.scrollHeight || 0
  const h2 = document.querySelector(".chat-operate-bg")?.clientHeight || 0
  gsap.set(".chat-list-inner", { minHeight: h + h2 + "px" })
  chatListScrollToBottom()

  return
}

const handleNextChat = throttle(
  () => {
    if (initing.value) return
    if (curChatList.value.length >= chats.length) return
    if (showReply.value) return

    const newChat = chats[curChatList.value.length]
    if (newChat.reply?.length) {
      handleReplyChat()
      return
    }

    curChatList.value.push(newChat)
    if (chatListRef.value) {
      chatListScrollToBottom()
      playMsgSound()
    }

    // chat end
    if (curChatList.value.length >= chats.length) {
      chatEndCallback()
    }
  },
  500,
  { trailing: false },
)

const handleReplay = throttle(
  async (msg: string, opIndex: number) => {
    playMsgSound()
    markOpRecords({ index: curChatList.value.length, opIndex })

    const newChat = chats[curChatList.value.length]
    // @ts-ignore
    curChatList.value.push({ ...newChat, content: msg })

    chatListScrollToBottom()
    await toggleReply()
    curReplys.value = []

    // chat end
    if (curChatList.value.length >= chats.length) {
      chatEndCallback()
    }
  },
  500,
  { trailing: false },
)

const toReview = async () => {
  await slideEnter()
  router.replace(`/cinema/${CinemaUserEnum.zhuyuan1}`)
}

const toPlay = async () => {
  toggleMask()
  await slideEnter()
  router.replace("/play")
}

const handleBook = async () => {
  toggleBook()
}

const handleClaimAll = async () => {
  markAchv(chatsMarked.value[0].user)
  toggleGiftAlert()
}

const handleClaim = (index: number) => {
  markAchv(chatsMarked.value[index].user)
  toggleGiftAlert()
}
</script>

<template>
  <svg
    data-v-49463ad2=""
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    style="display: none"
  >
    <defs>
      <filter id="stroke-text-svg-filter-1">
        <feMorphology operator="dilate" radius="0.4359375"></feMorphology>
        <feComposite operator="xor" in="SourceGraphic"></feComposite>
      </filter>
    </defs>
  </svg>
  <svg
    data-v-49463ad2=""
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    style="display: none"
  >
    <defs>
      <filter id="stroke-text-svg-filter-3">
        <feMorphology operator="dilate" radius="1.4359375"></feMorphology>
        <feComposite operator="xor" in="SourceGraphic"></feComposite>
      </filter>
    </defs>
  </svg>
  <svg
    data-v-49463ad2=""
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    style="display: none"
  >
    <defs>
      <filter id="stroke-text-svg-filter-5">
        <feMorphology operator="dilate" radius="2.4359375"></feMorphology>
        <feComposite operator="xor" in="SourceGraphic"></feComposite>
      </filter>
    </defs>
  </svg>

  <div class="home-view">
    <div class="circle-wrap">
      <div class="back-btn" @click="handleBack"></div>
    </div>
    <DynamicBg class="qq-block" name="qq_block">
      <div class="dialog-list">
        <div
          class="dialog-item"
          :class="item.isLock ? 'lock' : 'unlock'"
          v-for="(item, i) in dialogList"
          :key="i"
          @click="handleClickDialog"
        >
          <div
            class="dialog-avatar"
            :style="item.isLock ? {} : { backgroundImage: `url(${item.avatar})` }"
          >
            {{ item.isLock ? "?" : "" }}
          </div>
          <div class="dialog-content">
            <div class="dialog-name">{{ item.isLock ? "???" : item.name }}</div>
            <div class="dialog-time">
              <div class="dialog-time-tag" :class="item.isLock ? 'lock' : ''"></div>
              <div class="dialog-time-txt">{{ item.isLock ? "11小时后" : "尚未通关" }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-block">
        <DynamicBg class="chat-frame" name="chat_block"></DynamicBg>
        <div class="chat-title" :data-text="roomName">{{ roomName }}</div>
        <div class="chat-bg"></div>
        <div class="chat-list" ref="chatListRef" @click="handleNextChat">
          <div class="chat-tips">{{ toptips }}</div>
          <div class="chat-list-inner">
            <div
              class="chat-item"
              :class="[item.isRight && 'chat-item-right', !curChatMarked.chatEnd && 'has-animate']"
              v-for="(item, idx) in curChatList"
              :key="idx"
            >
              <div class="chat-avatar-wrap" :class="item.user === 'bot' && 'chat-avatar-bot'">
                <div class="chat-avatar" :style="{ backgroundImage: `url(${item.avatar})` }"></div>
              </div>
              <div class="chat-content">
                <div class="chat-txt" :data-text="item.content">
                  {{ item.content ?? item?.reply[curDialogOpRecords[idx] ?? 0] }}
                </div>
              </div>
            </div>
            <div class="chat-inner-empty"></div>
          </div>
        </div>

        <div class="chat-operate-bg"></div>
        <div class="chat-operate">
          <DynamicBg
            class="reply-item"
            v-for="(item, idx) in curReplys"
            :name="idx === 0 ? 'reply_1' : 'reply_2'"
            :key="idx"
            @click.stop="handleReplay(item, idx)"
          >
            <span class="reply-item-txt" :data-text="item">{{ item }}</span>
          </DynamicBg>
        </div>

        <div class="chat-tips-mask home-view-mask">
          <div class="chat-tips-wrap">
            <div class="chat-tips-white-mask"></div>
            <div class="chat-friendly-tips-wrap">
              <div class="chat-friendly-tips">
                <div class="chat-friendly-tips-title" data-text="友情支援">友情支援</div>
                <div
                  class="chat-friendly-tips-cont"
                  data-text="每合成5次，获得1位1~9随机「电费加倍」倍率"
                >
                  每合成5次，获得1位1~9随机「电费加倍」倍率
                </div>
              </div>
              <div v-if="curChatMarked.game.finished" class="best-score-wrap">
                <div class="best-score-label" data-text="本关历史合成最高">本关历史合成最高</div>
                <div class="best-score-val-wrap">
                  <div class="best-score-val">{{ formatNumber(curChatMarked.game.bestScore) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mask-btn-wrap home-view-mask">
          <div v-if="!curChatMarked.game.finished" class="mask-btn" @click="toPlay">
            <span class="mask-btn-icon"></span>
            <span class="mask-btn-txt">开始游戏</span>
          </div>
          <div v-else class="mask-btn-inner">
            <div class="mask-btn-2" @click="toReview">
              <span class="mask-btn-icon-1"></span>
              <span class="mask-btn-txt" data-text="剧情回顾">剧情回顾</span>
            </div>
            <div class="mask-btn-2" @click="toPlay">
              <span class="mask-btn-icon-2"></span>
              <span class="mask-btn-txt">开始游戏</span>
            </div>
          </div>
        </div>
      </div>
    </DynamicBg>
    <div class="qq-block-bottom"></div>

    <div class="operate-wrap">
      <div
        class="operate-item operate-mute"
        :data-state="isMute ? 'mute' : 'open'"
        @click="handleChangeMuteState"
      ></div>
      <div class="operate-item" @click="handleBook"></div>
      <div class="operate-item"></div>
    </div>

    <DynamicBg class="task-btn" name="task_btn" @click="toggleAchv"></DynamicBg>
    <DynamicBg name="blk_di_3" class="right-bottom"></DynamicBg>

    <div class="mask-wrap home-view-mask">
      <div class="mask"></div>
    </div>

    <ViewModal :visible="visAlert">
      <DynamicBg class="home-modal-wrap modal-alert" name="alert_bg_1">
        <div class="alert-title" data-text="关卡解锁条件">关卡解锁条件</div>
        <div class="alert-content">
          <div class="alert-text">1、完成前置关卡</div>
          <div class="alert-text">2、敬请期待</div>
        </div>
        <div class="alert-footer">
          <div class="alert-btn" @click.once="toggleAlert">
            <span class="alert-btn-text" data-text="确认">确认</span>
          </div>
        </div>
      </DynamicBg>
    </ViewModal>

    <ViewModal :visible="visBook">
      <DynamicBg class="home-modal-wrap book-modal" name="modal_bg_3">
        <div class="book-modal-title" data-text="活动说明">活动说明</div>
        <div class="book-modal-body">
          <div class="book-modal-content dc-scrollbar">
            <div class="book-modal-row" v-for="(item, idx) in bookContents" :key="idx">
              <div class="book-modal-row-title-wrap">
                <div class="book-modal-title-cil"></div>
                <div class="book-modal-text" :data-text="item.title">{{ item.title }}</div>
              </div>
              <div class="book-modal-text" :data-text="m" v-for="(m, i) in item.content" :key="i">
                {{ m }}
              </div>
            </div>
          </div>
          <div class="modal-scrollbar-track"></div>
        </div>
        <div class="book-modal-footer">
          <div class="book-modal-btn">
            <span class="book-modal-btn-text" data-text="查看协议">查看协议</span>
          </div>
          <div class="book-modal-btn" @click.once="toggleBook">
            <span class="book-modal-btn-text" data-text="确认">确认</span>
          </div>
        </div>
      </DynamicBg>
    </ViewModal>

    <ViewModal :visible="visAchv">
      <!-- Achievement -->
      <DynamicBg class="home-modal-wrap home-modal-achv" name="modal_bg_2">
        <DynamicBg class="modal-achv-close" name="btn_close" @click.once="toggleAchv"></DynamicBg>
        <div class="modal-head">
          <div class="modal-title" data-text="成就列表">成就列表</div>
          <div class="modal-subtitle-wrap">
            <div class="gift-box"></div>
            <div class="modal-subtitle" data-text="活动奖励将于15分钟内通过游戏内邮箱发放">
              活动奖励将于15分钟内通过游戏内邮箱发放
            </div>
          </div>
          <div
            class="modal-head-btn dc-button"
            :data-disabled="fisdGameCount > achvCount && fisdGameCount <= 1 ? false : true"
            @click.once="handleClaimAll"
          >
            <span v-if="fisdGameCount >= 1 && !chatsMarked[0]?.achv" class="warn-icon"></span>
            <div class="modal-head-btn-txt">全部领取</div>
          </div>
        </div>
        <div class="modal-body">
          <div class="modal-body-content dc-scrollbar">
            <div
              v-for="(item, idx) in 5"
              :key="item"
              class="modal-row"
              :style="achvCount >= item ? { display: 'none' } : {}"
            >
              <div
                class="modal-row-title dc-text-stroke"
                data-stroke="5"
                :data-text="`帮助${item}位代理人解决难题`"
              >
                帮助{{ item }}位代理人解决难题
              </div>
              <div class="modal-gift-block">
                <div class="modal-gift">
                  <span class="modal-gift-num dc-text-stroke" data-stroke="3" data-text="40"
                    >40</span
                  >
                </div>
                <div class="modal-gift">
                  <span class="modal-gift-num dc-text-stroke" data-stroke="3" data-text="4">4</span>
                </div>
                <div class="modal-gift">
                  <span class="modal-gift-num dc-text-stroke" data-stroke="3" data-text="10000"
                    >10000</span
                  >
                </div>
              </div>
              <div class="modal-row-num-wrap">({{ fisdGameCount }}/{{ item }})</div>
              <div
                class="modal-row-btn dc-button"
                :data-disabled="fisdGameCount < item"
                @click.once="handleClaim(idx)"
              >
                <span
                  v-if="fisdGameCount >= item && !chatsMarked[idx]?.achv"
                  class="warn-icon"
                ></span>
                <span class="dc-button-text">{{
                  chatsMarked[idx]?.achv ? "已完成" : fisdGameCount >= item ? "领取" : "未完成"
                }}</span>
              </div>
            </div>
          </div>
          <div class="modal-scrollbar-track"></div>
        </div>
      </DynamicBg>
    </ViewModal>

    <ViewModal :visible="visGiftAlert">
      <DynamicBg class="home-modal-wrap modal-alert" name="alert_bg_1">
        <div class="alert-title" data-text="领取成功">领取成功</div>
        <div class="alert-content">
          <div class="alert-text" style="text-align: center">
            活动奖励将于15分钟内通过游戏内部邮箱发放(假的)
          </div>
        </div>
        <div class="alert-footer">
          <div class="alert-btn" @click.once="toggleGiftAlert">
            <span class="alert-btn-text" data-text="确认">确认</span>
          </div>
        </div>
      </DynamicBg>
    </ViewModal>
  </div>
</template>

<style scoped lang="scss">
.home-view {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  // background-image: url(../assets/bg2.jpg);
}
// .actor {
//   position: absolute;
//   top: 1rem;
//   right: 5rem;
//   width: 4rem;
//   height: 10rem;
//   background-size: 100% auto;
//   background-repeat: no-repeat;
//   background-image: url(../assets/niko.png);
// }
.circle-wrap {
  position: absolute;
  top: -0.03rem;
  left: 3.27rem;
  width: 1.84rem;
  height: 2.13rem;
  z-index: 3;
  background-image: url(data:image/png;base64,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);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  .back-btn {
    position: absolute;
    left: 0.56rem;
    top: 0.7rem;
    width: 0.9rem;
    height: 0.87rem;
    cursor: pointer;
    background-repeat: no-repeat;
    border-radius: 50%;
    background-size: 100% auto;
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAABYCAMAAABPoGB8AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAECUExURUdwTJdAQJZAQJVAP5ZAQLFPTLhUUKlIRblJRZdAQORtZJU/P5Q+PuZtZONsZOZtZJdAQJZAQJdBQONsY5Y/P+VtZeNsZJY/P5U/P+NsZNBhW+dvZeZuZZU/P+JrY85hWrRRTsFZVL5YVOdvZv7QRZVAQLVZHLNYGuZuZf7PQpQ/QONtYf7//rlbI+hvZ+uxOvrKQtVlXsJaVZhBQfXBP7hfHa9OS81gWadKSNZoTd5rV75oId2aMtxoYOBrYsxjPvG7PdaPLsNwJM6CKv7TUMJfL51EQ6JHRch5J+SmNv789f767P7kk/7XYf712eZ9Wv7opf7deP7uvuaVR9N1Pd2GQnPnXs0AAAAjdFJOUwBG6nv0HP0QBuD01Cg/2yyOo8ZVWMqfNrW07oN0amrQmYGxl4+4nwAACFZJREFUWMPFmYl22jgUhgsYjAOENfskmY7xAg67WQzYgNmXrNN5/1eZK1leMcTQOWduT9vTJvn08+vqSlf68eP/jTgdTadTqVQeBfydTtPx/wycyj89XF/fXV1dQjw/P99d/8yn0lH6N9E0gB+u7y4vLy4uJEmEX5qkaap6f3///NfPUPT8TxCPpvMPd1eXFyIOFke1yrLwD0lTGzDAn4Xz9MejqT+ury4uWBPrDhhAU7vNWC5zQ5+DvrsEMnssRK3RjTHZ0Gl4GqOPk0188zR8PJ2/DoQ28R0mk4wHTL7Uw9UFGzxEtRvr5Qp0ILeRbPaUEKVGsxcOID6efroL6ogVVUltdqhcKP4d+49vLHl/f0e4Pee7nUXiuDV0+qjdAP4bxfu7JPrRmQh9TPfD5SFLRASu1cayLI9rw1+K5BWP6OHDdMQ+KPqfv9djuV4vFYvFUn081Ed9dp/eOkgH9pX/Upfe/xnWZAw2olSbtud9r3a12TtIj/rPpYWGsOjycMCPpH36kmMKfjlD5+8u/NB9gi4WZzMnXKgoe9/ciC24RMjHlNS1D1vq/5og9Gz2+rn7+PgsEvHyZCD4SBfBdi6XDJQoIqDX43px9vnxtt1uNpuPmQGvg+eCMN+Ds1qzx3HZqNeUp73JFKVf02GtXnzdfW03Lyi2O6J8DJbzQmUfjo0JP8a/M0VSQLYM6DeD/PJiCi/JQ73tD4d87LW4RNKTKZd7jkzBEQf6ZUvYkOUrMEXgfWyBEgnSqQztEu7JFEkBR+SZA/3ytiPs2kQHNg8TKlare3gJpJeZkFu4uD+Rr19bC735IpkCnkx1fTAYtCuKBCGy7gGwdC5LHxIuKSuYSJBto5FskoX1cW29Hg4n09VKn89HI0WTxKonYZzS6SeH8CpyW67PPrY2+uO1aC/PUr1ex+VrPZys9EGlMlKceLHRaZUdrqev7f1B7I+mNVg1XxsHeuZY+XaBqaMBJiswaK5IziIAvjA3lit2jouKjtkfBnuzfdv5o4lHYNJkBXk5V0RHNnJlKhLfc0VU5sAulmbg9wbIH5+z4mG0wZfX0wEk/Uhy+sLlol5XqspcH8rwiWe7r6+v3efrt2iSnJhuKkSrlCNTartS7c/b0xqmzWaoBpYCoAldsKskqrymL3SeuFKVRnx7MjZmq1QKSMb0NVqzc61KTAc4dxs1VpDpSr8iDCZy8YyQkTE8mVQRzSgpMJbl4og/F15f67xVbGBGAR7GpqfuNOLKXBBMW06MUm3FC2aZNNLFKLypZ81yRTAn9NQw4OREoCK4sUjzlwSuAJzX1/Xz4YojF40Zzd9LZAFVBJ4fnOVLvabb8KoBx3vp071owwV+dY50PKEe5Thdft7bmQjws6SjTdXjOccg+J/35hpCtvDtk1wnK208xZtq35EtRmG04ZDniI5KV1C0aTmaT8GV5ybcrGd4RmFOhwEXUglONLvdzDjdCdYpyVihBN7VWHsVwadrB5zT0uzzbbtBh5ma4QpZ/hKBY8+bGuuRHmgllYydcPsJwnUeW27uoqhwGdmSialWb2O4LugBjIGavzVOSnVDOG9uF2j/L5M8j8Qa9uaMjeGDGFN6fTNOSvUxlESHcJQsnLlCH8NdxxZawbYPvs2YEsC326/PGWozeEN41VFxOQqfR0NMV2M9xvD6cOyxvSSPx67uovgK22BJhgMYYgtWp0Esp3CPkWSaqqOlNIyBAibv7WWT4bpmNkbm3j+cYk+sVDErCxfGLUYy12k4DnOm7VOP7ZBvg4G+mgxhhNoYomacitroozo6AdQAgHBycolme7YvZuX1sR1tZXy7PdD11WoKAcc5ODHyWLejy1ANV8jZgo5QMdV5lByRbJ+4bTcqH/4SjAFBuG62mSvmgS4U7nRFZydPaow326E6YZQz8L8rju6ITCexHExPLJtO6Xa2u+njSZtotQLz5452GoTj6bS6CzpLuaYUDqNmkRnKJTfcI53n3YdQS7h1Qo8Xwm7p5lpC2sd1xw6P4PN5BQKoKOajvut0bjpuuYJ8aXW6ki9dhzaUtIfGbjPvS1pfUZQR/O7jxsLVVoBwHDmrXaQz1CLmMsaiQ4WE5khGR/EJTmnUCLHmTaO3JUK9HDaFclwB3DCtXlNjfegCiJ/CwhmiQz6u2UcueiRzNl3NIp3lvMZUMR2Lb8PKHAx4V3Xyvd1oxIgp1tEfT2kozHmNQTljrhE76/pH2OhKZF84KgEct2x66Kw2qrgTb95ng7BdwnHd5cB2VfT20YDnrZQeSccuL7skC8k24bxYyFB+dFbqj3BeQ0orffE4m0wmx+zduCRznB8d0k6S+hCSu5Xd98RiU/s3UfECg+mNPXm4wffp8vf8LvubYhqD6Rp7aqDrVoudu/G9QLuFL7WWsa522nUr2B1bmnPJMQX/uz9kO8ctOs2GdJrszsKUzTGPhy50QwkOvqvVi3XVoOLx/bZlCXfkSvRHwaAj8YG8ATTOkiBsKAMJ/E2tZQA8fhHpLG3Zx9kmvVzG+K6qiQfvjfFjCEZbbObxm9v/eAjlDMHHmg1Vk0QfsNroNmO9hRPNJQrfv1sksxTGgzkLxO82GioaAockaSqAwY7ecsE50dTtTZA3kWiE4Yh6xO91YIRmtwuDwB/dZjPW6SHNLjTHZJIBX4lCtxTBox9vwQjLnhnL5aLlJYPs4C9F8WQkQZGfK5ddGL//ohKR6CkvgPRNhqFcNDs8Q1HgyKnPc3Qo68AfDCpxxsufoT4RPk4O5yLJc99c6WQhmwgf0B8O5zKh33rOjdPJUOQ2wYQpxxAUFWYS2Ujotx+K8St0MvSYyeZgiDBQE7ls5jGUjP43b9y/Ef8CMWq2nqzJ3fIAAAAASUVORK5CYII=);
  }
}
.qq-block {
  width: 15.2rem;
  height: 10.5rem;
  position: absolute;
  top: 0;
  left: 2.1rem;
  background-size: 100% auto;
  background-repeat: no-repeat;
}
.qq-block-bottom {
  position: absolute;
  bottom: 0;
  left: 2.1rem;
  width: 8rem;
  height: 1.22rem;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url(data:image/png;base64,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);
}
.dialog-list {
  position: absolute;
  top: 1.8rem;
  left: 2.22rem;
  gap: 0.2rem;
  display: flex;
  flex-direction: column;

  .dialog-item {
    display: flex;
    align-items: center;
    gap: 0.1rem;
    width: 3.4rem;
    height: 1.4rem;
    border-radius: 999rem;
    border: 0.08rem solid #c4a7f5;
    background-color: #60438e;
    padding: 0 0.14rem;
    cursor: pointer;
  }

  .dialog-content {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .dialog-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    font-size: 0.8rem;
    border-radius: 50%;
    color: #141215;
    background-color: #c4a7f5;
    border: 0.04rem solid #c4a7f5;
    background-size: 100% 100%;
    background-repeat: no-repeat;
  }

  .dialog-name {
    color: #fff;
    font-size: 0.38rem;
  }
  .dialog-time {
    position: relative;
    background-color: #9874db;
    border-radius: 999rem;
    width: 1.73rem;
    height: 0.48rem;
  }
  .dialog-time-tag {
    position: absolute;
    top: 0.12rem;
    left: 0.16rem;
    width: 0.2rem;
    height: 0.23rem;
    background-size: 100% auto;
    background-repeat: no-repeat;
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAMAAAAiV0Z6AAABv1BMVEXwbr/nabPoa7Lub7vwbb/ubr3yb8LybsDtbLnpa7XpbL3rarn//P///v//5Pv/+v//b8L+pOD/+P//9v//7/7/6P7/7v3+bsH8//7/7v7+///0h8L/9f74gsb/b8T7ccD0dLzwc7vmfbn/3f372fD7zuv8w+v/teXtns3mncf1e8L8b8Dtgb7re7ztdbnmeLf/8f7/6v371/X63/L63PH/wO79xu351+v9w+r/s+X+sOXsqtbyntDupM/8e8fhncX4gsXsjMP5csD5cL70cbz/6v//6/3+9Pv+7/v/4Pv/0fj96/f96PX/z/X+0fP85fL71PD53u39uOb/reX6vOP2vOL/peH+m9rtstb8ltT5ntP9ktHul8j6gMj7hMblnMX/dMX2hsT/ccTfn8PzgMPqhcD3c7/7br/ue77yd7z3cLzehrbderH+4f3+9/v/5fn/3vn/1fX82fH+x/H10un+venz1+fzy+X/qeX0weHwyeD4tN/9rd//n9/+md37ptr6pdr7p9XntdL/h8//gM/ppc32ms3mqszhrcv5g8nwkcf4fsTlksL5e8Lnj8Hngbzvdbvbj7nwb7nhf7jhebXRvfqhAAAADHRSTlPv7+/v7+/x8O/v5+9m8ex7AAABsElEQVQoz03PhW8bMRQGcKdJcU7sOQe57pa7W5I1zIwLlJlxbbcyjJkZyvgH107UKp9kWfq9T096oMmKraKi+u+x+CsKxtgKgAGLuKz5is5MJuMs+lSPKNbUo605J4dsT3qHJpzekogx041tb87B86bnpk7ekXWXPaz7eHvrryNkGhz7PDbIC/H59Q3M9Nz76VkoNrvqXp1/Jdmm3ApTrO3HO1/ObWnrFXXuhW18T8EGYBA3syPCu2P/qapq3h/p2YOSCADw+HIJ4ePZ7mUgENjd2bkIVBQA9OW1mQj39n/B5XItFVZWCkV3CYCWo+8jQdITsYfDYbvdHo3Gp/ONoGHxTReCSJaDXFCWzYTw4w+p3kkK0GiEZt7WRaCx3SKl7uqp3ueokoGJbx/6EdOOmrJud2LB5xplynU8uOk+TSz4l0YRbLcIdUqi2c0/w9VuqqpJpiiSO/k3AOH13kdJDkGIhmcOf/ZDaLQIqarGBIQQ6XFMvu5GdC6lqbYuxngzjSzxEv0ICaXpFS359329prr0fckDAJZ/Td+uy9TX38tNoK1Z39qg0+noq+VWY3PbFfrBVw22FfVqAAAAAElFTkSuQmCC);

    &.lock {
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAXCAMAAAA8w5+RAAAB1FBMVEWQcs+ZeNWVc9mWdNuXdNaTc9WRd8aYdN2Yd9qQcdGQcc2Vc9aWddKUddKUds6UdsyRd8OPdsOZdtwUERcVERmNbsWJbMJrU5siFDsVExYKDgIfGC0UFQ6WddhcR4VRPHYUDB+Lcb+IcrdrUpgkFT8mGzkjGTIfGCqYdt6YddmWddKTdtGRcct7Yq1lVYg1JFg1KEszKUciEzkhFTUaFCMYEh4WER0WEhuXddWOcMyQdsh/aql4ZKJ3YKFyXJpiUoJZSnVLPGZFOVs9L1g6K1M6Lk4xI0kpHD8wKTstJTchGC8XDyISEBWaduCYddiUc9CUeMyTeMmNbseKbcWPdMOHa7yEbLZ0WqhuV5tzYZhnUZNyYZJlUJFqWI1eSIplVYBSPX1XRHxTPHpXSHFKNXFPQG1CMmI6Mkg3LkQtIT4tJTsfEjQmHjIjHSsbESocFicdGCQXER8YEx0ZFhqTdNmVc9WPdMmOcMmQccaIasWFZ7+LcrmCaLmAZrSGcbJ/ZbF/Za15X6V8aKFqUJ9zYZ1uW5RiSJJxYJBuXIxcRoxiUIlfSoZfUIBgVHdQQHJNO3BWS2tIOWhIPF9ANFY+M1IzJk8vIkQwJUE3LkAsJDEeEi8JBQuvDRWiAAAAEnRSTlPv7+/w7+/v8e/v7+fv7+/v7+8To3dtAAABmklEQVQY01XMBU/DYBAG4I92G25dYQKFFdbOmTF3N9zd3d3d3Z0/y0FYAm9y9yZPcocyUzGMy83O5eXl83g5WRwOhqcivJogalT2MofT5XRs1isVhLwa4YSCUtFOjy8QDPg8jiZlDSEHpKy0ezhsFEoNk+Fh15qSIhBGWNX7vnGpdqhvSCtkbjRqSg6obL4MMyNdmi1NR2D2uaNw+RtrNbcR3UWLXbXSfBWL9O/WEoBq90jEf9RUX1dnbx9l7l02BcIUdHeQ8XfulEE6R9nH4wIKcax7g6/s2KCnAnIXnY16t1WIo+4KySqnJ/Q6nU4/Mbe4GGpbRSkNAyxJkubEzMfMPEkWi6d6GlFKQWmcL+JbZC/B8TkLoKyk8BuLACv1/W3emIlfLC76xSrAp3b6dMwMKPuDITd99jb/H0367pbeGPxMnsdJwGjvwfU7KUriAGtesJimHrz+afOCSMz2ADb0GSWQhJGJJyQS8tN43ojSbCdaqVBoMEhhQ09qD20ojdpoFQgE5eUwP926voQycW46gmTA/FQ6F/8C4HJfv+00xyUAAAAASUVORK5CYII=);
    }
  }
  .dialog-time-txt {
    position: absolute;
    top: 0.11rem;
    left: 0.44rem;
    color: #141215;
    font-size: 0.23rem;
  }

  .dialog-item.unlock {
    background-color: #fe9acb;
    border-color: #fadc6b;

    .dialog-avatar {
      border-color: #913c74;
      background-color: #ff6ec1;
    }
    .dialog-name {
      color: #891461;
    }
    .dialog-time {
      background-color: #ff6ec1;
    }
    .dialog-time-txt {
      color: #fff;
    }
  }
}
.task-btn {
  width: 5rem;
  height: 4rem;
  position: absolute;
  bottom: 0.55rem;
  right: 2.87rem;
  cursor: pointer;
  background-size: 100% auto;
  background-repeat: no-repeat;
}
.operate-wrap {
  position: absolute;
  top: 0.45rem;
  right: 3.2rem;
  width: 4.3rem;
  height: 1.3rem;
  border: 0.1rem solid #d8c5ff;
  background-color: #5d4987;
  border-radius: 999rem;
  box-shadow: inset 0 0.01rem 0.05rem 0.05rem rgba(0, 0, 0, 0.2);
  .operate-item {
    position: absolute;
    width: 0.9rem;
    height: 0.9rem;
    top: 0.1rem;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    background-position: center;
    cursor: pointer;

    &.operate-mute {
      left: 0.3rem;
      &[data-state="mute"] {
        background-image: url(../assets/mute_ban_1.png);
      }
      &[data-state="open"] {
        background-image: url(../assets/mute_open_1.png);
      }
    }
    &:nth-child(2) {
      left: 1.6rem;
      background-image: url(../assets/book_1.png);
    }
    &:nth-child(3) {
      right: 0.3rem;
      background-image: url(data:image/png;base64,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);
    }
  }
}
.right-bottom {
  position: absolute;
  bottom: 0;
  right: 1.8rem;
  width: 7.7rem;
  height: 1.3rem;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.chat-block {
  position: absolute;
  top: 1.65rem;
  right: 1.43rem;
  width: 7.6rem;
  height: 8rem;
  .chat-frame {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background-repeat: no-repeat;
    background-size: 100% auto;
  }
  .chat-bg {
    position: absolute;
    left: 0.2rem;
    right: 0.2rem;
    top: 1rem;
    bottom: 0.3rem;
    border-radius: 0.3rem;
    background-color: #eae8ef;
    z-index: 0;
    .chat-cap {
      position: absolute;
      left: 0;
      right: 0;
      top: 0.2rem;
      height: 0.3rem;
      z-index: 1;
      background-color: #eae8ef;
    }
  }
  .chat-title {
    position: absolute;
    top: 0.6rem;
    left: 1.6rem;
    font-size: 0.4rem;
    color: #dac6ff;
    z-index: 2;

    &::after {
      content: attr(data-text);
      position: absolute;
      left: 0;
      color: #58468c;
      z-index: 0;
      filter: url(#stroke-text-svg-filter-3);
    }
  }
}
.chat-list {
  position: absolute;
  top: 1.5rem;
  left: 0.2rem;
  right: 0.2rem;
  bottom: 0.32rem;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.14rem;
  overflow: scroll;

  &::-webkit-scrollbar {
    display: none;
  }

  .chat-tips {
    width: 100%;
    text-align: center;
    font-size: 0.24rem;
    color: #7e7c7e;
    position: relative;
  }

  .chat-list-inner {
    height: auto;
    display: flex;
    flex-direction: column;
    gap: 0.14rem;

    .chat-inner-empty {
      flex-shrink: 0;
      display: block;
      width: 100%;
      height: 0.04rem;
    }
  }

  .chat-item {
    display: flex;
    gap: 0.2rem;
    padding: 0 0.3rem;
    @keyframes showAvatar {
      0% {
        transform: scale(0);
      }
      100% {
        transform: scale(1);
      }
    }
    @keyframes showContent {
      0% {
        transform: scale(0);
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
      }
    }
    &.has-animate {
      .chat-avatar-wrap {
        transform: scale(0);
        animation: showAvatar 0.3s 0.3s forwards;
      }
      .chat-content {
        transform: scale(0);
        transform-origin: top left;
        animation: showContent 0.3s 0.3s forwards;
      }
    }
    .chat-avatar-wrap {
      width: 0.7rem;
      height: 0.7rem;
      border-radius: 50%;
      background-color: #c4a7f5;
      background-size: 100% 100%;
      background-repeat: no-repeat;
      position: relative;

      .chat-avatar {
        position: absolute;
        top: 0.02rem;
        left: 0.02rem;
        right: 0.02rem;
        bottom: 0.02rem;
        background-size: 100% 100%;
        background-repeat: no-repeat;
      }
    }
    .chat-content {
      position: relative;
      display: flex;
      align-items: center;
      background-color: #fff;
      color: #161417;
      font-size: 0.26rem;
      padding: 0.2rem 0.3rem;
      max-width: 4.8rem;
      border-radius: 0.3rem;

      &::after {
        content: "";
        position: absolute;
        top: 0.1rem;
        left: -0.1rem;
        width: 0.2rem;
        height: 0.2rem;
        background-size: 100% auto;
        background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTEiIHZpZXdCb3g9IjAgMCAxMCAxMSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEuNSA1Ljk5OTc2QzIuNzkyMjEgOC4xMjI2OCA2IDEwLjQ5OTggNiAxMC40OTk4TDEwIDAuOTk5NzU2QzYuNDU2OSAxLjg4NTUzIDMgMiAwIDAuNDk5NzU2TDAuNSAzLjVDMC41IDMuNSAwLjk1NjAwNSA1LjE2NTgxIDEuNSA1Ljk5OTc2WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==);
      }
    }
    .chat-txt {
      position: relative;

      &::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        color: #fff;
        z-index: 0;
        filter: url(#stroke-text-svg-filter-3);
      }
    }
  }
  .chat-item-right {
    flex-direction: row-reverse;
    .chat-content {
      color: #fff;
      background-color: #9779d4;
      transform-origin: top right;
      &::after {
        left: unset;
        right: -0.1rem;
        transform: rotateY(180deg);
        background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTEiIHZpZXdCb3g9IjAgMCAxMCAxMSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEuNSA1Ljk5OTc2QzIuNzkyMjEgOC4xMjI2OCA2IDEwLjQ5OTggNiAxMC40OTk4TDEwIDAuOTk5NzU2QzYuNDU2OSAxLjg4NTUzIDMgMiAwIDAuNDk5NzU2TDAuNSAzLjVDMC41IDMuNSAwLjk1NjAwNSA1LjE2NTgxIDEuNSA1Ljk5OTc2WiIgZmlsbD0iIzk3NzlENCIvPgo8L3N2Zz4K);
      }
    }
    .chat-txt {
      &::after {
        color: #9779d4;
      }
    }
  }
}

@mixin chat-operate {
  position: absolute;
  left: 0.2rem;
  right: 0.2rem;
  bottom: 0.2rem;
  height: 2rem;
}
.chat-operate-bg {
  @include chat-operate;
  background-color: #c4a7f5;
  border-radius: 0 0 0.5rem 0.5rem;
  display: none;
}
.chat-operate {
  @include chat-operate;
  z-index: 5;
  display: none;

  .reply-item {
    cursor: pointer;
    position: absolute;
    left: 0.25rem;
    right: 0.25rem;
    height: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.26rem;
    background-size: 100% auto;
    background-repeat: no-repeat;

    &:nth-child(1) {
      top: 0.15rem;
      .reply-item-txt::after {
        color: #ffd265;
      }
    }

    &:nth-child(2) {
      top: 1rem;
      .reply-item-txt::after {
        color: #decfff;
      }
    }

    .reply-item-txt {
      position: relative;
      &::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
        filter: url(#stroke-text-svg-filter-3);
      }
    }
  }
}
.chat-tips-mask {
  display: none;
  position: absolute;
  top: 1.3rem;
  left: 0.32rem;
  right: 0.31rem;
  bottom: 0.32rem;
  z-index: 3;
  overflow: hidden;
  border-radius: 0.5rem;
  .chat-tips-wrap {
    &::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1.3rem;
      background-color: #5f469c;
    }
    &::before {
      content: "";
      position: absolute;
      top: 2.1rem;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #fff;
    }
  }
  .chat-tips-white-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
    filter: blur(2rem);
  }
  .chat-friendly-tips-wrap {
    position: absolute;
    bottom: 1.5rem;
    left: 0.15rem;
    right: 0.15rem;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  .chat-friendly-tips {
    height: 2.4rem;
    color: #fff;
    background-size: 100% auto;
    background-repeat: no-repeat;
    background-image: url(data:image/png;base64,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);

    .chat-friendly-tips-title,
    .chat-friendly-tips-cont {
      position: absolute;
      &::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
        color: #5f469c;
        filter: url(#stroke-text-svg-filter-3);
      }
    }
    .chat-friendly-tips-title {
      font-size: 0.4rem;
      top: 0.23rem;
      left: 0.3rem;
    }
    .chat-friendly-tips-cont {
      font-size: 0.3rem;
      top: 1.2rem;
      left: 0.3rem;
      width: 6rem;
    }
  }
  .best-score-wrap {
    position: relative;
    height: 0.8rem;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-image: url(data:image/png;base64,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);
    .best-score-label {
      position: absolute;
      top: 0.17rem;
      left: 0.23rem;
      font-size: 0.4rem;
      color: #fff;

      &::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
        color: #60488b;
        filter: url(#stroke-text-svg-filter-5);
      }
    }
    .best-score-val-wrap {
      position: absolute;
      top: 0.14rem;
      right: 0.13rem;
      width: 2.65rem;
      height: 0.6rem;
      background-size: 100% auto;
      background-repeat: no-repeat;
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARcAAAA3CAMAAAAR1v5kAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAACHUExURUdwTKRy/7R6/LR6+7R5/LR6+7R6/LR6+7N1/bR6+7R6+7R6+7R6+7R4+7R5+7R6/LR6+7R6+/3cS7N5/eOXFbZ88fvWSruC4t6TKv3eYueiHf765tCetfTPYOuuK/K/NfjOQf7mftiRTsOLzf71yMKCtuvBccaGo96vjs+Kd/7qlP7vq8mHkRwavbIAAAARdFJOUwAD6bo+3/P2Dvyl1X4gaViZ2UlKFgAAA35JREFUaN7tm9mOozAQRQlbIGSzDWYPIQlZ+/+/b8qGAAmG1rxSbfVIM2rNy1HdW7eMS9MGx9mY273h6cv5H90z9ltz42i/noVjrg1Lt12C47i2bhlr01n8RmVloWHSsbFWk2SAio4NSoNGBzJjxbJZWzipCDCutd4oS2ZhGvbEf2Rs7mhsw1SAcXaeO0UlCGYPxvV2Ay05W2uqWEiYZeH8wVhb5/+wnK+c3+dfMeQLzGJnTWoou1LKDxVBUDG7vseY3jSWnFJ6TE7zVxJ4jNlh2RjuBJbwnpfPmBc+Bi7ENTatuaztSSz8mV5ifvAfCAwG2vX6bTGmNem4NIZyARlFN4KBC7EaJTmrURUJx41flxjspfCjEAUW4q6cOufqE1jyMk2fVHQj/xTg4EJ0mXtHy0U67iu9lFRwSaIfLFzqghlzF4ElvoDjUl7L6IwEC4QYc7wZCccFLC/hLbWMQixcZEsayS4CSymx8FpGSLp0m2HUMmodV1KBsOtHFUHDRbTqrT4S/ZtGVMuowCQj6EhbbW+rMy54S4ulkRFjWNDYe21oL4yd75yW0J9BRPUPyOgGvwkIEjKuoXnK6A8npl25FEmUnbNM3E3hAONpuiL6SxZvy5X/4DzP8zjmVyQuo2v2sBHRHpDurzAnlbR44ABja8svLmEfS4/NM4UwU2AZqu1BvYQ5l+d45D0y8StNS+jW4L84LmEG/hLcDodDkiR+0nYjoSEYH48HwPIIUfQjfdCPWHCL/AjOoa0XLrDEEguWmdob5hcWVD+3W1VdO4cpAUuRoBGRzC/DvMsgv739l8s/5VNiOaEZkSDvKuYjGfgzTj+CHWA5o5kcYT4am6fv/VhXOy6a8UjM0+r7l1pGtYroERsWcf+ivK+D0bGLd+9GhOeeQX5CUgmpL6PacQNEty/yflf5PYCF1w/HxXRX9/4eoPp+1E5JIvr7jzMqLM33I0XBwFDNO2vB5LhduWiLxcBhWFBfweBz3KZJj7xnaGR0bKI/Lizde4bvDMOI6NIYHZd8vH/5fi8FXRpf9G8naXP0fZ1ILygdV5jLx/u6z/eYoKOTsJYfhFgmH6oyUkUIHVeBRUip996bBdUDVfSvLVfx3lvEmN5+gLibwoZFvR+gfe6TMGwaGt0n0eRWFtL9o+XE/pHQ0t++2giYv/3GETLdPqw9+3VYe3wf9h8os9G/mYsPCQAAAABJRU5ErkJggg==);
    }
    .best-score-val {
      position: absolute;
      top: 0.11rem;
      right: 0.15rem;
      color: #fff;
      font-size: 0.27rem;
    }
  }
}

.mask-btn-wrap {
  display: none;
  position: absolute;
  left: 0.5rem;
  bottom: 0.5rem;
  width: 6.6rem;
  height: 1rem;
  z-index: 11;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: -0.08rem;
    z-index: -1;
    bottom: 0;
    border-radius: 0.28rem;
    // filter: blur(4px);
    // background-color: rgba(255, 255, 255, 0.8);
  }

  .mask-btn {
    width: 100%;
    height: 100%;
    position: relative;
    cursor: pointer;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-image: url(data:image/png;base64,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);

    &::after,
    &::before {
      content: "";
      position: absolute;
      top: 0.23rem;
      width: 0.45rem;
      height: 0.45rem;
      background-size: 100% auto;
      background-repeat: no-repeat;
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAVFBMVEVHcEwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/0WDatFdfVDhAPDGIdEKnjErxxly/n1DJp1LkvFnNqRHWAAAAEXRSTlMA+b4P5jLyQhmiZiMD0HeHVcdo7fwAAAE4SURBVEjHnVbbdoQgDAQBEcVLkO222///z1Lr7lkxAdN5zpxkyJBECAzdYMygxCWoZR5b2KCb2fpKuHF78BN6HgrhtoEzpOuoYhzgkBNWmDcaSDRIkkVCAdrk8ROU0dpjfA81tIccFurQbzo6fYEAzeutvINL6DkFbTKeRY0XCdLxErxSZAa6f36QjGl7oqzFawjfkSCMWM8SIYQHQfn1usMIIdxv1MtqnBBQKemdFBAEVEoSYWhCkpLX1SJdeCecpXixlAm5FFUlhBCPBFsjfGUlmTJhjbloVSKcejEWGod229HWQJqwW6PHCWukzIfYmzDSbu/8A62kVfcPlHfiQX4GkB02BG6R/KHuv2NGcAeZ545K/jDmj3v+Qkk5mCsr6WAuRfbaLSz24i3AOx3+jhPHOU7q588PkUFxuUy3Oc4AAAAASUVORK5CYII=);
    }
    &::after {
      left: 0.25rem;
    }
    &::before {
      right: 0.25rem;
      transform: rotateY(180deg);
    }

    .mask-btn-txt {
      position: absolute;
      top: 0.2rem;
      left: 2.2rem;
      font-size: 0.44rem;
      color: #312d2e;
      font-style: italic;
    }
  }

  .mask-btn-inner {
    display: flex;
    gap: 0.2rem;
    width: 100%;
    height: 100%;
  }
  .mask-btn-2 {
    flex: 1;
    height: 100%;
    position: relative;
    cursor: pointer;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-image: url(data:image/png;base64,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);

    .mask-btn-icon-1,
    .mask-btn-icon-2 {
      position: absolute;
      top: 0.23rem;
      left: 0.25rem;
      width: 0.45rem;
      height: 0.45rem;
      background-size: 100% auto;
      background-repeat: no-repeat;
    }
    .mask-btn-icon-1 {
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAY1BMVEVHcEwsLCwsLCwsLCwsLCwsLCwsLCwsLCwtLS4sLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCyvlfypkfQ0MjleVHs9OUeUf9FFQFNwY5mHdb1mWohNRmCji+h/b7CdhuBTS2p8zd5KAAAAEXRSTlMAPb4PLealG/3zSGtafZHN3ZyNX04AAAHRSURBVEjHpVZbgoMgDLT1hbWtpYCK0ur9T7mCCgm+1t35ajVhkklIDII1pFEUpWHwK4S3Z5FRg/j6uByZX5LJeEb8TPfMr9QHoSTZcgkTuo7ssX78i27iukJyJ3QHceTb53QfmafXnR4hQxwXcuhAYpBHGuN3qpVSitrP3DkgPesve4/oJEce+Wx/Aw/59w3ABEpjDqoAx3/eGA0keS4IlInmI/uyrEVj/lR8QeEaqNQmrJ0lK014DaAwPZI6SSt9PBRHaI/W/X/hGuvXrETCtPqRC4pESFNNIDzxG0yhlbVFq3WK2LxUmqJTSk0syXALED0mUMzK240eRRBENj6tyTKDGeObDFZhSIHhiLhjmMWFjT04fLyULYUVL8QOzO/panKQ1Dq4kHQOXksTNdp/bClA0qZuLV2pAxAvg7KW6CjYXq46BSycOU36FBIFmqDWMAH3ngOv4CE5HjByccmMC/gd4fbmRsWm3hwdL+8CUd4ZUSophFhze/hXlPDGdU+/HGbpYghQ0toxsBBsHgJozAxhTbef1VsE3iDTNLXqFV8Q5FujcmtJgGF8Ox7GNE7/M+7PL5TzK+v8Ujy/dtcXO91Z7H/4dDCB3U99nBx//vwAV2F0Bz/A3TcAAAAASUVORK5CYII=);
    }
    .mask-btn-icon-2 {
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABjUExURUdwTCsrKysrKyoqKigoKAUFBSMjIyoqKisrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKywsLK+V/SkpJ7GX/jg1Po56yEhDWTIxNqOL6KuR9HBimF1TeoFwtJmD2NBAcpoAAAATdFJOUwDfUxQgAws0+OaYbMnV7kisgbpzmwRsAAABoUlEQVRIx5WWWRaDIAxFBVEG5yJY7bj/VRa0toLBIZ+eXMNLQkIU+ZbEhNAK44oSkibRjhlv3FwKxDlHqKibiqTb7pUoOJM/K3ne0DjoH+N66T0ZQ4LCURIq1u4jUjQE8E+rHHQfT1bTlfo0QzJsLK88Is643LQCJ+7/d/wNsYyRYLTnb05F/wDN5b6x+perWLADgCyzdD4Ql4es+B6KXJzPSqlQCJFCAYZuCCFTiLheKlDD4/3oJEyUjQ1BnZSq7qrv12cAuRBbs9IHtL69evBcnK5yaoG21e3t0cs1YjNL3KJNgEHukBQmYk/CD7CIkeIHMSK8pP4Be66VlIJEWRCYpSwN0chNkguMUp7DGaDV+t0rF+CbEYyOzgXwFmAzNXiig2mdBHi1MGkNFA6uti0c2BpwEabWAJovVOap+YD21nAjGcvJ+gLZCHCrzhfIvaJqeIUuw1gFYAh0feiGsmkIrKZAcGrMY+b0IDs/Kg8NY7kcxqfH/QHCWyhRcnZlmRj43FK0uQqtXQSu3fOLfX46lMefDt/HiTj+OBmRnefPBw2pgG98ELtXAAAAAElFTkSuQmCC);
    }

    .mask-btn-txt {
      position: absolute;
      top: 0.25rem;
      left: 1.1rem;
      font-size: 0.36rem;
      color: #312d2e;
      font-style: italic;

      &::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
        color: #b196fe;
        filter: url(#stroke-text-svg-filter-3);
      }
    }
  }
}

.mask-wrap {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;

  .mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
  }
}

.home-modal-wrap {
  position: relative;
  width: 13.8rem;
  height: 9.2rem;
  background-size: 100% 100%;
  background-repeat: no-repeat;

  &.modal-alert {
    position: relative;
    width: 8.8rem;
    height: 5.2rem;
    background-size: 100% auto;
    background-repeat: no-repeat;
    font-size: 0.3rem;

    .alert-title {
      position: absolute;
      top: 0.39rem;
      left: 0.57rem;
      font-size: 0.51rem;
      color: #fff;

      &::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
        color: #61478c;
        filter: url(#stroke-text-svg-filter-5);
      }
    }

    .alert-content {
      position: absolute;
      top: 1.5rem;
      left: 0.44rem;
      right: 0.44rem;
      bottom: 1.47rem;
      border: 0.08rem solid #ccb9f9;
      background-color: #5d4888;
      border-radius: 0.3rem;
      padding: 0.3rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .alert-text {
      position: relative;
      font-size: 0.3rem;
      color: #ece5fe;

      &::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
        color: #ccb9f9;
        filter: url(#stroke-text-svg-filter-3);
      }
    }

    .alert-footer {
      position: absolute;
      width: 100%;
      top: 3.97rem;

      .alert-btn {
        position: absolute;
        top: 0;
        left: 2.5rem;
        width: 3.8rem;
        height: 1.2rem;
        font-size: 0.4rem;
        color: #2d2d2d;
        font-style: italic;
        cursor: pointer;
        background-size: 100% auto;
        background-repeat: no-repeat;
        background-image: url(data:image/png;base64,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);
        display: flex;
        justify-content: center;

        &:active {
          background-image: url(../assets/modal_btn_1.png);

          .alert-btn-text::after {
            color: #ffd467;
          }
        }
      }

      .alert-btn-text {
        position: absolute;
        top: 0.2rem;
        font-size: 0.34rem;
        color: #312d2e;
        font-style: italic;

        &::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          z-index: 0;
          color: #b196fe;
          filter: url(#stroke-text-svg-filter-3);
        }
      }
    }
  }

  .modal-achv-close {
    position: absolute;
    top: 0.3rem;
    right: -1.1rem;
    width: 2.8rem;
    height: 1.2rem;
    z-index: -1;
    cursor: pointer;
    background-size: 100% auto;
    background-repeat: no-repeat;
  }

  // book
  .book-modal-title {
    position: absolute;
    top: 0.6rem;
    left: 0.6rem;
    font-size: 0.51rem;
    color: #fff;

    &::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      z-index: 0;
      color: #61478c;
      filter: url(#stroke-text-svg-filter-5);
    }
  }

  .book-modal-body {
    position: absolute;
    top: 1.78rem;
    left: 0.44rem;
    right: 0.4rem;
    bottom: 1.47rem;
    &::after {
      content: "";
      position: absolute;
      border: 0.08rem solid #ccb9f9;
      background-color: #5d4888;
      top: 0;
      left: 0;
      right: 0.4rem;
      bottom: 0;
      border-radius: 0.3rem;
    }

    .book-modal-content {
      position: relative;
      height: 100%;
      padding: 0.3rem;
      padding-right: 0.8rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      z-index: 2;
      overflow-y: scroll;

      .book-modal-row-title-wrap {
        display: flex;
        align-items: center;
        gap: 0.1rem;
      }

      .book-modal-row {
        font-size: 0.31rem;
        color: #ece5fe;
      }

      .book-modal-title-cil {
        width: 0.28rem;
        height: 0.28rem;
        background-color: #ece5fe;
        border-radius: 50%;
      }

      .book-modal-text {
        position: relative;
        &::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          z-index: 0;
          color: #5d4888;
          filter: url(#stroke-text-svg-filter-3);
        }
      }
    }
  }

  .book-modal-footer {
    position: absolute;
    width: 100%;
    top: 7.97rem;

    .book-modal-btn {
      position: absolute;
      top: 0;
      left: 3rem;
      width: 3.8rem;
      height: 1.2rem;
      font-size: 0.4rem;
      color: #2d2d2d;
      font-style: italic;
      cursor: pointer;
      background-size: 100% auto;
      background-repeat: no-repeat;
      background-image: url(data:image/png;base64,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);
      display: flex;
      justify-content: center;

      &:active {
        background-image: url(../assets/modal_btn_1.png);

        .book-modal-btn-text::after {
          color: #ffd467;
        }
      }

      &:nth-child(2) {
        left: 7.07rem;
      }
    }
    .book-modal-btn-text {
      position: absolute;
      top: 0.2rem;
      font-size: 0.34rem;
      color: #312d2e;
      font-style: italic;

      &::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
        color: #b196fe;
        filter: url(#stroke-text-svg-filter-3);
      }
    }
  }

  .modal-head {
    position: absolute;
    top: 0.35rem;
    left: 0.55rem;
    right: 1rem;

    .modal-title {
      position: absolute;
      top: 0;
      left: 0;
      font-size: 0.5rem;
      color: #fff;

      &::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
        color: #61478c;
        filter: url(#stroke-text-svg-filter-5);
      }
    }

    .modal-subtitle-wrap {
      position: absolute;
      top: 0.67rem;
      left: 0;
    }
    .gift-box {
      position: absolute;
      top: 0;
      left: 0;
      width: 0.25rem;
      height: 0.25rem;
      background-size: 100% auto;
      background-repeat: no-repeat;
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAbCAMAAABVyG9ZAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABIUExURUdwTNjF/9bB/dW/+tbB/dXB/dDB/9fB/NbB/dbB/NbB/dTA+dbB/NbB/NbB+9bB/dXB/NbB/NXA/NfB/NbB/NbB/NbB/tbB/DCYqmsAAAAXdFJOUwAH5hjeEAP17fqYIIW+ZNQpWz1LrnYwey2HlwAAARBJREFUKM+F0leWxSAIAFALFow1iXH/Ox0sOZNX5gyfXkVEGLuD5wpQM2fvoWUJliIUqT9AiBBjeEMtj1Og9Rvn/aw4jxsVgQFraIWv8+ehOuxOmOSvGCD5fCcHtyvmAJuIknF5XVmtC2JCcMw2Y5BOqfUECpW9aM0ytM4nYxbqfMTqkm2tIVGkXdCx59u8sKYhkSEqmqmLrux49VQmnXZS5LNQQgA6AbQjPGi+oidKu8zevhDTqlA2DHtNpr0S1QB9SfT6vtId/1DRf1JVXwmph/QO/oUsG21YI/EgQ52fbUh14w/C8V+rDTbETS9CMWG0YcxGKDsMmN9/xxwc+nB8DM1zDqmsjzkcuNVE1fzCD/9OGVL6EFJSAAAAAElFTkSuQmCC);
    }
    .modal-subtitle {
      position: absolute;
      left: 0.35rem;
      top: 0;
      width: 6rem;
      font-size: 0.24rem;
      color: #d9c2fe;
      &::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
        color: #61478c;
        filter: url(#stroke-text-svg-filter-1);
      }
    }
    .modal-head-btn {
      position: absolute;
      top: 0;
      right: 0;
      width: 3.3rem;
      height: 0.96rem;
      font-size: 0.4rem;
      color: #2d2d2d;
      font-style: italic;
      cursor: pointer;
      background-size: 100% 100%;

      &[data-disabled="true"] {
        pointer-events: none;
        background-image: url(data:image/png;base64,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);
      }

      .modal-head-btn-txt {
        position: absolute;
        top: 0.2rem;
        left: 0.8rem;
      }
    }
  }

  .modal-body {
    position: absolute;
    top: 1.72rem;
    left: 0.44rem;
    right: 0.4rem;
    bottom: 0.3rem;

    .modal-body-content {
      height: 100%;
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 0.13rem;
      padding-right: 0.2rem;
      overflow-y: scroll;
      z-index: 1;
    }

    .modal-row {
      position: relative;
      flex-shrink: 0;
      height: 2.1rem;
      background-size: 100% auto;
      background-repeat: no-repeat;
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABPYAAADaCAMAAAASezw1AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA2UExURcam93xTobWb57CW4cam98am97ed6UdwTL+f8Mam97OZ5aJ9x5Juv6yN3IVdq6WF0odlunBKlxtwRe0AAAAKdFJOU/7////Ziv8A/z+1N9e1AAAXZ0lEQVR42uyd65KDKBCFrXbSm+nENe//tOtdwOYmoGS2+TNfWURB5Az0QWz+kSRJkqT/VWrkFkiSJElkT5IkSZJE9iRJkiRJZE+SJEmS/rbs/f4+Ho+fn59GkiRJkipKz0GXfh6P39+8sjdI3nDep9xfSZIk1Sl9zaR9gdLXhGme3FZJkiRVnwKVzyd7onmSJEn6Kul7/KbJ3iB6chclSZL0t4SvEdGTJEnS/0v4GkdMjxG9pyRJkiTVl47Cd0b2fh9PU/CA2k6SJEmSakttS2ho3/PnN1r29KHe84nUdX3/ekelD4uSJEmSlDO93q++H8QPNOWzD/iagKjeE9uuf42S95EkSZKkKtOgfn3XoiJ8T1uEr+FVTxU9GEVv1rx98PYZB3AfE6c/n7dyQMOYDGdROVkBfJ/Dz84n8YrKVYnxDXNt0c623DvTQ5WMh27k6J8xaO2fHJoZGG1h8LP8UaVvUD51yGeZ6DaeCe4Tun1q+3r3UxqGlK+XE1+R+Er5mXY4T3lyYa9jv+K7fzFo+9mFWEUhLkK+5WJuhKc9/RhXtO9Ad19+7xneWt6XMwOH4+9GRXpNU9F9zDcKn0f3GqfqDdPbWfSGC02XmuOHfefBrs+CvQ+PP+tY9J6suxR7eylDsTuP3mukn6FY2b3lOVnPbO3Zn6yG98GOvZV9Dcj0uW7P0LF5uwjcftbPQbhF+wbh26e6rO41TtWjbjzZFC3spvO3NKS2HZ2TCcnALUPbHY6SdvQC3C88lZL2ApvY2jBnefQTsxlaHrsjduzRvNh2PG73LwidNcpSjTYwL0XjqVa2dA13f3BUo2XR8YwHYhuMnXK0OxbHceLDlbucpeyWuzYWYR0/vz///vv5vHpy6l5jV73ncx7qTRbJ8rzDkHC6TksICAsONB+l6SjsGcB+dPhZxNEJYcuACs5Xng5CuyNxSAeEPQOPGIugHCUjw1bK+SjuGRbcMhMpiHOJp6MKesuz5lURDghm2bmfaei6MBm43ewjQgJqNyKpwIfaOxrRV7lD09rKfkSj5Vbcf6aiXk/fIwzuJ4LHVrkntGfYsdXQ15dhvWn6UfUM7HlVHO+qIQHterJ11DeM+AbhUwd8jO41dtXDbg5fdEvjwFTj5RbOjwbuyB/dEJWjCMZR2o+SmnflLe9+ivHkDpxPAWCezTh6CjEa91PgWkoG0UD9ykwGKypXWwvhxYmDr6H97NQZciG6kK1nQHOdv9lhTetsrqU4CjKFTHuEp26i4XLTDNQywKFH4VLQrde6cKny9D9qOzpXe8H5rq1HQcNNUMCC2wBxEr4hvfYI31H3GpuHO3kZr2mgNyk0TmmQVYpCCEU6g6ggsEf5DDXgVDQnQrVlj6onRCJ7NgBPhisRAtD9LFLVDythaE9U+3LrO8og+jKMAzkVyURcMyyDwm4RvnHAR1bdM2TvoYb1RtUbTknzWHItTwlEE5faORAcSMUReYQYpDhsY5BiMLDKCWVPR0vl/LVPas+SrRzQiFAV+jvwnDkGIQ+2Ck5xvvc80d107+GUvW2KO4z1Rm+4mwaR5ol5JDuicpQcCFZMuoFtPBbV9AOCHSkGr3rIM9wISP/nFoOFKudq2lJdPKbKGerp6JSlEJWBlhePOjS+Q9ub472HQ/ZU1eunqB5k1AsKQjxg2ccn+8DPL2VpGD3EKzvsvaxy9453CrTyHQ9rAf1P17rWwNQhzKx7b033jGluw01xRzejX1Rv98KiMHaGUHR+BB486gUo4UwtsnnfNM8ZGFFjJKAcJVuMBPTAiBMtsVoug1ZKLFpPpXL+ek4Z9rLzqBYY81cjF/JPs/m/QnluD0+z2f0gAtNm8L6y2/9dR+kQtYuzYdM9Vfa2F3GxmxetLA7KapjEIIQhaYhbhs0cLoIAvmzgQDQQvwjRwD0H5rwc1lhlKFrly26E88EOfISjn3ENaS/P1msdCCZCMMaLDy2u7q57yzoWfVsCVfa2KW47DPXmtTFnZwTEYbl/guRG9GXQ80Z6XTF4wqGu0P+z1CjXjUivJ4TVCFiMaXBfe0LhBg+4PdaBuzmGh5ClF5WYWn4dmgN8wzy344Z7DTPFpe5UWC+TI0B3RIVLWbv01yJ8YY5m3hrBDTHLOGM7U7CvgoUKdwT74nt4gA6Nuvcade/VPo+uRnPwM57PSfXI55jEW7tU3s/NewMvMP3ie0FgN6Fard0cZnWe/2i3+Lk3/BPPNRb5Jj93mqn2r9HP7Zdly+pwr2EHe113x6IPZO9wxUM8SFjXVWxABBWM9ihrNW42qy9r5QuWJV3xfy5+COMYiySMW4CMae6Dkb3f3c+YthyYX45Zni9YW3zB9c1EDk/M2+lc6O58jARYzBrzig90VbyKH1nM+zpDTswf20sP8xWJ4tHFb2XQDRE/OOJBnfZ3mrd/TbDo3ufTt4fhXsMM9nYP1+XDoiWD4f6E2UMXu3mBrq/dBCzt8SGL3gzo9my9aBYNed/TgfrJMAdeW2U/hrUyxv0MI9o+xt/FQHf2mp4Yurwicj2IDWFet/zu0RzuNYaNO24gP6neH/VwgUXxcMXD/UYPF77YwwVPhhzxjNnW2FyNfbjXmIYGdfNwUjxc8XDFwxUP9/s8XN3OVYd7R9lb57jjYA/EwxUPVzxc8XC/1MNVxAeoe42bUC3vavwYsrcN9qDrCFA8XPFwxcMVD/dLPVx9Fcs43OuMWa4pezRlBthckmULlhUX43ZH9CI6kOwZ5vdZTBQPVzxc8XCr8HD5bu10YA0MFZFZfAxcJGnbz3oVKg2Hv2N0bzM1DNl7rIbGFOunZVtTQBPxgGBF8GXw/uyAGI3IIuwbP/PIbBId/vJvkMdny8A7iHDeeFTKHoGIbIGDMcvmyZALIR4Dm+tkK0e0Z7gNe3yEwY50BYZ1YAhCOoezmbuaGg9N9n532SO4eGtOy0Qiz4aTGXYuQscch+raksW2QS1rkfHb1lKA/3f/1jPAYaCtf3ApScMie8ikIAG3+QqF7SqE7COs7q3i7QSxu7O0+6089kQy8ILQRTcN9zo9uNfoc9xR9pLcDD7uRycRbggQ22MXgYGQpG1FT8b9ro18WUI7WKieVZqbGN3gJbZPvcvLuczYoHQdGod7ppdryN74tZB02cOcfm6xTarRLHApqyarAjotz2oXOGCNfm6ueqL36wgX77Fc+bai1/q53fT9x3XfPU32Hs9V9gDqWAMQ3yGuGu/k+NZCyU15Cnxc497PaHiXs1J85fBs7OWiRqxnlWLSCPjaOZqllJOpYQT3Gs3RmEZ7i0k0hR1duH7fbXZXOETYPaAjgg1hz6ugwxer8MNZTsQ8CGkIZ9FbI2AxuZ5QrHI3Nm2lH4djfWt0duu9f4IXIQbBgiFCNX5HfNxhfg3uabKnhPZofRWVN24dHi4et0lmcN97VfkZ7lurIr/h6nGfVkxBiEHz9Vy0IhZBDM+AR4R4RCeCDy15k28EehEPRyEeuRqxl4PCaH0ADxmiHmwKRL4DI9uXD3kDOnBwt95OzKFfqDTZ+2Flr0IPl77Iw6W/4eGSeLji4WbzcPkCE1w1o+c8DV32QDxc8XDFwxUP9294uJvsjZ5GSdkTD1c8XPFwxcOt451cTfbgKHvN/pKGeLji4YqHKx7uX/BwF1xk7+mQPVrfett8WcAUNO0X2NxaF5INjShnIiKLjgwQj6ghhiKIh/tVHm5E0+L2tuTWygYC7s8ih8iiljepa5zs1puH4EFLD4cwVNQJwgo8fSx8WbjHy978ni+1e1l1XF91W3DdzBDclgoZL8uhA5W8Wr0gzMiGUgj7o5UT0YloHIV1fc/qgGUTtCCE3fDlUfFSAU+8iAsWDLuydpRikKyIwOGpVoZI5F8r92bI8LjzffnYP/NimKjqyKnTAcdvCXlkL2ivFyqOanjkhihP2qwX0jFhh6YC+zZFl/3q2WCuel7RtEGt/KVT3YsNnMBNqSBI9nK9k3vHZqN571o1xkZUfLNKYwOuNTZIjA0xNlbxoYtkD9uUtStXLWNBFtO7yWXLWPwjG7xIATMvzPEOHyoY5GBKg5cYEN21Z/YVCsjLTKhQ+Ud7z4umhBD70SEK9/T8iz8DEani5cn2ryQdEPSjrkXLMR+ewcgPz9CJymVAs3KuRcveoze72dz6ZW1Vs2vGDN5Fy/s6DgjH6P7QetdeZxYfr+w90R3PTIyTpmxNiM49QGNRf7+H2WoSEzD4LS4Wwft22BnM/opapQhl8cy7er5W9pg/Ad6OlhcSMKobufty2DbA6Nkc2OW2YMALtBP6J7mgOMBtBIY53ZiOqCGSy9FX8c6dB3K8tA7FFqVEYEGdzKhRN21C4GhluBIz7Udw7EbmhiJQDu0v4m7L69p9xY1VnWBbwOKRPbrfwwXxcMXDFQ/3D3u4dJmHu6B33R6Jhyserni44uH+DQ/3KtkTD1c8XPFwxcOtxMNdsA+QvQs/Mhr7BqZ4uOLhiod7g4ebLVJxsYe7oHe0B7FvyDkQlaNg4ImtCSEr2r/5qHyED+I+2Bf/VcEr0LFZpQ19XzI8WZ58J0MGIT/e3LSQCfmnmd+oFEIwYCPhwL1FwYr5dMhvaTzXL/3Ob7VFIapIG24fFE9FjERUNqfkN5zcEYyhTjpyI6RCX5KubOfxk59IB/rGj4SfaVrlsbQ/oYGY5WE1NlUFL0JZbNflH1aMU6eId3LPbiuaIVaA3PT+tkBIvik9uxVt2F6iGUzcu+pJxWp0g+V5usrRtk6Ndm16sK9AtD7LWxpJ2/mxJm6gtQt57hol3Z+Smo7FNhosKe/FFisV3mE0YSftDE1LeNVmc0XrGd0/v/qd3BpGe8cdWCof7WHto738Y6M71iPeMdpDGe398dHeM+npqOtTOidje5ApoMdgztge1IdpsT38mtjeqTAf/1jeGNvTAnpYg1ldLGQTMMm1uz+ZEOv1PfHbChxUI9yt0yRMKQ9/3vM1+q+9u1FLlAvDKFwwmaGonf/JfqKAgPwq9sH2XjVd71RjSrDm2fuFzewvbo6n1l9u/rgB3Hv4RX/5fB54lvOWw4Pc5OmJ3vXmPD1cPdz37uEGl/Pybf2iqzT0cPVw9XDN6i1uVm/CVRp6uHq4erh6uCH0cKOXXpOrh6uHq4cr7a057eXXdOQbpbMsfs3F2dD1cjNruRks9XD1cPVwX9/DHb486qmDPc6bHo0y2YxSUoeoLnN7uxGd3OS2yPGDZdRZjlxSuVZGt7VXJ5XR9LKn9zW6XEwn97nFdmd8PpvWcpY29RyLCt+Xc/6WN0/+Ep/fhevlZuqOPemy95bDunV15ai7TGYuR56u/Mf30virjnDbyhXz3QckWm4ZtS5e8/g6LMt6neNXoWmuwxIteMWV8euwjFjLZOQ6LNFg+fjqLNWnNlj+9b00No91MypL7TVLq+69fNW9eMZVhhe/6t5mKTNfm5l+4cvZb5/rfMzeBNkkM3UmR1yctt08ecPISU3cqVttpAHjtTVxZ1tu+a8O/M3kDfHHayxPXXDYGstLWmM5nrefO+Ga3MFt+bLbaLQfEA8sUPsHnb557qowwwmd08vNLQ7OccuIJZ7ZOjn2/tVtNGb41b64Vd9dPvD/+YO33JjtjhqjbhhZTIwUC+cVq/VdXn5OWzn4DSPK5PZgM5XRXZnUy6S1HPyGZhm1lcmYMqmX0RNlNO57k+4yai+joW/oK6Np5ZMbIpm9HPM6h3+1nfvXrYxay6SnjJrlqF04aZRxSzn+UB1XxreDsq9Mniuj676a3z+tmKkedcPIqNLOLe/OFmcPm2ZvafmxtbzWjTJtlNdHKr4hvn1prrL4+UV1e+7Xn1Yti39RK9PWz3aUaf6TGmX5Mmtl8fhl3fbWXpZv/1s58Nb9tMe/tr95ybc9sKXseWrdDxxX/2Htgaq7e+WbWna1obLYr+NyH2+Wtd3yfmdNb5+tPLNmWT8o28vHj8+4Sx1Pl9efE5f/UZcmS6dfk5tJL71wTI8AsGQufk7iSffSSJpXdySZ9M4PtsvebhwnlF2fbuM4Zzn404B3YtLBs3vNofqqo/14/ctZU1f1XeQ3+Zrcq/YusfbIHgBWpPc89U24JvfWD0k5D8BK5Xf2XjbLF4+6YWRStDFS0gOw3sx3EV8y4oaR+f1ts4ZwTXr73R4Als3ZVBXzZeKbcMPItCq9y8MdTgcAWDZX+VXEFydjr8mtjm/PD1Ia7zN763sv/jz8XnmARvm69+6/tHz2tU/Fu/c59+a746r7+Hrg8B36wpxSGOWMmvvKKb7BQW6x9nwpvSzmXXUHACvgIr5TKb5z4BupvVJ6l5xnQwJYm/tu4tvth+6TG0WF9a7SswEBrFt8gyewlB3cTHq2HYD1mu/qvf1p6HTlfF7vMqdnuwFYeeLLxq2nXZ/2MuuJegDCCXzZ6XcD2iuing0GIIjAdzhrL+7THusBCEx8h0Ov9rKwx3oAwlJfn/ailPUABMbvYd+jveziNdYDEJL0fn8/h7THegDC8t7nPu3RHusBCC7t/Z46tbfdprsT6wEITXt9aS/dsx6AN0p7H5sj7QGgPQBYufd65vai48kmAvBOaY/2ALyX9rbJjvYAvFXaoz0AIWpvL+0BkPakPQABe8/cHgBpT9oD8J7ak/YASHsAsH7t6eQCkPakPQAhe8/cHgBpT9oD8J7ak/YASHsAsH7t6eQCkPakPQAhe8/cHgBpT9oD8J7ak/YASHsAsH7t6eQCkPakPQAhe8/cHgBpT9oD8J7ak/YASHsAsH7t6eQCkPakPQAhe8/cHgBpT9oD8J7ak/YASHsAsH7t6eQCkPakPQAhe8/cHgBpT9oD8J7ak/YASHsAsH7t6eQCkPakPQAhe8/cHgBpT9oD8J7ak/YASHsAsH7t6eQCkPakPQAhe8/cHgBpT9oD8J7ak/YASHsAsH7t6eQCkPakPQAhe8/cHgBpT9oD8J7ak/YASHsAsH7t6eQCkPakPQAhe8/cHgCD3CLtRbQH4L20lxxpD0CA2ou7097xdLCRALyD9v7lk3vHPe0BCE17n7ukW3sp7QEIUHubD9oD8EbaOxy399r7yrUX72gPQGjaO+Xa+/pu0V6klQsgNO195uevNLR3/dzHRk8DQHDayzsade39mNwDEKr2DsdrR2P706q92HUaAAILe/kVuUVHo9BePrlnlAsgNO995icrf/z7rmqv6GkY5QIILewVY9xiaq/QXjnKTXauTwMQEkUf91+H9sQ9AGENcQ+76KM2tVdo7zbK1dQAEJD1yrBXTu2V2hP3AITIoThpb/vV1N53qT2zewBCDHs/d9orRrniHoBwOB3zmb2yj1vR3m2UGzl3D0AoQ9z4LuzdtFeJe7FhLoAgrFcOcSthr6K9Mu6dh7m6uQACYH+M7sNeRXuVuLcxvQdg/ZyKLm4t7FW1V4l7pvcArH6Eeyon9mphr6q9759t6b2E9wCs3XrlxF4t7NW1Vw5zeQ9AQNarhb2a9irD3Kv3iA9AcNara6/hPeexAFin9A7727xeY4jb1N6tm3vp5+4MdAGsMertj93Wa2rvp+49A10Aa4x6aXSzXmOIe6e96jD3OtAlPgCrkl4W9TY91rvTXsN758C3OxEfgPVIrxb1Wqx3r7269z62UXpJfMwHYPHOu0gv2fZbr0V7Te9dxXfKzMd9AJZpvNx5xzSpjG/brdemvYb3zuLbxJn59qfMfQCwOE6nfea8OKomvQ7rtWqv6b3cfGf17c7yu3LywQcffFjCh4zd7pg5rxb0Oq3Xrr3v76978Z1Hu0mcnu139t/lz1GlUqkWUMVxnJyVt21I7+Or3Xpd2rsPfJn6LvIDgOVxJ6x/Xx1269Te98/X/cMAwEroGOD2aq9loAsAK5HeV7f1+rR3DnzEByAw6fVrj/gABCe9Ie1dxMd8AMKR3rD2zuJjPgDrUN7ZeYPSG6O9wnzUB2DJyhvnvLHay9WXuc9ZLQAWaLyxypukPQAIA9oDQHsAQHsAQHsAQHsAsAL+A7JUjS5o+ij+AAAAAElFTkSuQmCC);
    }

    .modal-row-title {
      position: absolute;
      top: 0.3rem;
      left: 0.37rem;
      font-size: 0.32rem;
      color: #fff;

      &::after {
        color: #7764ae;
      }
    }

    .modal-gift-block {
      position: absolute;
      top: 0.95rem;
      left: 0.3rem;
      width: 2.9rem;
      height: 3.6rem;
      background-size: 100% auto;
      background-repeat: no-repeat;
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASMAAABXBAMAAAC9yj59AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAtUExURUdwTIZipoVipYZipoZjpkAnWIZjpjoiUT0kVDsjUn1cnUguYTcgTmZHgjkhUDiMgIwAAAAFdFJOUwD1LH7H9jhcywAABIBJREFUaN7Vm01PGkEYxwl+ga4aztT2AyD2A6iYfoNNx6BNNhoOa/bYLEbCbeMaIzeiiU1v5SDhuClK8GaIkXiDphCODZKS/QydefaV3QUkaWamc3qijP73N888Oy9/YrFAi69t7GwJlNpOJr0Wm9fWNraERC6Ro9ISkiBk0smZguJYkERJDzRJymFRsxR9EKQc7ZaQVtMzFCVyTNpUTcwU4fGboslVVLmh1SoVh1MqStE7W9HNoN8wRFFskBYZZKcHi/Ya9GxRKxHzbmkLfiUPGvjPFExz/KLj9u05ImjnSTA2I4LFeulYcLNnacqEE2kdfqH0RYQ/iFRVPcbSRHQZFeQhUKOCRXvpYnYAoIRQOr2HYasZ35410uEUdyiT4CwycD8TDhbupWtN0LQaGLo4DJtiFEz1ynkG1Xk8dRFM4V7qnF5nL6BJ2A5Agjzqw/+ljUn8+vsujCn+kfysj0A6dUxofAI5vh2CVKtb0uljOh3vV4KYSCbJhmZLp4+p+EiGTvJhWiLTrWo60llgOiGYVjxJpCYp96YrnT4m1WySSZeaSO6q6UlngKn4p+sfOfJ2k2+HPukMMI1INh0kfeNWRX7pTDDhbJJS3rjJHW1COgNMjz1v5Mh8U+qT0pnUJm/OkTpZ1QLSGdSmJzxyQtJJJbkTlM4AE4xcykklZTcknT6mwr7zniOpVB1q7DGVyJxbcVKp08pzgOkBV8vDpJ1KP4YqB5gu7+xkIpL2oqTTx7RvSYLs/hQlnTomdGHld5xkd7R06pjOcX4vWxOur51xgUnrwpTDywBcKDnBhCUdQA2QjSnSqWO6gyrwFkuqi3xgQqQKJEkNUJDIBya7ChBJ06VTxtQESXi/VNNFTjARSpsxXCmPjnnBlK3YkqpmmRNMWFLuTYwUb5MXTLh8S5aklsoJpmuH0veWygmmJ3fgWionmB68XFI5wWRRIjPuVOUDE+x4QdLRnAemhqlI0nuTVG9lzgNTw1S6hlKJ33E1kRNMuxfuaxdxgsleCVjrJT4wkfWSkPSvKtljslaV5AiuI/KBCXXhIM7aofCByd6hwD5O5AMTWS4t27vd+Q9MA5PunOasW8eCHGA6Joe69jFFrs4FpqFzcgLnSxoPmNzzJTiFu+IAU9E9hYP8/iyyx+SdVUIy/fzCHpN7CGcdw1Uf2WM698694XZgr8waE2p6twNwh/KLOSa957vehZsmkzWmrO+mybqPux+xxaRN3MfBrWWfLSbYCfiu5a27XaaYAne7zg04Q0zmSXfyBhwcJ/Itw0k3CvoEbDfFXp4VJgRuisNk0HMi9y8ZLQhQtheE5DhzOmwWBJaiSUiOf6lmIPqYisMs+JcCkByXl9JAtDcr5nM52uXleeEMpKHi6zD9A7cc0ke2Fy7CWul3DJba7bZl9MMB+PsK/uDKCeAzpVAQ3Ssf0ctzDEqZ6b5KecJXKdo2SCMycD8TDl7Za9C7me6r9Plh6blP5dnuU5Ye3cP0f+NkBr83CxvzanqOK562oNmuePe7A9Ta/O8OcPENi78ECmZ6+p4QgwAAAABJRU5ErkJggg==);

      .modal-gift {
        position: absolute;
        top: 0.1rem;
        width: 0.6rem;
        height: 0.65rem;
        font-size: 0.3rem;
        background-size: 100% auto;
        background-repeat: no-repeat;

        &:nth-child(1) {
          left: 0.45rem;
          background-image: url(data:image/png;base64,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);
          .modal-gift-num {
            left: 0.2rem;
          }
        }
        &:nth-child(2) {
          left: 1.15rem;
          background-image: url(data:image/png;base64,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);
          .modal-gift-num {
            left: 0.35rem;
          }
        }
        &:nth-child(3) {
          left: 1.85rem;
          background-image: url(data:image/png;base64,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);
          .modal-gift-num {
            left: 0.1rem;
          }
        }

        .modal-gift-num {
          position: absolute;
          top: 0.36rem;
          font-size: 0.2rem;
          color: #fff;

          &::after {
            color: #040408;
          }
        }
      }
    }

    .modal-row-num-wrap {
      position: absolute;
      top: 1.2rem;
      right: 3.84rem;
      font-size: 0.32rem;
      color: #f6e4ff;
    }

    .modal-row-btn {
      position: absolute;
      top: 0.96rem;
      right: 0.28rem;
      width: 3.25rem;
      height: 0.85rem;
      background-size: 100% 100%;

      &[data-disabled="true"] {
        pointer-events: none;
        background-image: url(data:image/png;base64,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);
      }
    }
  }
  .warn-icon {
    position: absolute;
    top: -0.1rem;
    right: 0.1rem;
    width: 0.4rem;
    height: 0.4rem;
    background-size: 100% auto;
    background-repeat: no-repeat;
    background-image: url(../assets/ic_warn.png);
  }

  .modal-scrollbar-track {
    position: absolute;
    top: 0.22rem;
    bottom: 0.22rem;
    right: -0.07rem;
    width: 0.29rem;
    border: 0.05rem solid #a89bcf;
    border-radius: 999rem;
    background-color: #7366ac;
  }
}
</style>
