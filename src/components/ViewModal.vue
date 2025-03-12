<script setup lang="ts"></script>

<template>
  <div class="view-modal">
    <div class="view-modal-mask"></div>
    <div class="view-modal-body">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.view-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
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
