<script setup lang="ts">
import { useRouter } from "vue-router"
import zhuyuan from "../assets/zhuyuan_task.png"
import { slideEnter } from "../utils"
import throttle from "lodash/throttle"
import { onMounted, ref } from "vue"
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
import { getStorage, setStorage, StorageKey } from "../utils/storage"

const readyStyle = {
  item: { backgroundColor: "#FE9ACB", borderColor: "#FADC6B" },
  avatar: {
    border: "0.04rem solid #913C74",
    backgroundColor: "#FD9BCB",
  },
  name: { color: "#913C74" },
  time: { backgroundColor: "#FF6EC1" },
  timeTag: { backgroundColor: "#fff" },
  timeTxt: { color: "#fff" },
}

const isBgmMute = ref(getStorage(StorageKey.MUSIC_MUTED) ?? false)
const bgmState = ref("none")
const showScreenMask = ref(false)

const router = useRouter()

const curReplys = ref<string[]>([])

const chatList = ref(chats.slice(0, 0))

const chatListRef = ref<HTMLDivElement>()

const bgmSound = ref()
const msgSound = ref()

const smartSwitchBgm = (action: "pause" | "play") => {
  if (!bgmSound.value) return
  if (isBgmMute.value) return
  if (bgmSound.value.state() === "stopped") return

  if (action === "pause" && bgmState.value === "playing") {
    bgmSound.value.pause()
  }
  if (action === "play" && bgmState.value === "paused") {
    bgmSound.value.play()
  }
}

document.addEventListener(
  "visibilitychange",
  throttle(() => {
    if (document.visibilityState === "hidden") {
      smartSwitchBgm("pause")
    } else {
      smartSwitchBgm("play")
    }
  }, 1000),
)
window.addEventListener(
  "focus",
  throttle(function () {
    smartSwitchBgm("play")
  }, 500),
)
window.addEventListener(
  "blur",
  throttle(function () {
    smartSwitchBgm("pause")
  }, 500),
)

const initChatList = () => {
  const timer = 400
  for (let i = 0; i <= chatFirstIndex; i++) {
    setTimeout(
      () => {
        chatList.value.push(chats[i])
      },
      timer * i + 1,
    )
  }
}

onMounted(() => {
  bgmSound.value = new Howl({
    src: [bgmHome],
    autoplay: isBgmMute.value ? false : true,
    loop: true,
    volume: 1.0,
    onplay: () => {
      bgmState.value = "playing"
    },
    onpause: () => {
      bgmState.value = "paused"
    },
    onstop: () => {
      bgmState.value = "stopped"
    },
  })
  msgSound.value = new Howl({
    src: [msgAnswer],
    volume: 1.0,
  })
  setTimeout(() => {
    initChatList()
  }, 2000)
})

const handleChangeBgm = () => {
  isBgmMute.value = !isBgmMute.value
  setStorage(StorageKey.MUSIC_MUTED, isBgmMute.value)

  if (isBgmMute.value) {
    bgmSound.value.pause()
  } else {
    bgmSound.value.play()
  }
}
const stopBgm = () => {
  bgmSound.value.stop()
}

const playMsgSound = () => {
  if (isBgmMute.value) return
  msgSound.value.play()
}

const handleBack = async () => {
  stopBgm()
  await slideEnter()
  router.back()
}

const chatListScrollToBottom = () => {
  setTimeout(() => {
    if (chatListRef.value) {
      chatListRef.value.scrollTo({
        top: chatListRef.value.scrollHeight,
        behavior: "smooth",
      })
    }
  })
}

const handleNextChat = throttle(
  () => {
    if (chatList.value.length >= chats.length) return
    if (curReplys.value.length) return

    const newChat = chats[chatList.value.length]
    if (newChat.reply?.length) {
      curReplys.value = newChat.reply as string[]

      chatListScrollToBottom()
      gsap.set(".chat-list", { overflow: "hidden" })
      gsap.to(".chat-operate", { duration: 0.3, opacity: "1", zIndex: 5 })
      return
    }

    chatList.value.push(newChat)
    if (chatListRef.value) {
      chatListScrollToBottom()
      playMsgSound()
    }
    // end
    if (chatList.value.length >= chats.length) {
      setTimeout(() => {
        showScreenMask.value = true
      }, 1500)
    }
  },
  500,
  { trailing: false },
)

const handleReplay = throttle(
  async (msg: string) => {
    playMsgSound()
    const newChat = chats[chatList.value.length]
    chatList.value.push({ ...newChat, content: msg })
    gsap.to(".chat-operate", { duration: 0.3, opacity: "0", zIndex: "-1" }).then(() => {
      curReplys.value = []
    })

    chatListScrollToBottom()

    gsap.set(".chat-list", { overflow: "scroll" })
  },
  500,
  { trailing: false },
)

const toPlay = async () => {
  showScreenMask.value = false
  await slideEnter()
  router.push("/play")
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
      <filter id="stroke-text-svg-filter-3">
        <feMorphology operator="dilate" radius="1.4359375"></feMorphology>
        <feComposite operator="xor" in="SourceGraphic"></feComposite>
      </filter>
    </defs>
  </svg>

  <div class="circle-wrap">
    <div class="back-btn" @click="handleBack"></div>
  </div>
  <div class="qq-block">
    <div class="dialog-list">
      <div class="dialog-item" :style="readyStyle.item">
        <div
          class="dialog-avatar"
          :style="{ ...readyStyle.avatar, backgroundImage: `url(${zhuyuan})` }"
        ></div>
        <div class="dialog-content">
          <div class="dialog-name" :style="readyStyle.name">朱鸢</div>
          <div class="dialog-time" :style="readyStyle.time">
            <div class="dialog-time-tag" :style="readyStyle.timeTag"></div>
            <div class="dialog-time-txt" :style="readyStyle.timeTxt">11小时后</div>
          </div>
        </div>
      </div>
      <div class="dialog-item item-await" v-for="i in 4" :key="i">
        <div class="dialog-avatar">?</div>
        <div class="dialog-content">
          <div class="dialog-name">???</div>
          <div class="dialog-time">
            <div class="dialog-time-tag"></div>
            <div class="dialog-time-txt">11小时后</div>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-block">
      <div class="chat-frame">
        <div class="chat-title" :data-text="roomName">{{ roomName }}</div>
      </div>
      <div class="chat-bg"></div>
      <div class="chat-list" ref="chatListRef" @click="handleNextChat">
        <div class="chat-tips">{{ toptips }}</div>
        <div class="chat-list-inner">
          <div
            class="chat-item"
            :class="item.isRight && 'chat-item-right'"
            v-for="(item, idx) in chatList"
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
                {{ item.content }}
              </div>
            </div>
          </div>
        </div>
        <div class="chat-operate">
          <div
            class="reply-item"
            v-for="(item, idx) in curReplys"
            :key="idx"
            @click.stop="handleReplay(item)"
          >
            <span class="reply-item-txt" :data-text="item">{{ item }}</span>
          </div>
        </div>
      </div>
      <transition name="home-mask-fade">
        <div class="chat-tips-mask" v-show="showScreenMask">
          <div class="chat-tips-wrap">
            <div class="chat-tips-white-mask"></div>
            <div class="chat-friendly-tips">
              <div class="chat-friendly-tips-title" data-text="友情支援">友情支援</div>
              <div
                class="chat-friendly-tips-cont"
                data-text="每合成5次，获得1位1~9随机「电费加倍」倍率"
              >
                每合成5次，获得1位1~9随机「电费加倍」倍率
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
  <div class="qq-block-bottom"></div>
  <div class="operate-wrap">
    <div
      class="operate-item operate-mute"
      :data-state="isBgmMute ? 'mute' : 'open'"
      @click="handleChangeBgm"
    ></div>
    <div class="operate-item"></div>
    <div class="operate-item"></div>
  </div>
  <div class="task-btn"></div>
  <div class="right-bottom"></div>
  <transition name="home-mask-fade">
    <div class="mask-wrap" v-show="showScreenMask">
      <div class="mask"></div>
      <div class="mask-btn" @click="toPlay">开始游戏</div>
    </div>
  </transition>
</template>

<style scoped lang="scss">
.circle-wrap {
  position: absolute;
  top: -0.02rem;
  left: 3.2rem;
  width: 1.84rem;
  height: 2.13rem;
  z-index: 3;
  background-image: url(../assets/share_wrap_1.png);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  .back-btn {
    position: absolute;
    left: 0.5rem;
    bottom: 0.5rem;
    width: 1rem;
    height: 1rem;
    cursor: pointer;
    background-repeat: no-repeat;
    // background-color: red;
    border-radius: 50%;
    background-size: 100% 100%;
    background-size: url(../assets/download.png);
  }
}
.qq-block {
  width: 15rem;
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
    background-size: 100% 100%;
    background-repeat: no-repeat;
    // background-image: url(../assets/zhuyuan_task.png);
  }

  .dialog-name {
    color: #fff;
    font-size: 0.38rem;
  }
  .dialog-time {
    background-color: #9874db;
    border-radius: 999rem;
    color: #141215;
    font-size: 0.22rem;
    padding: 0.14rem 0.15rem;
    width: 1.6rem;
    display: flex;
    align-items: center;
    gap: 0.08rem;
  }
  .dialog-time-tag {
    width: 0.14rem;
    height: 0.14rem;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    // background-image: url(../assets/share_wrap_1.png);
    background-color: red;
  }
  .dialog-time-txt {
    height: 0.18rem;
    line-height: 0.18rem;
  }
}
.task-btn {
  width: 5rem;
  height: 4rem;
  position: absolute;
  bottom: 0.5rem;
  right: 2.8rem;
  cursor: pointer;
  background-size: 100% auto;
  background-repeat: no-repeat;
  background-image: url(../assets/task_btn.png);
}
.operate-wrap {
  position: absolute;
  top: 0.45rem;
  right: 3.3rem;
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
    &::after {
      content: attr(data-text);
      position: absolute;
      left: 0;
      color: #503e82;
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
  bottom: 0.33rem;
  z-index: 1;
  overflow: scroll;
  display: flex;
  flex-direction: column;
  gap: 0.14rem;

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
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.14rem;
    // padding-bottom: 1.5rem;
  }

  .chat-item {
    display: flex;
    gap: 0.2rem;
    padding: 0 0.3rem;
    &:last-child {
      margin-bottom: 0.2rem;
    }
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
    .chat-avatar-wrap {
      width: 0.7rem;
      height: 0.7rem;
      border-radius: 50%;
      background-color: #c4a7f5;
      transform: scale(0);
      animation: showAvatar 0.3s 0.3s forwards;
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
      transform: scale(0);
      transform-origin: top left;
      animation: showContent 0.3s 0.3s forwards;
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
.chat-operate {
  display: flex;
  opacity: 0;
  position: sticky;
  bottom: 0;
  left: 0.13rem;
  right: 0.2rem;

  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  margin: 0 auto;
  width: 6.97rem;
  height: 1.9rem;
  border-radius: 0 0 0.5rem 0.5rem;
  background-color: #c4a7f5;
  padding: 0.15rem;
  gap: 0.1rem;
  z-index: 5;

  .reply-item {
    cursor: pointer;
    width: 100%;
    height: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.26rem;
    background-size: 100% auto;
    background-repeat: no-repeat;
    &:nth-child(1) {
      background-image: url(../assets/reply_1.png);
      .reply-item-txt::after {
        color: #ffd265;
      }
    }
    &:nth-child(2) {
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
  // display: none;
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
  .chat-friendly-tips {
    position: absolute;
    bottom: 1.4rem;
    left: 0.2rem;
    right: 0.2rem;
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
}

.mask-wrap {
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
  .mask-btn {
    position: absolute;
    top: 10.3rem;
    left: 5.6rem;
    width: 6.8rem;
    height: 1rem;
    color: #332614;
    font-style: italic;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    font-size: 0.44rem;
    background-image: url(../assets/btn_bg_yellow.png);
    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: -0.08rem;
      z-index: -1;
      bottom: 0;
      border-radius: 0.28rem;
      filter: blur(4px);
      background-color: rgba(255, 255, 255, 0.8);
    }
  }
}
</style>
