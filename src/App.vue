<script setup lang="ts">
import FlexibleView from "./components/FlexibleView.vue"
document.ondblclick = function (e) {
  e.preventDefault()
}
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
