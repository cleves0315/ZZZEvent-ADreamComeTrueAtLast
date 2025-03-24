<script setup lang="ts">
import { computed, StyleValue, useAttrs } from "vue"
import { useStore } from "../stores"
import { Assets } from "../assets-list"

interface Props {
  name?: Assets
  style?: StyleValue
}

const attrs = useAttrs()

const { name, style } = defineProps<Props>()

const store = useStore()

const assets = computed(() => store.assetList)

console.log("style: ", style)

const getBackgroundStyle = (name?: Assets) => {
  return name ? { backgroundImage: `url(${assets.value[name]})` } : undefined
}
</script>

<template>
  <div :style="[getBackgroundStyle(name), style]" v-bind="$attrs">
    <slot></slot>
  </div>
</template>
