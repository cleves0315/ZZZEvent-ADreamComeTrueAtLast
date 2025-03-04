import throttle from "lodash/throttle"
import { onMounted, onUnmounted, ref } from "vue"
import { Howl } from "howler"
import { useMusicMute } from "./useMusicMute"

export const useBgm = (bgm: string) => {
  const bgmSound = ref<Howl>()
  const bgmState = ref("none")

  const { isMute } = useMusicMute()

  const smartSwitchBgm = (action: "pause" | "play") => {
    if (!bgmSound.value) return
    if (isMute.value) return
    if (bgmSound.value.state() === "unloaded") return

    if (action === "pause" && bgmState.value === "playing") {
      bgmSound.value.pause()
    }
    if (action === "play" && bgmState.value === "paused") {
      bgmSound.value.play()
    }
  }

  const visibleSwitchBgm = throttle(() => {
    if (document.visibilityState === "hidden") {
      smartSwitchBgm("pause")
    } else {
      smartSwitchBgm("play")
    }
  }, 1000)

  const forceSwitchBgm = throttle(function () {
    smartSwitchBgm("play")
  }, 500)

  const blurSwitchBgm = throttle(function () {
    smartSwitchBgm("pause")
  }, 500)

  onMounted(() => {
    bgmSound.value = new Howl({
      src: [bgm],
      autoplay: isMute.value ? false : true,
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

    document.addEventListener("visibilitychange", visibleSwitchBgm)
    window.addEventListener("focus", forceSwitchBgm)
    window.addEventListener("blur", blurSwitchBgm)
  })

  onUnmounted(() => {
    document.removeEventListener("visibilitychange", visibleSwitchBgm)
    window.removeEventListener("focus", forceSwitchBgm)
    window.removeEventListener("blur", blurSwitchBgm)
    bgmSound.value?.stop()
    bgmState.value = "stopped"
  })

  return {
    bgmSound,
    bgmState,
  }
}
