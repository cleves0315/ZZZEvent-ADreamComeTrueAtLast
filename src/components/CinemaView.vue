<script setup lang="ts">
import { computed, onBeforeMount, ref } from "vue"
import { Howl } from "howler"
import DynamicBg from "./DynamicBg.vue"
import { useBgm } from "../hooks/useBgm"
import { useMusicMute } from "../hooks/useMusicMute"
import { gsap } from "gsap"
import { useRouter } from "vue-router"
import { slideEnter } from "../utils"
import { useFirstVisit } from "../hooks/useFirstVisit"
import { CinemaUserEnum } from "../router"
import { Assets } from "../assets-list"
import { useStore } from "../stores"

interface ChatRoomItem {
  user: string
  name: string
  avatar: Assets
  content: string
  /** "1" | "2" | "3" | "4" ｜ "5" */
  mood?: "1" | "2" | "3" | "4"
}

const owner = {
  user: "ling",
  name: "玲",
  avatar: "user_ling_to_right.png",
  // avatar: "user_zhe_to_right.png",
}

const lists = ref<ChatRoomItem[]>([])

const store = useStore()

const router = useRouter()

const { user } = defineProps({
  user: String,
})

const { markVisit } = useFirstVisit()

const { isMute, toggleMute } = useMusicMute()

const { bgmSound } = useBgm(store.assetList["bgm_home"])

const msgSound = ref()

const content = ref("")

const tipsCont = ref("")

const chatEnd = ref(false)

const stopWrite = ref(false)

const charIndex = ref(0)

const lineIndex = ref(0)

msgSound.value = new Howl({
  src: [store.assetList["btn_click"]],
  format: ["mp3"],
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

  // @ts-ignore
  lists.value = response?.default.list || []
}

onBeforeMount(() => {
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

  <DynamicBg class="cinema-view" name="cinema_bg" @click="handleNext">
    <div class="right-top-operator">
      <div
        class="operator-btn mute"
        :data-state="isMute ? 'mute' : 'open'"
        @click.stop="handleMute"
      ></div>
      <div class="operator-btn jump" @click.stop="handleJump"></div>
    </div>
    <DynamicBg class="right-bottom" name="blk_di_3"></DynamicBg>

    <DynamicBg class="dialog-block" name="dialog_bg">
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
    </DynamicBg>

    <DynamicBg
      :name="userLeft?.avatar"
      class="user-left"
      :class="curDirection === 'left' ? '' : 'hide'"
    >
      <DynamicBg
        class="user-left-avatar"
        :data-mood="userLeft?.mood"
        :name="userLeft?.mood ? `lin_l_${userLeft?.mood}` : undefined"
      ></DynamicBg>
    </DynamicBg>
    <DynamicBg
      :name="userRight?.avatar"
      class="user-right"
      :class="curDirection === 'right' ? '' : 'hide'"
    >
      <DynamicBg
        class="user-right-avatar"
        :data-mood="userRight?.mood"
        :name="userRight?.mood ? `ze_r_${userRight?.mood}` : undefined"
      ></DynamicBg>
    </DynamicBg>
  </DynamicBg>
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
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAdCAMAAAAAVbV/AAAE9GlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4wLWMwMDAgNzkuMTcxYzI3ZmFiLCAyMDIyLzA4LzE2LTIyOjM1OjQxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjQuMCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjQtMTEtMjVUMTQ6NTE6MjUrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI0LTEyLTIwVDE1OjA1OjQ1KzA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI0LTEyLTIwVDE1OjA1OjQ1KzA4OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpiYmMzOWY0Zi1hMGM0LTQ2YTYtYWQxYS0zNzYxMmQ0ODE3OGYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6YmJjMzlmNGYtYTBjNC00NmE2LWFkMWEtMzc2MTJkNDgxNzhmIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6YmJjMzlmNGYtYTBjNC00NmE2LWFkMWEtMzc2MTJkNDgxNzhmIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpiYmMzOWY0Zi1hMGM0LTQ2YTYtYWQxYS0zNzYxMmQ0ODE3OGYiIHN0RXZ0OndoZW49IjIwMjQtMTEtMjVUMTQ6NTE6MjUrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyNC4wIChNYWNpbnRvc2gpIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PouS7isAAAAJcEhZcwAACxMAAAsTAQCanBgAAAB4UExURUdwTHt7e9PT09PT09PT03t7e3Z2doiIiNPT03p6etPT03t7e9PT03p6etPT03p6etTU1NPT03t7e3t7e3t7e3t7e9PT03t7e9PT03t7e9PT03t7e3l5edLS0tPT09PT03t7e9PT09PT09PT09PT09PT09PT03t7e8E+FNEAAAAmdFJOUwDiGdH17g8FCf7s9/se4V82a7LZynAtLKWX2kY9P7Fcf5l1hb15fVKG1gAAARFJREFUOMu1lFsTgiAQhfEKmqZpUtnFrFH//z8MFsUVc4aHOo87Z/bjLAskvZTOqGNGiRRv6/0or2FEiZLMGbTKGxS7uJ+UeDmZVAWzcyhSWXr7/Ww9u9BQ6HSMtDEKqlCU7t7s7OOD5meoaQR8doiRFfjQNLzskBX47jn5xqeYPyh+vuaH/+ATZs3n1nwm7akdnxrz3+bDqKo1/7Xgc32paFFEU1nK97hpI4zMzDSUVzNTUnM1J3FO3PIpz8kX53yNe7KYvdo9t8XZH67qSPE6KzZtcJ76/hO2b7BBC7azwaY27A4u3JpNjdxbbPKdna/ZFu+917kJvnCYuXCiP0SzRaYi2I1yYC9F8oc/qZ7/hQ8A1WivL4R/mwAAAABJRU5ErkJggg==);
    }
    50% {
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAdCAMAAAAAVbV/AAAE9GlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4wLWMwMDAgNzkuMTcxYzI3ZmFiLCAyMDIyLzA4LzE2LTIyOjM1OjQxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjQuMCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjQtMTEtMjVUMDQ6MDY6MDgrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI0LTEyLTIwVDE1OjAzOjM3KzA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI0LTEyLTIwVDE1OjAzOjM3KzA4OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpmMzZiNjY2My1jMWFjLTQ2OTEtOTM5ZS0zMzExZmM5YWVlNzgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ZjM2YjY2NjMtYzFhYy00NjkxLTkzOWUtMzMxMWZjOWFlZTc4IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6ZjM2YjY2NjMtYzFhYy00NjkxLTkzOWUtMzMxMWZjOWFlZTc4Ij4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpmMzZiNjY2My1jMWFjLTQ2OTEtOTM5ZS0zMzExZmM5YWVlNzgiIHN0RXZ0OndoZW49IjIwMjQtMTEtMjVUMDQ6MDY6MDgrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyNC4wIChNYWNpbnRvc2gpIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pgkqr2IAAAAJcEhZcwAACxMAAAsTAQCanBgAAABsUExURUdwTHl5eXt7e9PT09PT09PT04eHh3t7e6enp3t7e9PT09PT03t7e3t7e3p6etPT09PT03p6etPT03p6ent7e3t7e3p6etPT09PT09PT09PT09PT03t7e3t7e3t7e3t7e9PT09LS0tPT03t7exzX7iEAAAAidFJOUwAZ/hnt+AX0Cd861upt/qHgK2tCspdcLc5csXjGf9PNiIAU/MYNAAAA7ElEQVQ4y7XU6RKCIBQFYBdkcdfcLTV5/3csMri45GhT9ydzhs8jqFFGsZyqpoYYM2dy+mBaEtOiUU3lihVa+FyO1V1UcnAg6US2SAaEQzQzZdKtIDmiVGBJH0KSKJ+mGj96wscaz0OmfDta+WYOvhVqvrfv+8rHa59+5/NdHycd+Nzf7R/8pX+32X/uV+XS53D+bqxvWmOxKeN6qe1O5fJMLdWpnN2T9vWcVwuS5GZudB+b1btXdw/X+/fpjE1P2nRtG7+36VEbF2zLdo/axoCWNv7wvd/Rsrd+icB+Nm+Q8x4vnaAkI3IY/JceDs9bi4BVtrwAAAAASUVORK5CYII=);
    }
    100% {
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAdCAMAAAAAVbV/AAAE9GlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4wLWMwMDAgNzkuMTcxYzI3ZmFiLCAyMDIyLzA4LzE2LTIyOjM1OjQxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjQuMCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjQtMTEtMjVUMTQ6NTE6MjUrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI0LTEyLTIwVDE1OjA1OjQ1KzA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI0LTEyLTIwVDE1OjA1OjQ1KzA4OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpiYmMzOWY0Zi1hMGM0LTQ2YTYtYWQxYS0zNzYxMmQ0ODE3OGYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6YmJjMzlmNGYtYTBjNC00NmE2LWFkMWEtMzc2MTJkNDgxNzhmIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6YmJjMzlmNGYtYTBjNC00NmE2LWFkMWEtMzc2MTJkNDgxNzhmIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpiYmMzOWY0Zi1hMGM0LTQ2YTYtYWQxYS0zNzYxMmQ0ODE3OGYiIHN0RXZ0OndoZW49IjIwMjQtMTEtMjVUMTQ6NTE6MjUrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyNC4wIChNYWNpbnRvc2gpIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PouS7isAAAAJcEhZcwAACxMAAAsTAQCanBgAAAB4UExURUdwTHt7e9PT09PT09PT03t7e3Z2doiIiNPT03p6etPT03t7e9PT03p6etPT03p6etTU1NPT03t7e3t7e3t7e3t7e9PT03t7e9PT03t7e9PT03t7e3l5edLS0tPT09PT03t7e9PT09PT09PT09PT09PT09PT03t7e8E+FNEAAAAmdFJOUwDiGdH17g8FCf7s9/se4V82a7LZynAtLKWX2kY9P7Fcf5l1hb15fVKG1gAAARFJREFUOMu1lFsTgiAQhfEKmqZpUtnFrFH//z8MFsUVc4aHOo87Z/bjLAskvZTOqGNGiRRv6/0or2FEiZLMGbTKGxS7uJ+UeDmZVAWzcyhSWXr7/Ww9u9BQ6HSMtDEKqlCU7t7s7OOD5meoaQR8doiRFfjQNLzskBX47jn5xqeYPyh+vuaH/+ATZs3n1nwm7akdnxrz3+bDqKo1/7Xgc32paFFEU1nK97hpI4zMzDSUVzNTUnM1J3FO3PIpz8kX53yNe7KYvdo9t8XZH67qSPE6KzZtcJ76/hO2b7BBC7azwaY27A4u3JpNjdxbbPKdna/ZFu+917kJvnCYuXCiP0SzRaYi2I1yYC9F8oc/qZ7/hQ8A1WivL4R/mwAAAABJRU5ErkJggg==);
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
  background-image: url(data:image/png;base64,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);

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
  z-index: 3;
  background-size: 100% 100%;
  background-repeat: no-repeat;
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
  .dialog-avatar {
    // display: none;
    position: absolute;
    top: -0.18rem;
    left: 0.5rem;
    width: 1.9rem;
    height: 1.9rem;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-image: url(data:image/png;base64,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);
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
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAdCAMAAAAAVbV/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAclBMVEVHcEylitPPtP3Otv+PabPPtfx3WqiqmeLPtf13Wqh3WqjPtf12WqjPtf11VqZ2Wah2WajQtP13Wah3Wah2WqjPtfzPtf7Ptfx3Wah3Wql3WqjPtfzQtfx3Wql3WqjPtfzQtf13WaesjtvQt/zPtfx3WqjTJLFRAAAAJHRSTlMACzoZA/jhB+31/dbs4RYiQmvYsmV9LaWXynPMsS5/X5lYNlF6acerAAABGklEQVQ4y6XT646DIBAF4IGiKFZdW0tb7faShfd/xeUiioBZk52f5GQ+DlFob6d8mntPQQ9/127Glz0CINAfpRt2+jKHl0K4ySpsY2qGUi7RcxMkRXY9uOT3fUnK44DUMR6XpCg6OkWpx0tpfNR5S4XxzdLmFvmHaxb5JOkDriK/0enYp//yQW0m+3yuN+/yEQ18tu3b/myJbvo6iXyfJd5/5POj5n6pXlu49pf+qKCm6OevTmonocE9ZfnUlfjqO7kge83g7Vvd/e11Fw/VXdvk498yN/Yres/QZuUTJW3Ya8Num8S9N+w2sOWWrd4yadehraeNe+Nkb1h9GsZe/e9z71WSGRuIn5xtpZ9LN/lgIf4osmmqztn0F8FfY0QyTLP8AAAAAElFTkSuQmCC);
  }
  50% {
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAdCAMAAAAAVbV/AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABsUExURUdwTM62/8+1/c+1/M+1/XdaqM+1/LOf6HdaqHdaqM+1/HZXqHJToc+1/HZaqHZZqHdaqHdaqXdZqNC0/XdaqM+1/ndZqM+1/ndaqM+2/c+0+3daqM+1/NC1/XdZp8+1+6aM1dC3/M+1/HdaqIbippYAAAAidFJOUwAZ3/bt/NEH8uP8HAyqZEIsyrJr2TaXLXN3P39fmVeFMVErXZxgAAAA+ElEQVQ4y7WU6w6CMAyFx2XsAkwRAUGUuL3/O8ocgypNJBIP/Gqafj1rN9LcQq+kZ8Qqrc9iUqEy4tXG2ksmlY0wJYwx1H3nw5w5RHpJzYMxkl24mUVPqc/sEpAZl5Z/LEAmv3g+Kxe81i++w3st/CCXn/y0pii/Any95pvtfLqb/x//0Re+XPunqH8w/nH+jR2qWoZKgf8qhIf6eBWFnXKFe7I1CagJPDVvfbbrPq9Tn8EN7J52u1fDkt476yE77GzsLnC2/oEt12yKsiXCFvvYu3zP7GorG7vvCr/vA4AnnXtDOLbDpMnjaFJYTu/SiXPqfjHvJXkCXgNbNPvK96IAAAAASUVORK5CYII=);
  }
  100% {
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAdCAMAAAAAVbV/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAclBMVEVHcEylitPPtP3Otv+PabPPtfx3WqiqmeLPtf13Wqh3WqjPtf12WqjPtf11VqZ2Wah2WajQtP13Wah3Wah2WqjPtfzPtf7Ptfx3Wah3Wql3WqjPtfzQtfx3Wql3WqjPtfzQtf13WaesjtvQt/zPtfx3WqjTJLFRAAAAJHRSTlMACzoZA/jhB+31/dbs4RYiQmvYsmV9LaWXynPMsS5/X5lYNlF6acerAAABGklEQVQ4y6XT646DIBAF4IGiKFZdW0tb7faShfd/xeUiioBZk52f5GQ+DlFob6d8mntPQQ9/127Glz0CINAfpRt2+jKHl0K4ySpsY2qGUi7RcxMkRXY9uOT3fUnK44DUMR6XpCg6OkWpx0tpfNR5S4XxzdLmFvmHaxb5JOkDriK/0enYp//yQW0m+3yuN+/yEQ18tu3b/myJbvo6iXyfJd5/5POj5n6pXlu49pf+qKCm6OevTmonocE9ZfnUlfjqO7kge83g7Vvd/e11Fw/VXdvk498yN/Yres/QZuUTJW3Ya8Num8S9N+w2sOWWrd4yadehraeNe+Nkb1h9GsZe/e9z71WSGRuIn5xtpZ9LN/lgIf4osmmqztn0F8FfY0QyTLP8AAAAAElFTkSuQmCC);
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
  background-size: auto 100%;
  background-repeat: no-repeat;
  transition: filter 0.3s;

  &.hide {
    filter: brightness(0.6) contrast(0.8);
  }

  .user-left-avatar {
    position: absolute;
    top: 0;
    left: 2.57rem;
    width: 3.95rem;
    height: 3.4rem;
    background-size: 100% auto;
    background-repeat: no-repeat;
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

  .user-right-avatar {
    position: absolute;
    top: 0;
    left: 0.75rem;
    width: 3.95rem;
    height: 3.8rem;
    background-size: 100% auto;
    background-repeat: no-repeat;
  }
}
</style>
