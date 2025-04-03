<script setup lang="ts">
import { CSSProperties, ref, StyleValue, watchEffect } from "vue"
import { useRoute } from "vue-router"
import { useStore } from "../stores"

import defaultBg from "../assets/default_bg2.jpg"

const store = useStore()

const { style } = defineProps({
  style: {
    type: Object as () => CSSProperties,
    required: true,
  },
})

const route = useRoute()

const resPath = ref()

const posterPath = ref("")

const cls = ref<StyleValue>()

watchEffect(async () => {
  switch (route.path) {
    case "/":
      resPath.value = "/video/main.mp4"
      cls.value = { transform: "scale(1)" }

      posterPath.value = defaultBg
      break
    case "/home":
      resPath.value = store.assetList["zhuyuan_actor"]
      cls.value = {}

      posterPath.value = store.assetList["loading_bg"]
      break
    case "/play":
      resPath.value = store.assetList["zhuyuan_actor_in_play"]
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
    :poster="posterPath"
    webkit-playsinline
    playsinline
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
