<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div class="container">
    <div></div>
    <HelloWorld msg="Vite + Vue" />
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  background-image: url('./assets/console.png');
  background-repeat: no-repeat;
  /* background-size: 100% auto; */
  background-size: auto 100%;
  background-position: center;
}
</style>
