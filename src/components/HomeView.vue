<script setup lang="ts">
import { useRouter } from "vue-router"
import { formatNumber, slideEnter } from "../utils"
import throttle from "lodash/throttle"
import { computed, onMounted, ref } from "vue"
import { Howl } from "howler"
import msgAnswer from "/audio/message_answer.mp3"
import bgmHome from "/audio/bgm_home.mp3"
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
import { useModal } from "../hooks/useModal"
import { ChatMarkAction, useChatMarked } from "../hooks/useChatMark"
import { CinemaUserEnum } from "../router"

const dialogList = ref([
  { isLock: false, user: "zhuyuan", name: "朱鸢", avatar: "zhuyuan_task.png" },
  { isLock: true, user: "bot", name: "朱鸢", avatar: "zhuyuan_task.png" },
  { isLock: true, user: "bot", name: "朱鸢", avatar: "zhuyuan_task.png" },
  { isLock: true, user: "bot", name: "朱鸢", avatar: "zhuyuan_task.png" },
  { isLock: true, user: "bot", name: "朱鸢", avatar: "zhuyuan_task.png" },
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

const { isMute, toggleMute } = useMusicMute()

const { toggleModal } = useModal()

const currentModal = ref<"book" | "achv">()

const { chatsMarked, markChatEnd } = useChatMarked()

const { bgmSound } = useBgm(bgmHome)

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
            curChatList.value.push(chats[i])
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
    src: [msgAnswer],
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

const handleNextChat = throttle(
  () => {
    if (initing.value) return
    if (curChatList.value.length >= chats.length) return
    if (showReply.value) return

    const newChat = chats[curChatList.value.length]
    if (newChat.reply?.length) {
      curReplys.value = newChat.reply as string[]

      toggleReply()

      const h = document.querySelector(".chat-list-inner")?.scrollHeight || 0
      const h2 = document.querySelector(".chat-operate-bg")?.clientHeight || 0
      gsap.set(".chat-list-inner", { minHeight: h + h2 + "px" })
      chatListScrollToBottom()

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
  router.push("/play")
}

const handleBook = async () => {
  currentModal.value = "book"
  toggleModal()
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
    <div class="qq-block">
      <div class="dialog-list">
        <div
          class="dialog-item"
          :class="item.isLock ? 'lock' : 'unlock'"
          v-for="(item, i) in dialogList"
          :key="i"
        >
          <div
            class="dialog-avatar"
            :style="item.isLock ? {} : { backgroundImage: `url(/src/assets/${item.avatar})` }"
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
        <div class="chat-frame"></div>
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
                  :style="{ backgroundImage: `url(/src/assets/${item.avatar})` }"
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
    </div>
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

    <div
      class="task-btn"
      @click="
        () => {
          toggleModal()
          currentModal = 'achv'
        }
      "
    ></div>
    <div class="right-bottom"></div>

    <div class="mask-wrap home-view-mask">
      <div class="mask"></div>
    </div>

    <ViewModal>
      <!-- Book -->
      <div v-if="currentModal === 'book'" class="home-modal-wrap book-modal">
        <div class="book-modal-title" data-text="活动说明">活动说明</div>
        <div class="book-modal-content">
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
        <div class="book-modal-footer">
          <div class="book-modal-btn">
            <span class="book-modal-btn-text" data-text="查看协议">查看协议</span>
          </div>
          <div class="book-modal-btn" @click="toggleModal">
            <span class="book-modal-btn-text" data-text="确认">确认</span>
          </div>
        </div>
      </div>
      <!-- Achievement -->
      <div v-else class="home-modal-wrap home-modal-achv">
        <div class="modal-achv-close" @click="toggleModal"></div>
        <div class="modal-head">
          <div class="modal-title" data-text="成就列表">成就列表</div>
          <div class="modal-subtitle-wrap">
            <div class="gift-box"></div>
            <div class="modal-subtitle" data-text="活动奖励将于15分钟内通过游戏内邮箱发放">
              活动奖励将于15分钟内通过游戏内邮箱发放
            </div>
          </div>
          <div class="modal-head-btn">
            <div class="modal-head-btn-txt">全部领取</div>
          </div>
        </div>
      </div>
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
  background-image: url(../assets/share_wrap_1.png);
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
    background-image: url(../assets/back_1.png);
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
  background-image: url(../assets/qq_block.png);
}
.qq-block-bottom {
  position: absolute;
  bottom: 0;
  left: 2.1rem;
  width: 8rem;
  height: 1.22rem;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url(../assets/qq_block_bottom.png);
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
    background-image: url(../assets/unlock.png);

    &.lock {
      background-image: url(../assets/lock.png);
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
  background-image: url(../assets/task_btn.png);
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
      background-image: url(/src/assets/share_1.png);
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
  background-image: url(../assets/blk_di_3.png);
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
    background-image: url(../assets/chat_block.png);
    // &::after {
    //   content: "";
    //   position: absolute;
    //   top: 0;
    //   left: 0;
    //   width: 100%;
    //   height: 100%;
    //   background-size: 100% 100%;
    //   background-repeat: no-repeat;
    //   // background-image: url("../assets/block_light.png");
    // }
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
        background-image: url(../assets/chat_tail.svg);
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
        background-image: url(../assets/chat_tail_right.svg);
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
      background-image: url(../assets/reply_1.png);
      .reply-item-txt::after {
        color: #ffd265;
      }
    }

    &:nth-child(2) {
      top: 1rem;
      background-image: url(../assets/reply_2.png);
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
    background-image: url(../assets/chat_tips_frame.png);
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
    background-image: url(../assets/row_bg_1.png);
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
      background-image: url(../assets/modal_row_bg_2.png);
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
    background-image: url(../assets/btn_bg_yellow.png);

    &::after,
    &::before {
      content: "";
      position: absolute;
      top: 0.23rem;
      width: 0.45rem;
      height: 0.45rem;
      background-size: 100% auto;
      background-repeat: no-repeat;
      background-image: url(../assets/btn_ip_2.png);
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
    background-image: url(../assets/modal_btn_2.png);

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
      background-image: url(../assets/btn_ir_1.png);
    }
    .mask-btn-icon-2 {
      background-image: url(../assets/btn_ip_1.png);
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
  background-color: rgba(0, 0, 0, 0.7);

  .mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: transparent;
  }
}

.home-modal-wrap {
  position: relative;
  width: 13.8rem;
  height: 9.2rem;
  background-size: 100% 100%;
  background-repeat: no-repeat;

  &.book-modal {
    background-image: url(../assets/modal_bg_3.png);
  }
  &.home-modal-achv {
    background-image: url(../assets/modal_bg_2.png);
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
    background-image: url("../assets/btn_close.png");
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

  .book-modal-content {
    position: absolute;
    top: 1.78rem;
    left: 0.44rem;
    right: 0.44rem;
    bottom: 1.47rem;
    border: 0.08rem solid #ccb9f9;
    background-color: #5d4888;
    border-radius: 0.3rem;
    padding: 0.3rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    overflow: scroll;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }

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
      background-image: url(../assets/modal_btn_2.png);
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
      top: 0.7rem;
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
      background-image: url(../assets/box.png);
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
      background-size: 100% auto;
      background-repeat: no-repeat;
      background-image: url(../assets/btn_bg_black.png);

      .modal-head-btn-txt {
        position: absolute;
        top: 0.2rem;
        left: 0.8rem;
      }
    }
  }
}
</style>
