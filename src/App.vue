<script setup lang="ts">
import { onMounted } from "vue"
import FlexibleView from "./components/FlexibleView.vue"
import { preloadResources } from "./utils"
import { useStore } from "./stores"

const store = useStore()

document.ondblclick = function (e) {
  e.preventDefault()
}

onMounted(async () => {
  const obj = await preloadResources()
  store.setAssetList(obj)
})
</script>

<template>
  <div class="app-container">
    <FlexibleView />
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
