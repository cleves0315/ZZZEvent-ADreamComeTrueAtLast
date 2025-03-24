<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue"
import { useZIndex } from "../hooks/useZIndex"
import { generateRandomString } from "../utils"
import gsap from "gsap"

interface Props {
  visible: boolean
}

const index = useZIndex()

const { visible } = defineProps<Props>()

const randomStr = generateRandomString()

const mounted = ref(false)

onMounted(() => {
  mounted.value = true
})

watchEffect(async () => {
  const cls = `.v-view-modal[data-name='${randomStr}']`

  if (!mounted.value) {
    return
  }

  if (visible) {
    gsap.set(cls, { display: "block" })
  }

  gsap.to(`${cls} .view-modal-mask`, { opacity: visible ? 1 : 0, duration: 0.2 })
  await gsap.to(cls + " .view-modal-body", { opacity: visible ? 1 : 0, duration: 0.2 })

  if (!visible) {
    gsap.set(cls, { display: "none" })
  }
})
</script>

<template>
  <div class="v-view-modal" :data-name="randomStr" :style="{ zIndex: index }">
    <div class="view-modal-mask"></div>
    <div class="view-modal-body">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.v-view-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: none;

  .view-modal-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
  }

  .view-modal-body {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
