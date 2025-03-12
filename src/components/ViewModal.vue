<script setup lang="ts">
import { useModal } from "../hooks/useModal"
const { toggleModal } = useModal()
</script>

<template>
  <div class="view-modal">
    <div class="view-modal-mask"></div>
    <div class="view-modal-body">
      <div class="view-modal-close" @click="toggleModal"></div>
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

  .view-modal-close {
    position: absolute;
    top: 0.3rem;
    right: -1.1rem;
    width: 2.8rem;
    height: 1.2rem;
    z-index: -1;
    cursor: pointer;
    background-size: 100% auto;
    background-repeat: no-repeat;
    background-image: url("../assets/btn_close.png");
  }

  .view-modal-body {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
