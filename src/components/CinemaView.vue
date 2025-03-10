<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { Howl } from "howler"
import msgAnswer from "/audio/btn_click.mp3"
import bgmHome from "/audio/bgm_home.mp3"
import { useBgm } from "../hooks/useBgm"
import { useMusicMute } from "../hooks/useMusicMute"
import { gsap } from "gsap"
import { useRouter } from "vue-router"
import { slideEnter } from "../utils"
import { useFirstVisit } from "../hooks/useFirstVisit"
import { CinemaUserEnum } from "../router"

interface ChatRoomItem {
  user: string
  name: string
  avatar: string
  content: string
  mood?: string
}

const owner = {
  user: "ling",
  name: "玲",
  avatar: "user_ling_to_right.png",
  // avatar: "user_zhe_to_right.png",
}

const lists = ref<ChatRoomItem[]>([])

const router = useRouter()

const { user } = defineProps({
  user: String,
})

const { markVisit } = useFirstVisit()

const { isMute, toggleMute } = useMusicMute()
const { bgmSound } = useBgm(bgmHome)
const msgSound = ref()

const content = ref("")
const tipsCont = ref("")

const chatEnd = ref(false)

const stopWrite = ref(false)
const charIndex = ref(0)
const lineIndex = ref(0)

msgSound.value = new Howl({
  src: [msgAnswer],
  volume: 1.0,
})

const handleMute = () => {
  toggleMute()

  if (isMute.value) {
    bgmSound.value?.pause()
  } else {
    bgmSound.value?.play()
  }
}

const handleJump = () => {
  handleTipsMsg("第二天")
}

const curItem = computed(() => lists.value[lineIndex.value] || {})
const isCurUserBot = computed(() => curItem.value.user === "bot")
const curDirection = computed(() => (curItem.value.user === owner.user ? "left" : "right"))
const userLeft = computed<ChatRoomItem | undefined>((previous) =>
  curItem.value.user !== owner.user || isCurUserBot.value ? previous : curItem.value,
)
const userRight = computed<ChatRoomItem | undefined>((previous) =>
  curItem.value.user === owner.user || isCurUserBot.value ? previous : curItem.value,
)

const fetchData = async () => {
  let response
  switch (user) {
    case CinemaUserEnum.zhuyuan0:
      response = await import("../assets/data/zhuyuan_chatroom_0.json")
      break
    case CinemaUserEnum.zhuyuan1:
      response = await import("../assets/data/zhuyuan_chatroom_1.json")
      break

    default:
      break
  }

  lists.value = response?.default.list || []
}

onMounted(() => {
  fetchData().then(() => {
    const t = curItem.value.content
    if (t) {
      writeText(t)
    }
  })
})

const writeText = (str: string) => {
  let text = str
  charIndex.value = 0
  content.value = ""

  const handle = () => {
    if (stopWrite.value) {
      content.value = text
      charIndex.value = 0
      stopWrite.value = false

      if (lineIndex.value >= lists.value.length - 1) {
        chatEnd.value = true
        setTimeout(() => {
          chatEndCallback()
        }, 1000)
      }
      return
    }
    if (charIndex.value < text.length) {
      content.value += text.charAt(charIndex.value++)
      requestAnimationFrame(() => {
        setTimeout(handle, 20)
      })
    } else {
      charIndex.value = 0
      content.value = text

      if (lineIndex.value >= lists.value.length - 1) {
        chatEnd.value = true
        setTimeout(() => {
          chatEndCallback()
        }, 1000)
      }
    }
  }
  return handle()
}

const handleNext = async () => {
  if (chatEnd.value) return

  if (!isMute.value) {
    msgSound.value.play()
  }

  if (charIndex.value !== 0) {
    stopWrite.value = true // fast-forward
    return
  }

  lineIndex.value++
  const msg = curItem.value
  if (msg.user === "tips") {
    handleTipsMsg(msg.content)
  } else {
    writeText(msg.content)
  }
}

const handleTipsMsg = async (content: string) => {
  tipsCont.value = content
  gsap.set(".cinema-view", { pointerEvents: "none" })
  gsap.set(".cinema-view-tips", { display: "flex" })
  await gsap.to(".cinema-view-tips", { opacity: 1, duration: 0.5 })
  await gsap.to(".cinema-view-tips-cont", { opacity: 1, duration: 0.5 })
  gsap.set(".tips-progress", { opacity: 1 })
  gsap.set(".cinema-view-tips", { pointerEvents: "auto" })
}

const handleTipsNext = async () => {
  setTimeout(handleNext)
  await gsap.to(".cinema-view-tips", { opacity: 0, duration: 0.5 })
  gsap.set(".cinema-view", { pointerEvents: "auto" })
  gsap.set(".cinema-view-tips", { display: "none", pointerEvents: "none" })
  gsap.set(".cinema-view-tips-cont", { opacity: 0 })
  gsap.set(".tips-progress", { opacity: 0 })
  tipsCont.value = ""
}

const chatEndCallback = async () => {
  markVisit()
  await slideEnter()
  router.replace("/home")
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
        <feMorphology operator="dilate" radius="3.4359375"></feMorphology>
        <feComposite operator="xor" in="SourceGraphic"></feComposite>
      </filter>
    </defs>
  </svg>

  <div class="cinema-view-tips" @click.stop="handleTipsNext">
    <span class="cinema-view-tips-cont">{{ tipsCont }}</span>
    <div class="tips-progress"></div>
  </div>

  <div class="cinema-view" @click="handleNext">
    <div class="right-top-operator">
      <div
        class="operator-btn mute"
        :data-state="isMute ? 'mute' : 'open'"
        @click.stop="handleMute"
      ></div>
      <div class="operator-btn jump" @click.stop="handleJump"></div>
    </div>
    <div class="right-bottom"></div>

    <div class="dialog-block">
      <div v-if="isCurUserBot" class="dialog-avatar"></div>
      <div
        class="dialog-name"
        :data-text="curItem.name"
        :style="isCurUserBot ? { transform: 'translateX(1.4rem)' } : {}"
      >
        {{ curItem.name }}
      </div>
      <div class="dialog-content" :data-text="content">{{ content }}</div>
      <div class="progress"></div>
    </div>

    <div
      class="user-left"
      :data-mood="userLeft?.mood"
      :class="curDirection === 'left' ? '' : 'hide'"
      :style="{ backgroundImage: `url(/src/assets/${userLeft?.avatar})` }"
    ></div>
    <div
      class="user-right"
      :class="curDirection === 'right' ? '' : 'hide'"
      :data-mood="userRight?.mood"
      :style="{ backgroundImage: `url(/src/assets/${userRight?.avatar})` }"
    ></div>
  </div>
</template>

<style scoped lang="scss">
.cinema-view-tips {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #000;
  z-index: 10;
  color: #fff;
  font-size: 0.36rem;
  // display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  opacity: 0;
  display: none;
  pointer-events: none;
  gap: 0.35rem;

  .cinema-view-tips-cont {
    opacity: 0;
  }
  @keyframes greyProgress {
    0% {
      background-image: url(../assets/progress_grey_1.png);
    }
    50% {
      background-image: url(../assets/progress_grey_2.png);
    }
    100% {
      background-image: url(../assets/progress_grey_1.png);
    }
  }
  .tips-progress {
    width: 0.4rem;
    height: 0.31rem;
    background-size: 100% auto;
    background-repeat: no-repeat;
    animation: greyProgress 1s infinite;
    opacity: 0;
  }
}
.cinema-view {
  position: relative;
  width: 100%;
  height: 100%;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-image: url(../assets/cinema_bg.jpg);
}
.right-top-operator {
  position: absolute;
  top: 0.15rem;
  right: 3.2rem;
  width: 3.7rem;
  height: 2rem;
  z-index: 3;
  background-size: 100% auto;
  background-repeat: no-repeat;
  background-image: url(../assets/operator_wrap_1.png);

  .operator-btn {
    position: absolute;
    width: 1rem;
    height: 1rem;
    top: 0.45rem;
    background-size: 100% auto;
    background-repeat: no-repeat;
    cursor: pointer;

    &.mute {
      left: 0.7rem;
      &[data-state="mute"] {
        background-image: url(../assets/mute_ban_1.png);
      }
      &[data-state="open"] {
        background-image: url(../assets/mute_open_1.png);
      }
    }
    &.jump {
      left: 2.1rem;
      background-image: url(../assets/jump_btn_1.png);
    }
  }
}
.right-bottom {
  position: absolute;
  bottom: 0;
  right: 1.8rem;
  width: 7.7rem;
  height: 1.3rem;
  z-index: 3;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-image: url(../assets/blk_di_3.png);
}
.dialog-block {
  position: absolute;
  bottom: 0.3rem;
  left: 4.3rem;
  right: 4.3rem;
  height: 4.52rem;
  z-index: 5;
  background-size: 100% auto;
  background-repeat: no-repeat;
  background-image: url(../assets/dialog_bg.png);
  .dialog-avatar {
    // display: none;
    position: absolute;
    top: -0.18rem;
    left: 0.5rem;
    width: 1.9rem;
    height: 1.9rem;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-image: url(../assets/ciname_bot_avatar.png);
  }
  .dialog-name {
    position: absolute;
    top: 0.8rem;
    left: 1.1rem;
    font-size: 0.6rem;
    color: #fff;
    &::after {
      content: attr(data-text);
      position: absolute;
      left: 0;
      color: #61478b;
      z-index: 0;
      filter: url(#stroke-text-svg-filter-3);
    }
  }
  .dialog-content {
    position: absolute;
    font-size: 0.36rem;
    top: 2.1rem;
    left: 1.1rem;
    right: 1.1rem;
    color: #d9bfff;
    height: 1.65rem;
    overflow: hidden;
    text-align: justify;
    &::after {
      content: attr(data-text);
      position: absolute;
      left: 0;
      top: 0;
      color: #4e327a;
      z-index: 0;
      filter: url(#stroke-text-svg-filter-3);
    }
  }
}
@keyframes progress {
  0% {
    background-image: url(../assets/progress_1.png);
  }
  50% {
    background-image: url(../assets/progress_2.png);
  }
  100% {
    background-image: url(../assets/progress_1.png);
  }
}
.progress {
  position: absolute;
  right: 0.7rem;
  bottom: 0.8rem;
  width: 0.4rem;
  height: 0.31rem;
  background-size: 100% auto;
  background-repeat: no-repeat;
  animation: progress 1s infinite;
}
.user-left {
  position: absolute;
  top: 0.5rem;
  bottom: 0;
  left: 2.5rem;
  width: 7rem;
  background-position: bottom;
  // background-size: 100% auto;
  background-size: auto 100%;
  background-repeat: no-repeat;
  transition: filter 0.3s;

  &.hide {
    filter: brightness(0.6) contrast(0.8);
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 2.57rem;
    width: 3.95rem;
    height: 3.4rem;
    background-size: 100% auto;
    background-repeat: no-repeat;
  }
  &[data-mood="1"]::after {
    background-image: url(../assets/lin_l_1.png);
  }
  &[data-mood="2"]::after {
    background-image: url(../assets/lin_l_2.png);
  }
  &[data-mood="3"]::after {
    background-image: url(../assets/lin_l_3.png);
  }
  &[data-mood="4"]::after {
    background-image: url(../assets/lin_l_4.png);
  }
  &[data-mood="5"]::after {
    background-image: url(../assets/lin_l_5.png);
  }
}
.user-right {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 4.5rem;
  width: 5rem;
  background-position: top;
  background-size: 100% auto;
  background-repeat: no-repeat;

  &.hide {
    filter: brightness(0.6) contrast(0.8);
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0.75rem;
    width: 3.95rem;
    height: 3.8rem;
    background-size: 100% auto;
    background-repeat: no-repeat;
  }
  &[data-mood="1"]::after {
    background-image: url(../assets/ze_r_1.png);
  }
  &[data-mood="2"]::after {
    background-image: url(../assets/ze_r_2.png);
  }
  &[data-mood="3"]::after {
    background-image: url(../assets/ze_r_3.png);
  }
  &[data-mood="4"]::after {
    background-image: url(../assets/ze_r_4.png);
  }
}
</style>
