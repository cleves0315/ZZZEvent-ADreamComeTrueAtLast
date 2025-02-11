<script setup lang="ts">
import { CSSProperties, onMounted, ref } from "vue"
import { ceilToTwo } from "../utils"
import MainMenu from "./MainMenu.vue"

const viewportFrameRatio = 0.768
const frameAspectRatio = 2.3148175675675673
const remRatio = 0.04
const frameRef = ref<HTMLDivElement>()
const frameStyle = ref<CSSProperties>()

const resizeRootFontSize = (clientWidth: number) => {
  document.documentElement.style.fontSize = ceilToTwo(clientWidth * remRatio) + "px"
}

const resizeFrame = () => {
  let winWidth = window.innerWidth
  let winHeight = window.innerHeight
  let frameWidth, frameHeight

  if (winWidth < winHeight) {
    const diff = winHeight - winWidth
    document.body.style.margin = "0"
    document.body.style.position = "fixed"
    document.body.style.width = winHeight + "px"
    document.body.style.height = winWidth + "px"
    document.body.style.overflow = "hidden"
    document.body.style.transformOrigin = "center center"
    document.body.style.transform = "rotate(90deg)"
    document.body.style.left = -diff / 2 + "px"
    document.body.style.top = diff / 2 + "px"
    winWidth = window.innerHeight
    winHeight = window.innerWidth
  } else {
    document.body.style.margin = "0"
    document.body.style.position = "fixed"
    document.body.style.width = winWidth + "px"
    document.body.style.height = winHeight + "px"
    document.body.style.overflow = "hidden"
    document.body.style.transformOrigin = "center center"
    document.body.style.transform = "rotate(0deg)"
    document.body.style.left = "0"
    document.body.style.top = "0"
  }

  const getOverWidth = (frameWidth: number) => {
    if (frameWidth > winWidth) {
      return ceilToTwo((frameWidth - winWidth) / 2, 3)
    } else {
      return 0
    }
  }

  console.log(winWidth, winHeight)

  if (frameRef.value) {
    // no rotate
    frameWidth = ceilToTwo(winWidth / viewportFrameRatio)
    frameHeight = ceilToTwo(parseFloat(frameWidth) / frameAspectRatio)
    if (parseFloat(frameHeight) <= winHeight) {
      frameStyle.value = {
        width: frameWidth + "px",
        height: frameHeight + "px",
        left: -getOverWidth(parseFloat(frameWidth)) + "px",
      }
    } else {
      frameHeight = winHeight
      frameWidth = ceilToTwo(frameHeight * frameAspectRatio)
      frameStyle.value = {
        width: frameWidth + "px",
        height: frameHeight + "px",
        left: -getOverWidth(parseFloat(frameWidth)) + "px",
      }
    }
    resizeRootFontSize(parseFloat(frameWidth))
  } else {
    resizeRootFontSize(winWidth)
  }
}

onMounted(() => {
  resizeFrame()
  window.addEventListener("resize", () => {
    resizeFrame()
  })
})
</script>

<template>
  <div class="frame-view" :style="{ width: frameStyle?.width }">
    <div class="frame" ref="frameRef" :style="frameStyle">
      <MainMenu />
    </div>
  </div>
</template>

<style scoped>
.frame-view {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.frame {
  position: absolute;
  background-image: url("../assets/default_bg2.jpg");
  background-repeat: no-repeat;
  background-size: 100% 100%;
}
</style>
