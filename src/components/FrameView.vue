<script setup lang="ts">
import { CSSProperties, onMounted, ref } from "vue"
import { ceilToTwo } from "../utils"
import MainMenu from "./MainMenu.vue"

const ratio = 2.3148175675675673
const remRatio = 0.04
const overRatio = 0.768
const frameRef = ref<HTMLDivElement>()
const frameStyle = ref<CSSProperties>()

const resizeRootFontSize = (clientWidth: number) => {
  document.documentElement.style.fontSize = ceilToTwo(clientWidth * remRatio) + "px"
}

const resizeFrame = () => {
  const winWidth = window.innerWidth
  const winHeight = window.innerHeight
  let frameWidth = ceilToTwo(winWidth / overRatio)
  let frameHeight = ceilToTwo(parseFloat(frameWidth) / ratio)

  // console.log(winWidth, winHeight, winRatio)

  const getOverWidth = (frameWidth: number) => {
    if (frameWidth > winWidth) {
      return ceilToTwo((frameWidth - winWidth) / 2, 3)
    } else {
      return 0
    }
  }

  if (frameRef.value) {
    if (parseFloat(frameHeight) <= winHeight) {
      frameStyle.value = {
        width: frameWidth + "px",
        height: frameHeight + "px",
        left: -getOverWidth(parseFloat(frameWidth)) + "px",
      }
    } else {
      frameWidth = ceilToTwo(winHeight * ratio)
      frameStyle.value = {
        width: frameWidth + "px",
        height: winHeight + "px",
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
