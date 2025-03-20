<script setup lang="ts">
import { CSSProperties, onMounted, ref } from "vue"
import { ceilToTwo } from "../utils"
import { RouterView } from "vue-router"
import AnimatingBg from "./AnimatingBg.vue"

const viewportFrameRatio = 0.768
const frameAspectRatio = 2.3148175675675673
const remRatio = 0.04
const layoutRef = ref<HTMLDivElement>()
const frameStyle = ref<CSSProperties>()

const resizeRootFontSize = (clientWidth: number) => {
  document.documentElement.style.fontSize = ceilToTwo(clientWidth * remRatio) + "px"
}

const resizeFrame = () => {
  let winWidth = window.innerWidth
  let winHeight = window.innerHeight
  let frameWidth, frameHeight

  if (winWidth < winHeight) {
    // screen rotates 90deg
    window.isFrameRotated = true
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
    window.isFrameRotated = false
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

  if (layoutRef.value) {
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
  <div class="flexible-view" :style="{ width: frameStyle?.width }">
    <div class="layout" ref="layoutRef" :style="frameStyle">
      <AnimatingBg :style="{ width: frameStyle?.width, height: frameStyle?.height }" />
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
        <component :is="Component" />
      </RouterView>
    </div>
  </div>
</template>

<style scoped lang="scss">
.flexible-view {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.layout {
  position: absolute;
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
    border-radius: 999rem;

    &:nth-child(1),
    &:nth-child(3),
    &:nth-child(5),
    &:nth-child(7),
    &:nth-child(9) {
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA5gAAABhCAYAAACzvQ7xAAAACXBIWXMAAAsTAAALEwEAmpwYAAAE9GlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDEgNzkuYThkNDc1MzQ5LCAyMDIzLzAzLzIzLTEzOjA1OjQ1ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjQuNiAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjQtMTEtMjlUMTA6MzE6MDcrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI0LTExLTI5VDExOjAwOjA5KzA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI0LTExLTI5VDExOjAwOjA5KzA4OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozNzBlNTUxYi00Y2YxLTQwZmYtYmE4OS0yM2MyMDY0Nzg3MWEiIHhtcE1NOkRvY3VtZW50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);
    }

    &:nth-child(2),
    &:nth-child(4),
    &:nth-child(6),
    &:nth-child(8),
    &:nth-child(10) {
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA5gAAABhCAYAAACzvQ7xAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFw2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDEgNzkuYThkNDc1MzQ5LCAyMDIzLzAzLzIzLTEzOjA1OjQ1ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjQuNiAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjQtMTEtMjlUMTA6MzE6MDcrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI0LTExLTI5VDExOjAxOjQxKzA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI0LTExLTI5VDExOjAxOjQxKzA4OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDplM2UwMWEwMy05MzA1LTQyYzMtOTZlYy1lMjMzMGU5MTFiMDAiIHhtcE1NOkRvY3VtZW50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);
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
