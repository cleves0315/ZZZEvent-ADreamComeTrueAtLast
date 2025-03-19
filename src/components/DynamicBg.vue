<script setup lang="ts">
import { computed, useAttrs } from "vue"
import { useStore } from "../stores"
import { Assets } from "../assets-list"

interface Props {
  name?: Assets
}

const attrs = useAttrs()

const { name } = defineProps<Props>()

const store = useStore()

const assets = computed(() => store.assetList)

const getBackgroundStyle = (name?: Assets) => {
  return name ? { backgroundImage: `url(${assets.value[name]})` } : undefined
}
</script>

<template>
  <div :style="getBackgroundStyle(name)" v-bind="$attrs">
    <slot></slot>
  </div>
</template>
