<script setup lang="ts">
import { onMounted } from "vue"
import FrameView from "./components/FrameView.vue"
import { ceilToTwo } from "./utils"

const remRatio = 0.052083333333333336

const resizeRootFontSize = () => {
  const winWidth = window.innerWidth
  document.documentElement.style.fontSize = ceilToTwo(winWidth * remRatio) + "px"
}

onMounted(() => {
  resizeRootFontSize()
  window.addEventListener("resize", () => {
    resizeRootFontSize()
  })
})
</script>

<template>
  <div class="container">
    <FrameView />
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  background-color: #342c5f;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
