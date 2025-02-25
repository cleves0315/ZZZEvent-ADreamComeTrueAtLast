<script setup lang="ts">
import { ref } from "vue"
import { getStorage, StorageKey } from "../utils/storage"

const isBgmMute = ref(getStorage(StorageKey.MUSIC_MUTED) ?? false)

const content = ref("")

const curUser = ref("left")

const userLeft = ref({
  name: "铃",
  avatar: "user_ling_to_right.png",
})
const userRight = ref({
  name: "哲",
  avatar: "user_zhe_to_left.png",
})

const writeText = (str: string) => {
  console.log("writeText")

  let text = str
  let charIndex = 0
  const typeText = () => {
    if (charIndex < text.length) {
      content.value += text.charAt(charIndex)
      charIndex++
      requestAnimationFrame(() => {
        setTimeout(typeText, 20)
      })
    } else {
      charIndex = 0
    }
  }
  typeText()
}

const handleMute = () => {
  isBgmMute.value = !isBgmMute.value
  localStorage.setItem(StorageKey.MUSIC_MUTED, isBgmMute.value)
}

const handleJump = () => {
  // typeText()
}

const handleNext = () => {
  writeText("按揭贷款啦就是看到了就开始垃圾看到了手机壳啦")
}
</script>

<template>
  <svg
    data-v-49463ad2=""
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    style="display: none"
  >
    <defs>
      <filter id="stroke-text-svg-filter-3">
        <feMorphology operator="dilate" radius="3.4359375"></feMorphology>
        <feComposite operator="xor" in="SourceGraphic"></feComposite>
      </filter>
    </defs>
  </svg>

  <div class="cinema-view" @click="handleNext">
    <div class="right-top-operator">
      <div
        class="operator-btn mute"
        :data-state="isBgmMute ? 'mute' : 'open'"
        @click="handleMute"
      ></div>
      <div class="operator-btn jump" @click="handleJump"></div>
    </div>
    <div class="right-bottom"></div>

    <div class="dialog-block">
      <div class="dialog-title" data-text="朱鸢">朱鸢</div>
      <div class="dialog-content" :data-text="content">{{ content }}</div>
      <div class="progress"></div>
    </div>

    <div
      class="user-left"
      :class="curUser === 'left' ? '' : 'hide'"
      :style="{ backgroundImage: `url(/src/assets/${userLeft.avatar})` }"
    ></div>
    <div
      class="user-right"
      :class="curUser === 'right' ? '' : 'hide'"
      :style="{ backgroundImage: `url(/src/assets/${userRight.avatar})` }"
    ></div>
  </div>
</template>

<style scoped lang="scss">
.cinema-view {
  width: 100%;
  height: 100%;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-image: url(../assets/cinema_bg.jpg);
}
.right-top-operator {
  position: absolute;
  top: 0.15rem;
  right: 3.2rem;
  width: 3.7rem;
  height: 2rem;
  z-index: 3;
  background-size: 100% auto;
  background-repeat: no-repeat;
  background-image: url(../assets/operator_wrap_1.png);

  .operator-btn {
    position: absolute;
    width: 1rem;
    height: 1rem;
    top: 0.45rem;
    background-size: 100% auto;
    background-repeat: no-repeat;
    cursor: pointer;

    &.mute {
      left: 0.7rem;
      &[data-state="mute"] {
        background-image: url(../assets/mute_ban_1.png);
      }
      &[data-state="open"] {
        background-image: url(../assets/mute_open_1.png);
      }
    }
    &.jump {
      left: 2.1rem;
      background-image: url(../assets/jump_btn_1.png);
    }
  }
}
.right-bottom {
  position: absolute;
  bottom: 0;
  right: 1.8rem;
  width: 7.7rem;
  height: 1.3rem;
  z-index: 3;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-image: url(../assets/blk_di_3.png);
}
.dialog-block {
  position: absolute;
  bottom: 0.3rem;
  left: 4.3rem;
  right: 4.3rem;
  height: 4.52rem;
  z-index: 5;
  background-size: 100% auto;
  background-repeat: no-repeat;
  background-image: url(../assets/dialog_bg.png);
  .dialog-title {
    position: absolute;
    font-size: 0.6rem;
    top: 0.8rem;
    left: 1.1rem;
    color: #fff;
    &::after {
      content: attr(data-text);
      position: absolute;
      left: 0;
      color: #61478b;
      z-index: 0;
      filter: url(#stroke-text-svg-filter-3);
    }
  }
  .dialog-content {
    position: absolute;
    font-size: 0.36rem;
    top: 2.1rem;
    left: 1.1rem;
    right: 1.1rem;
    color: #d9bfff;
    height: 1.65rem;
    overflow: hidden;
    text-align: justify;
    &::after {
      content: attr(data-text);
      position: absolute;
      left: 0;
      top: 0;
      color: #4e327a;
      z-index: 0;
      filter: url(#stroke-text-svg-filter-3);
    }
  }
}
@keyframes progress {
  0% {
    background-image: url(../assets/progress_1.png);
  }
  50% {
    background-image: url(../assets/progress_2.png);
  }
  100% {
    background-image: url(../assets/progress_1.png);
  }
}
.progress {
  position: absolute;
  right: 0.7rem;
  bottom: 0.8rem;
  width: 0.4rem;
  height: 0.31rem;
  background-size: 100% auto;
  background-repeat: no-repeat;
  animation: progress 1s infinite;
}
.user-left {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 2.5rem;
  width: 6.75rem;
  background-position: bottom;
  background-size: 100% auto;
  background-repeat: no-repeat;
  transition: filter 0.3s;
  &.hide {
    filter: brightness(0.6) contrast(0.8);
  }
}
.user-right {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 4.5rem;
  width: 5rem;
  background-position: bottom;
  background-size: 100% auto;
  background-repeat: no-repeat;
  &.hide {
    filter: brightness(0.6) contrast(0.8);
  }
}
</style>
