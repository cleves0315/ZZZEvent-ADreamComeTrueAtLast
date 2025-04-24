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
import {
  botChatAvatarBase64,
  icSreStar64,
  icTopHLignt64,
  lingChatAvatarBase64,
  purpleStripeBg64,
  qqBlockBtmt64,
  zheChatAvatarBase64,
  zyChatAvatarBase64,
} from "../contants"
import ShareModal from "./ShareModal.vue"
import GuideMask, { GuidePosition } from "./GuideMask.vue"

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

const [visShare, { toggle: toggleShare }] = useBoolean()

const [visGuide, { toggle: toggleGuide, setValue: setGuide }] = useBoolean()

const guidePos = ref<GuidePosition>("reply")

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

const achvedCount = computed(() => {
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

const renderAvatar = (user: string) => {
  switch (user) {
    case "zhuyuan":
      return zyChatAvatarBase64

    case "ling":
      return lingChatAvatarBase64

    case "bot":
      return botChatAvatarBase64

    case "zhe":
      return zheChatAvatarBase64

    default:
      return ""
  }
}

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
              playMsgSound()
              curChatList.value.push(newChat)
            }

            if (i === chatFirstIndex - 1) {
              setTimeout(() => {
                toggleGuide()
                initing.value = false
              }, 500)
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

  requestAnimationFrame(() => {
    if (fisdGameCount.value === 1 && achvedCount.value === 0) {
      toggleGuide()
      guidePos.value = "award"
    }
  })
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
    setGuide(false)
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

const handleClickTask = () => {
  setGuide(false)
  toggleAchv()
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

  <div class="home-view" :style="initing ? { pointerEvents: 'none' } : undefined">
    <div class="circle-wrap" :style="{ backgroundImage: `url(${icTopHLignt64})` }">
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
                <div
                  class="chat-avatar"
                  :style="{ backgroundImage: `url(${renderAvatar(item.user)})` }"
                ></div>
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
          <div
            class="reply-item"
            v-for="(item, idx) in curReplys"
            :key="idx"
            @click.stop="handleReplay(item, idx)"
            :style="{
              '--active-bg1': `url(${store.assetList['reply_1']})`,
              '--active-bg2': `url(${store.assetList['reply_2']})`,
            }"
          >
            <span class="reply-item-txt" :data-text="item">{{ item }}</span>
          </div>
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
              <div
                v-if="curChatMarked.game.finished"
                class="best-score-wrap"
                :style="{ backgroundImage: `url(${purpleStripeBg64})` }"
              >
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
            <div class="mask-btn-2 dc-button-bg" @click="toReview">
              <span class="mask-btn-icon-1"></span>
              <span class="mask-btn-txt" data-text="剧情回顾">剧情回顾</span>
            </div>
            <div class="mask-btn-2 dc-button-bg" @click="toPlay">
              <span class="mask-btn-icon-2"></span>
              <span class="mask-btn-txt">开始游戏</span>
            </div>
          </div>
        </div>
      </div>
    </DynamicBg>
    <div class="qq-block-bottom" :style="{ backgroundImage: `url(${qqBlockBtmt64})` }"></div>

    <div class="operate-wrap" :style="{ '--ic-star': `url(${icSreStar64})` }">
      <div
        class="operate-item operate-mute"
        :data-state="isMute ? 'mute' : 'open'"
        @click="handleChangeMuteState"
      ></div>
      <div class="operate-item" @click="handleBook"></div>
      <div class="operate-item" @click="toggleShare"></div>
    </div>

    <DynamicBg class="task-btn" name="task_btn" @click="handleClickTask"></DynamicBg>
    <DynamicBg name="blk_di_3" class="right-bottom"></DynamicBg>

    <div class="mask-wrap home-view-mask">
      <div class="mask"></div>
      <div class="btn-shadow"></div>
    </div>

    <ViewModal :visible="visAlert">
      <DynamicBg class="home-modal-wrap modal-alert" name="alert_bg_1">
        <div class="alert-title" data-text="关卡解锁条件">关卡解锁条件</div>
        <div class="alert-content">
          <div class="alert-text">1、完成前置关卡</div>
          <div class="alert-text">2、敬请期待</div>
        </div>
        <div class="alert-footer">
          <div class="alert-btn dc-button-bg" @click.once="toggleAlert">
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
          <div class="book-modal-btn dc-button-bg">
            <span class="book-modal-btn-text" data-text="查看协议">查看协议</span>
          </div>
          <div class="book-modal-btn dc-button-bg" @click.once="toggleBook">
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
            :data-disabled="fisdGameCount > achvedCount && fisdGameCount <= 1 ? false : true"
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
              :style="achvedCount >= item ? { display: 'none' } : {}"
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
          <div class="alert-btn dc-button-bg" @click.once="toggleGiftAlert">
            <span class="alert-btn-text" data-text="确认">确认</span>
          </div>
        </div>
      </DynamicBg>
    </ViewModal>

    <ShareModal :visible="visShare" @click-by-mask="toggleShare" />

    <GuideMask :visible="visGuide" :position="guidePos" />
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
}
.circle-wrap {
  position: absolute;
  top: -0.03rem;
  left: 3.27rem;
  width: 1.84rem;
  height: 2.13rem;
  z-index: 3;
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
    background-image: url(data:image/png;base64,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);
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
      background-image: var(--ic-star);
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
    background-image: var(--active-bg2);

    &:active {
      background-image: var(--active-bg1);

      .reply-item-txt::after {
        color: #ffd265;
      }
    }

    &:nth-child(1) {
      top: 0.15rem;
    }

    &:nth-child(2) {
      top: 1rem;
    }

    .reply-item-txt {
      position: relative;
      &::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
        color: #decfff;
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
      background-image: var(--best-row-bg-purple);
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
  position: absolute;
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

  .btn-shadow {
    position: absolute;
    width: 6.6rem;
    height: 1rem;
    top: 8.15rem;
    left: 8.76rem;
    box-shadow: 0 0 0.2rem 0.1rem rgba(255, 255, 255, 0.8);
    border-radius: 0.43rem;
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
        background-image: var(--btn-dark-bg);
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
        background-image: var(--btn-dark-bg);
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
