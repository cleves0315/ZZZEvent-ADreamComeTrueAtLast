<script setup lang="ts">
import { onMounted, ref } from "vue"

const ratio = 2.3148175675675673
const frameRef = ref<HTMLDivElement>()
const frameStyle = ref({})

const resizeFrame = () => {
  const winWidth = window.innerWidth
  const winHeight = window.innerHeight
  const winRatio = winWidth / winHeight

  // console.log(winWidth, winHeight, winRatio)

  // console.log(winRatio > ratio)
  if (frameRef.value) {
    if (winRatio > ratio) {
      frameStyle.value = {
        width: Math.floor(winHeight * ratio) + "px",
        height: "100%",
      }
    } else {
      frameStyle.value = {
        width: "100%",
        height: Math.floor(winWidth / ratio) + "px",
      }
    }
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
  <div class="frame" ref="frameRef" :style="frameStyle"></div>
</template>

<style scoped>
.frame {
  position: relative;
  background-image: url("../assets/default_bg2.jpg");
  background-repeat: no-repeat;
  background-size: 100% 100%;
}
</style>
