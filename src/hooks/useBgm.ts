import throttle from "lodash/throttle"
import { onMounted, ref } from "vue"
import { useMusicMute } from "./useMusicMute"

export const useBgm = (bgm: string) => {
  const bgmSound = ref()
  const bgmState = ref("none")

  const { getBgmMuted } = useMusicMute()

  const smartSwitchBgm = (action: "pause" | "play") => {
    if (!bgmSound.value) return
    if (getBgmMuted()) return
    if (bgmSound.value.state() === "stopped") return

    if (action === "pause" && bgmState.value === "playing") {
      bgmSound.value.pause()
    }
    if (action === "play" && bgmState.value === "paused") {
      bgmSound.value.play()
    }
  }

  onMounted(() => {
    bgmSound.value = new Howl({
      src: [bgm],
      autoplay: getBgmMuted() ? false : true,
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
  })

  return {
    bgmSound,
    bgmState,
  }
}
