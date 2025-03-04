<script setup lang="ts">
import { CSSProperties, defineProps, ref, watchEffect } from "vue"
import { useRoute } from "vue-router"

const { style } = defineProps({
  style: {
    type: Object as () => CSSProperties,
    required: true,
  },
})

const route = useRoute()

const resPath = ref()

watchEffect(() => {
  switch (route.path) {
    case "/home":
      resPath.value = "/src/assets/zhuyuan_actor.mp4"
      break
    case "/play":
      resPath.value = "/src/assets/zhuyuan_actor_in_play.mp4"
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
    :style="{ width: style?.width, height: style?.height }"
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
