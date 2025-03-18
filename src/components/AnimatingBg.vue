<script setup lang="ts">
import { CSSProperties, defineProps, ref, StyleValue, watchEffect } from "vue"
import { useRoute } from "vue-router"

const { style } = defineProps({
  style: {
    type: Object as () => CSSProperties,
    required: true,
  },
})

const route = useRoute()

const resPath = ref()

const cls = ref<StyleValue>()

watchEffect(() => {
  switch (route.path) {
    case "/":
      resPath.value = "/video/main.mp4"
      cls.value = { transform: "scale(1)" }
      break
    case "/home":
      resPath.value = "/video/zhuyuan_actor.mp4"
      cls.value = {}
      break
    case "/play":
      resPath.value = "/video/zhuyuan_actor_in_play.mp4"
      cls.value = {}
      break

    default:
      resPath.value = ""
      break
  }
})
</script>

<template>
  <video
    class="mv"
    :src="resPath"
    autoplay
    loop
    muted
    poster="../assets/default_bg2.jpg"
    playsinline
    webkit-playsinline
    preload="auto"
    disable-picture-in-picture="true"
    :style="[{ width: style?.width, height: style?.height }, cls]"
  ></video>
</template>

<style scoped>
.mv {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transform: scale(1.085);
}
</style>
