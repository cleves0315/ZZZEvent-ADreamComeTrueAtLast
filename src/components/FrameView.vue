<script setup lang="ts">
import { CSSProperties, onMounted, ref } from "vue"
import { ceilToTwo } from "../utils"
import { RouterView } from "vue-router"
import { gsap } from "gsap"

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

  // console.log(winWidth, winHeight)

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

const slideEnter = () => {
  const frameElm = document.querySelector(".frame")
  if (frameElm) {
    const frameWidth = frameElm.clientWidth // important!!!
    const lineWidth = frameWidth / 10
    const lineWidthHalf = lineWidth / 2
    const lineGap = lineWidth * 2
    gsap.set(".route-slide-wrapper", {
      width: frameWidth,
      height: frameWidth,
      opacity: 1,
      zIndex: 99,
    })

    gsap.set(".route-slide-line-right", { x: frameWidth })
    gsap.set(".route-slide-line-left", { x: -frameWidth })

    gsap.to(".route-slide-line-right1", { x: lineGap - lineGap * 4 + lineWidthHalf })
    gsap.to(".route-slide-line-right2", { x: lineGap - lineGap * 3 + lineWidthHalf })
    gsap.to(".route-slide-line-right3", { x: lineGap - lineGap * 2 + lineWidthHalf })
    gsap.to(".route-slide-line-right4", { x: lineGap - lineGap + lineWidthHalf })
    gsap.to(".route-slide-line-right5", { x: lineGap + lineWidthHalf })

    gsap.to(".route-slide-line-left1", { x: -lineGap - lineWidthHalf })
    gsap.to(".route-slide-line-left2", { x: -(lineGap - lineGap) - lineWidthHalf })
    gsap.to(".route-slide-line-left3", { x: -(lineGap - lineGap * 2) - lineWidthHalf })
    gsap.to(".route-slide-line-left4", { x: -(lineGap - lineGap * 3) - lineWidthHalf })
    gsap.to(".route-slide-line-left5", { x: -(lineGap - lineGap * 4) - lineWidthHalf })
    setTimeout(() => {
      gsap.to(".route-slide-line-right", { x: frameWidth })
      gsap.to(".route-slide-line-left", { x: -frameWidth }).then(() => {
        gsap.set(".route-slide-wrapper", { opacity: 0, zIndex: -1 })
      })
    }, 1500)
  }
}
</script>

<template>
  <div class="frame-view" :style="{ width: frameStyle?.width }">
    <div class="frame" ref="frameRef" :style="frameStyle">
      <div class="route-slide-wrapper">
        <div class="route-slide-line route-slide-line-right route-slide-line-right1"></div>
        <div class="route-slide-line route-slide-line-left route-slide-line-left1"></div>
        <div class="route-slide-line route-slide-line-right route-slide-line-right2"></div>
        <div class="route-slide-line route-slide-line-left route-slide-line-left2"></div>
        <div class="route-slide-line route-slide-line-right route-slide-line-right3"></div>
        <div class="route-slide-line route-slide-line-left route-slide-line-left3"></div>
        <div class="route-slide-line route-slide-line-right route-slide-line-right4"></div>
        <div class="route-slide-line route-slide-line-left route-slide-line-left4"></div>
        <div class="route-slide-line route-slide-line-right route-slide-line-right5"></div>
        <div class="route-slide-line route-slide-line-left route-slide-line-left5"></div>
      </div>
      <RouterView v-slot="{ Component }">
        <transition @before-enter="slideEnter">
          <component :is="Component" />
        </transition>
      </RouterView>
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
  overflow: hidden;
}
.route-slide-wrapper {
  position: absolute;
  z-index: 9;
  top: 50%;
  left: 50%;
  overflow: hidden;
  transform: translate(-50%, -50%) rotate(-45deg);

  .route-slide-line {
    position: absolute;
    width: 100%;
    height: 11%;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    border-radius: 99999px;

    &:nth-child(1),
    &:nth-child(3),
    &:nth-child(5),
    &:nth-child(7),
    &:nth-child(9) {
      background-image: url(../assets/route_line1.png);
    }

    &:nth-child(2),
    &:nth-child(4),
    &:nth-child(6),
    &:nth-child(8),
    &:nth-child(10) {
      background-image: url(../assets/route_line2.png);
    }

    &:nth-child(1) {
      top: 0;
    }
    &:nth-child(3) {
      top: 20%;
    }
    &:nth-child(5) {
      top: 40%;
    }
    &:nth-child(7) {
      top: 60%;
    }
    &:nth-child(9) {
      top: 80%;
    }

    &:nth-child(2) {
      top: 10%;
    }
    &:nth-child(4) {
      top: 30%;
    }
    &:nth-child(6) {
      top: 50%;
    }
    &:nth-child(8) {
      top: 70%;
    }
    &:nth-child(10) {
      top: 90%;
    }
  }
}
</style>
