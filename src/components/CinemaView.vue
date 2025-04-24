<script setup lang="ts">
import { computed, onBeforeMount, ref } from "vue"
import { Howl } from "howler"
import DynamicBg from "./DynamicBg.vue"
import { useBgm } from "../hooks/useBgm"
import { useMusicMute } from "../hooks/useMusicMute"
import { gsap } from "gsap"
import { useRouter } from "vue-router"
import { slideEnter } from "../utils"
import { CinemaUserEnum } from "../router"
import { Assets } from "../assets-list"
import { useStore } from "../stores"
import { useChatMarked } from "../hooks/useChatMark"
import { botAvatar64 } from "../contants"

interface Props {
  user: CinemaUserEnum
}

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

const { user } = defineProps<Props>()

const { markPlot } = useChatMarked()

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
  chatEndCallback()
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

const markChatEnd = () => {
  switch (user) {
    case CinemaUserEnum.zhuyuan0:
      markPlot("zhuyuan", 1)
      break
    case CinemaUserEnum.zhuyuan1:
      markPlot("zhuyuan", 2)
      break

    default:
      break
  }
}

const chatEndCallback = async () => {
  markChatEnd()
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
      <div
        v-if="isCurUserBot"
        class="dialog-avatar"
        :style="{ backgroundImage: `url(${botAvatar64})` }"
      ></div>
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

  --grey-arrow-1: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAdCAMAAAAAVbV/AAAE9GlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4wLWMwMDAgNzkuMTcxYzI3ZmFiLCAyMDIyLzA4LzE2LTIyOjM1OjQxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjQuMCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjQtMTEtMjVUMTQ6NTE6MjUrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI0LTEyLTIwVDE1OjA1OjQ1KzA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI0LTEyLTIwVDE1OjA1OjQ1KzA4OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpiYmMzOWY0Zi1hMGM0LTQ2YTYtYWQxYS0zNzYxMmQ0ODE3OGYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6YmJjMzlmNGYtYTBjNC00NmE2LWFkMWEtMzc2MTJkNDgxNzhmIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6YmJjMzlmNGYtYTBjNC00NmE2LWFkMWEtMzc2MTJkNDgxNzhmIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpiYmMzOWY0Zi1hMGM0LTQ2YTYtYWQxYS0zNzYxMmQ0ODE3OGYiIHN0RXZ0OndoZW49IjIwMjQtMTEtMjVUMTQ6NTE6MjUrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyNC4wIChNYWNpbnRvc2gpIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PouS7isAAAAJcEhZcwAACxMAAAsTAQCanBgAAAB4UExURUdwTHt7e9PT09PT09PT03t7e3Z2doiIiNPT03p6etPT03t7e9PT03p6etPT03p6etTU1NPT03t7e3t7e3t7e3t7e9PT03t7e9PT03t7e9PT03t7e3l5edLS0tPT09PT03t7e9PT09PT09PT09PT09PT09PT03t7e8E+FNEAAAAmdFJOUwDiGdH17g8FCf7s9/se4V82a7LZynAtLKWX2kY9P7Fcf5l1hb15fVKG1gAAARFJREFUOMu1lFsTgiAQhfEKmqZpUtnFrFH//z8MFsUVc4aHOo87Z/bjLAskvZTOqGNGiRRv6/0or2FEiZLMGbTKGxS7uJ+UeDmZVAWzcyhSWXr7/Ww9u9BQ6HSMtDEKqlCU7t7s7OOD5meoaQR8doiRFfjQNLzskBX47jn5xqeYPyh+vuaH/+ATZs3n1nwm7akdnxrz3+bDqKo1/7Xgc32paFFEU1nK97hpI4zMzDSUVzNTUnM1J3FO3PIpz8kX53yNe7KYvdo9t8XZH67qSPE6KzZtcJ76/hO2b7BBC7azwaY27A4u3JpNjdxbbPKdna/ZFu+917kJvnCYuXCiP0SzRaYi2I1yYC9F8oc/qZ7/hQ8A1WivL4R/mwAAAABJRU5ErkJggg==);
  --grey-arrow-2: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAdCAMAAAAAVbV/AAAE9GlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4wLWMwMDAgNzkuMTcxYzI3ZmFiLCAyMDIyLzA4LzE2LTIyOjM1OjQxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjQuMCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjQtMTEtMjVUMDQ6MDY6MDgrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI0LTEyLTIwVDE1OjAzOjM3KzA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI0LTEyLTIwVDE1OjAzOjM3KzA4OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpmMzZiNjY2My1jMWFjLTQ2OTEtOTM5ZS0zMzExZmM5YWVlNzgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ZjM2YjY2NjMtYzFhYy00NjkxLTkzOWUtMzMxMWZjOWFlZTc4IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6ZjM2YjY2NjMtYzFhYy00NjkxLTkzOWUtMzMxMWZjOWFlZTc4Ij4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpmMzZiNjY2My1jMWFjLTQ2OTEtOTM5ZS0zMzExZmM5YWVlNzgiIHN0RXZ0OndoZW49IjIwMjQtMTEtMjVUMDQ6MDY6MDgrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyNC4wIChNYWNpbnRvc2gpIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pgkqr2IAAAAJcEhZcwAACxMAAAsTAQCanBgAAABsUExURUdwTHl5eXt7e9PT09PT09PT04eHh3t7e6enp3t7e9PT09PT03t7e3t7e3p6etPT09PT03p6etPT03p6ent7e3t7e3p6etPT09PT09PT09PT09PT03t7e3t7e3t7e3t7e9PT09LS0tPT03t7exzX7iEAAAAidFJOUwAZ/hnt+AX0Cd861upt/qHgK2tCspdcLc5csXjGf9PNiIAU/MYNAAAA7ElEQVQ4y7XU6RKCIBQFYBdkcdfcLTV5/3csMri45GhT9ydzhs8jqFFGsZyqpoYYM2dy+mBaEtOiUU3lihVa+FyO1V1UcnAg6US2SAaEQzQzZdKtIDmiVGBJH0KSKJ+mGj96wscaz0OmfDta+WYOvhVqvrfv+8rHa59+5/NdHycd+Nzf7R/8pX+32X/uV+XS53D+bqxvWmOxKeN6qe1O5fJMLdWpnN2T9vWcVwuS5GZudB+b1btXdw/X+/fpjE1P2nRtG7+36VEbF2zLdo/axoCWNv7wvd/Rsrd+icB+Nm+Q8x4vnaAkI3IY/JceDs9bi4BVtrwAAAAASUVORK5CYII=);

  .cinema-view-tips-cont {
    opacity: 0;
  }
  @keyframes greyProgress {
    0% {
      background-image: var(--grey-arrow-1);
    }
    50% {
      background-image: var(--grey-arrow-2);
    }
    100% {
      background-image: var(--grey-arrow-1);
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
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAMAAADVRocKAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAHgUExURUdwTDhmdlWNmTpodzlndjlndjlndluYozdldj5ufobH1DlndjlndorM1zlndovN2IfJ1DlndjdmdYvN2DpodzhmdjhldThmdoLCzj5tfIvN2IzP2ozN2YzO2YzO2YzO2YvM2IzO2ozO2YXH0o3O2kx/jWOcqXGsunKuun++yUl7iXSwvGulslWKmIfI016Voomaq4TDz0Bxf2iirmCWpYXG0P3aX43P2jlndl9LrJ6J715KrZN6Ijhmdf7bXozO2V5Kq4zN2YrL152I72BNronG1mNZsWFRroe/1PjVXDtqeYDAy2tuuIl02JuG6nu5xaSJLG1YukyAjkh6iIW504XF0JqBJ2hntm53vGKbqFqQnkN0g4Oz0FKHlD9ufWZStGZhtPjVZ5B4LWmjr5N/5O/NV3SHwYGsznaOxJ6J8m+qtquU2ne0wKSO5H1ozObFUnqbyHOvvO3Nd21YpnmVxrCUMvLQYdy8THGBv+XFg3pkoGJOoryeOdOzRpN6OX+ozcaoQXJewZ2I2LuivcSqtObFaYBpVpN7U36ky412mIpyPmhUmMuvrHyfyde5mG9ag3hhbL+ifpqEvJuCis6vfJmDpZZ+atm5b3xnt7CViaWLiZB4famPVmpfqrmfoIJrfbQyxZ0AAAA2dFJOUwDhGGbq9NEIIxAh+qQ8u0wvhkTxl3U2WtdPsZ/chc90Z8HjWZTv16rI78Lth9Xsr+rB6OntmTXWsrEAAAvuSURBVGje5Fn3WxtJEjVRICOMDbbXxhh7ndPut3t3YoQkpBnNKIAQSUICBBJBiShbImMwORkTHNdh91+96u7pSQiD9/a3q8/m2xmz9breq+qurjl37v/CdPn6CoPhgmgGQ4U+X/dPOjdcuFVbU339t5+IPXz44MHTO4DyD4Do9BUXau9ev33jl8pKjuNYm43jhECgqeXRkyf3f3167X+MJB+8V9++UcnZbCz4rqNmg2cOUJ786/6vBSWlf5saw6274B08y65VxgpNo8P/flZ17W+FAe6rb1ZydSd5F2MRmp533XtcUPKjEKUVyP33nYtsAUT3j0Lo9Hfu3gRu6s5kNq5puPte+dWza1FqqLl9kvucb9lAS1f772VXzhiE/k71DVbrlxUEt5+YWxCOoaMgeooLzhKEruLW9UqbmgLBH07sZZPx+MzMTDyeTG8lwm5BvQZbYLS7o7Cq5HT/hpqblepc9C+l4yFvMOoEc6Ef0aA3FE8n/GoMDmgqKr+kO83/XRU9nDuRnfFGnS4TMrvdZLaj/+Bdzqg3ng67ORVNg+2NxVd135dX5Z9zLyVDUSePXGPHohEQZzCUTbhZDULe94TQGap/luln3YmkF6/dTpZPTQJxRUPZsIIo9hQE4EfhXwhnQ1EX8aQOgD7CT4BI+zkFQlfHyQi6ipobNlnbpXjQRf0BIZFIm2iRCK8AcwaTCcGmULqHyTtBh4ram5zMfjrklPzwkbbl8fFm0cbHl9siLh7jQnx8NLQlK8GNdvcxxZdy1tet2/Kv+bNel9J789DQkM/nczjgh29oqBlh8CaRN5c3LSMIz3sbmeIrOQi6cF3Kfy6cDLqInuAeeffVO+pFczgQDMIQIUAJb9bPShU32NF4vqzkuAB3f1b4j/Kif+TeJzmvl1EQRFtEzC1XUEbgWrr7rEWXtULra2/S32D9yL8pM5fJRJbBvexUDQIQyxGziAAsUaWF4fZGa96l4wTZaPpng+B/7vPh4ftPzT4VNZowfM3jn2AZmQzSYU+gJDVBJlnL89UB1NyQVEp7gf/M5/X+qY+rY7K7sZGRsXoNxNjqn4eHf3x+u7099y20RHOQA52thQU6VQC3OTEAbinkAt3m3nkaGvpnVyWfI2tv3qxqEEZez/ZPTU2tr69/PNz+Fg9TknEIxSWqAGgJs/64ExLDtb1uNBplBMfY6xf9/bNrYwqaHGNrL4wNDfAHbOrdXDDrlkIAFYoulioVoAEI6SAqocwfUw2AYBQRHPUjs0Z4AQhSDA7HyGw//iW0lIb1L5lQgqMqQLUpQ9DXSgGEQ3j7QQwZZQS0WPw8uzZCERxjqy+MkjVMfD34lqQhBIY7GGWqGqppCrmzURNhiK4NIcBi3/STxxcUQfEOmWe6dWDfS3VmR0FmOYTSO7QGxAAkhqQYgCHxiSI45HcogNirTsuGHAKWuZBuevqaX1iqQBT4UTAkIoysUTYajC9eYwQssWwTkxbLzm4oQR0hjs6XiRwZJIn9M04NQwThtZINjOBIqRl62WqxbMxH0wLdVCGPmDzCke7OTyytAS+vZYjw0q98JDGsKhgyxhY6LQMH884Zv5hHaENixGLLr5UYIhKbgSHj9wwhqBjyEIbsvJdyhEUQOar4T4AyFMcM8WqGciPkYshsCtIdKTAIAAzJo4rfBDmH7DkYyomwpioCxNC+3Wxy0jzCKjNkTzX8xFEJgiiH7KocOsHUsky3IobMcEJTEWC3YEQRdBceiQDCXlRkyHi69WuKYAAxZHKFwoRu2ygCKKoCEUpvPWJVZZz5fCpDGkMSY4ZMvJcCtEAtM+fLQQT900d0n0g6cQ4den4MwCMxZDd5E8QZiwGwyvoHTRQA79Sm7Y8/tn4jZuhgXgRgFRHgUquQAMhRkHmrSVLPWRha3Ecdht0UpIUgAkD/UvGwqU4GgCQ9VErgiU3ETkHARbCZ4VUANIJLCKClTtYANrqPxgbZ/fSrhWktQINH9QZvE39FzHYVRTiLmLxrAHBfBeCSGfJMvFxo7Zyc0K44NjHh0Ui8OBchbSDNIo4AFF5VAsBWJDMEbl5NtnZaOhdiakUBdVIZlAcktnz4FMF9pFQHHK5k6IMRwCgF2AtCGWOGEDeT8D9aLK0vlc7Qa01QWOLtNh4DSJUMDSSlSP9slB7ICa8JADwiNxZsCmcx8bUqKMzQ5qc20glLe1EA7aZEZP2zYU7e7My7X6fxKol7S+erKdXijwWFi+DLpwi59Ui7KeorGJKm+seDATlPzbuLrZJ3y8Dm53e4NYkpYrKczJB0HuBTnyGVnP+4q0nqGqPm+Q3q3bK4+X5l5M2UcvEkqJi2CEgAys10GCcRg/ai/KruFto2Jry8fX+ALH7xw/sVX2rsz+lpxeLR+68f+zVF8KVNvAxFs4J4SSASnC+DFrj04r1RTsHR/AYgDOx8OVpxpFKplbetCsogqLdHq9pughaB3RWS6phIgNtHXcE9SQRIVN6+e7CzcTDX7EtB95PyvR1QLB4FNfZaahjhJJC3CWUOkeMG1Rk69S/93k1FYMMzTrt9HiwyPkRaxKNFxeKBM3W7QrYJl1ks4y1OSlKrVUyic+dKinsljlDvazeDwd0JI6RWPsiLr0+lUMcoHRcN9CQQA4j7xTJu6e1D/sVDP7+8Q+IIhSBeLtuaSQxHm4t08fUY8VDeiVAR4G6CXDaXBFUZkxMTqVzU3ULvDsIWvb/yywTBt/L+CC+eNNWpla8LLydisZjHAwXfSs9KnEJuepoRiRnanF4rlEOwuZNRkxohJf6lAJudra2TC69eovS1iGclrgF6w6EB0NYRROiTQ5BJQnfY41dYIkpnJ6B0ovQdEBlyhbYE+R6LA5Ca39Kq83IIdQK6pNFL/vFbcsr3ftGisIF9EwLgg2np9kEDQIcBsauFfd1SIkExSGMEk2v5OATJK2okAD6YpDdxfMfEAch3qJJipqeLHv1wUU7LCHyEQCjvyEebcvHtkHYoKvkHhXtIAEWXpYus7nJRY/uwUJcDQZxWNIuzEAeehRx92dgZQLazsY8HU8FkmFOMKrB/1T32SrFVSRJCcErDJzwr0oxzMrv7B2C782j9aFIhVepwbyNWmFGNK6AUEEmsjLAlj4vwPEoeSEUiEZ6HWocdxW432+280ysPvfC4iJjqIo5CaOwYlBFsQgINvOzqGZqJp0/QhKMNxY7mdjPyPIpDAtAAVGMv3cUia2P7YEAe2XH+LArCrhzUKYeCYg44vcmwNFHjWro6RIJw26u0knIr09c7HNAOHXmTSTUPVM02eWcwviXPThX+Ge0455zuaiGjQYAgtuJ4rqkZOoq6uJzBmT2/UJfLv3JQQXWuKsIxNLHqsXIyFHS6lCSJFeiMhuJbiumyTVD4Z8pzDLFLyhmEMNjEqSbX7vBePOSNOp0uMat4FzgPouG1ckBuCzzvlvxbc48dr+UBQmN7Vwun+VLjDi+lkzMhrzcI5vWGZuLZrbB6NM41Dff2SOvPK8g5OC29XMhYIVu7nwc0nw9YTnD7w+HEElgiHPa7BU71BQHoGWyn+Z9TAEkG+OfGHg1N8qctluNY8lGK1X6dAHqs1H9V/knD65IyhMD0QRA5IE4wLjDaBcu3Sv7LvvOVAiMATT29XaNngwD3g4h9K/Pfcs2dt0EYjKI1fsQRyJJRIOKfeEFRkVjCgITFAFGysFlZ/P+X2gUXQh8QlK135xzzfTLLZQ3fvUMqBsX7Yv9k8HJyfDOfhZaFfu4h7RWqrLPT7/S61I3Fj8cXiHuLDSBHwimqttFl8YPklOVFqbu2ssMZ8WJVD7WHxO8V5t5ZR2ckRZ1nQ/K6MHDVGPrtEe8vVkTDZylkWDjF+XaR1dVYlNL6ftdaqa5pr5W09Ad8uqbkcovgwBdfDnE2louUlY00MWx79HSKF3hdTefGFDLknu5BU9Y3uJkO4E8Wsh4keEacRIgZPgifrq13NCJIrAnegu8VkAG8QPcROcRbS/e3nRdygvAfdBBs7/SHddOQM4CwP2djBMjB0F/w68Peo0kUMAIAGgIACziMX0IfJTROjjCKInhMQkq9F8L/fT4Asdzc0kvy7m0AAAAASUVORK5CYII=);
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
.progress {
  position: absolute;
  right: 0.7rem;
  bottom: 0.8rem;
  width: 0.4rem;
  height: 0.31rem;
  background-size: 100% auto;
  background-repeat: no-repeat;
  animation: progress 1s infinite;

  --arrow-1: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAdCAMAAAAAVbV/AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAclBMVEVHcEylitPPtP3Otv+PabPPtfx3WqiqmeLPtf13Wqh3WqjPtf12WqjPtf11VqZ2Wah2WajQtP13Wah3Wah2WqjPtfzPtf7Ptfx3Wah3Wql3WqjPtfzQtfx3Wql3WqjPtfzQtf13WaesjtvQt/zPtfx3WqjTJLFRAAAAJHRSTlMACzoZA/jhB+31/dbs4RYiQmvYsmV9LaWXynPMsS5/X5lYNlF6acerAAABGklEQVQ4y6XT646DIBAF4IGiKFZdW0tb7faShfd/xeUiioBZk52f5GQ+DlFob6d8mntPQQ9/127Glz0CINAfpRt2+jKHl0K4ySpsY2qGUi7RcxMkRXY9uOT3fUnK44DUMR6XpCg6OkWpx0tpfNR5S4XxzdLmFvmHaxb5JOkDriK/0enYp//yQW0m+3yuN+/yEQ18tu3b/myJbvo6iXyfJd5/5POj5n6pXlu49pf+qKCm6OevTmonocE9ZfnUlfjqO7kge83g7Vvd/e11Fw/VXdvk498yN/Yres/QZuUTJW3Ya8Num8S9N+w2sOWWrd4yadehraeNe+Nkb1h9GsZe/e9z71WSGRuIn5xtpZ9LN/lgIf4osmmqztn0F8FfY0QyTLP8AAAAAElFTkSuQmCC);
  --arrow-2: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAdCAMAAAAAVbV/AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABsUExURUdwTM62/8+1/c+1/M+1/XdaqM+1/LOf6HdaqHdaqM+1/HZXqHJToc+1/HZaqHZZqHdaqHdaqXdZqNC0/XdaqM+1/ndZqM+1/ndaqM+2/c+0+3daqM+1/NC1/XdZp8+1+6aM1dC3/M+1/HdaqIbippYAAAAidFJOUwAZ3/bt/NEH8uP8HAyqZEIsyrJr2TaXLXN3P39fmVeFMVErXZxgAAAA+ElEQVQ4y7WU6w6CMAyFx2XsAkwRAUGUuL3/O8ocgypNJBIP/Gqafj1rN9LcQq+kZ8Qqrc9iUqEy4tXG2ksmlY0wJYwx1H3nw5w5RHpJzYMxkl24mUVPqc/sEpAZl5Z/LEAmv3g+Kxe81i++w3st/CCXn/y0pii/Any95pvtfLqb/x//0Re+XPunqH8w/nH+jR2qWoZKgf8qhIf6eBWFnXKFe7I1CagJPDVvfbbrPq9Tn8EN7J52u1fDkt476yE77GzsLnC2/oEt12yKsiXCFvvYu3zP7GorG7vvCr/vA4AnnXtDOLbDpMnjaFJYTu/SiXPqfjHvJXkCXgNbNPvK96IAAAAASUVORK5CYII=);

  @keyframes progress {
    0% {
      background-image: var(--arrow-1);
    }
    50% {
      background-image: var(--arrow-2);
    }
    100% {
      background-image: var(--arrow-1);
    }
  }
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
