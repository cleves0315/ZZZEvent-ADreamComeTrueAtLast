<script setup lang="ts">
import { onMounted, onUnmounted } from "vue"
import { Howl } from "howler"
import ad from "/audio/play_bgm.mp3"

import { GameManager, KeyboardInputManager, HTMLActuator, LocalStorageManager } from "../libs/play"
import { useRouter } from "vue-router"

onMounted(() => {
  window.requestAnimationFrame(function () {
    new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager)
  })

  const sound = new Howl({
    src: [ad],
    autoplay: true,
    loop: true,
    volume: 1.0,
    onend: function () {},
  })

  sound.play()

  onUnmounted(() => {
    sound.stop()
  })
})

const router = useRouter()
const onBack = () => {
  router.push("/")
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

  <div class="play-view slide-enter-in">
    <div class="qq-block-bottom"></div>
    <div class="right-top"><span class="right-top-txt">结束关卡</span></div>
    <div class="right-bottom"></div>

    <div class="play-container">
      <div @click="onBack">back</div>
      <div class="heading">
        <div class="scores-container">
          <div class="score-container">0</div>
          <div class="best-container">0</div>
        </div>
      </div>

      <div class="above-game">
        <a class="restart-button">New Game</a>
      </div>

      <div class="game-container">
        <div class="game-message">
          <p></p>
          <div class="lower">
            <a class="keep-playing-button">Keep going</a>
            <a class="retry-button">Try again</a>
          </div>
        </div>

        <div class="grid-container">
          <div class="grid-row">
            <div class="grid-cell"></div>
            <div class="grid-cell"></div>
            <div class="grid-cell"></div>
            <div class="grid-cell"></div>
          </div>
          <div class="grid-row">
            <div class="grid-cell"></div>
            <div class="grid-cell"></div>
            <div class="grid-cell"></div>
            <div class="grid-cell"></div>
          </div>
          <div class="grid-row">
            <div class="grid-cell"></div>
            <div class="grid-cell"></div>
            <div class="grid-cell"></div>
            <div class="grid-cell"></div>
          </div>
          <div class="grid-row">
            <div class="grid-cell"></div>
            <div class="grid-cell"></div>
            <div class="grid-cell"></div>
            <div class="grid-cell"></div>
          </div>
        </div>

        <div class="tile-container"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import "../styles/play.scss";
.play-view {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.qq-block-bottom {
  position: absolute;
  bottom: 0;
  left: 2.1rem;
  width: 8rem;
  height: 1.22rem;
  z-index: 2;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url(../assets/qq_block_bottom.png);
}
.right-top {
  position: absolute;
  top: 0.5rem;
  right: 2.9rem;
  width: 4rem;
  height: 2rem;
  cursor: pointer;
  background-size: 100% auto;
  background-repeat: no-repeat;
  background-image: url(../assets/btn_bg_1.png);
  .right-top-txt {
    position: absolute;
    top: 0.43rem;
    left: 1.3rem;
    font-size: 0.4rem;
    color: #312d2e;
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
.play-container {
  position: absolute;
  left: 2.5rem;
  top: 0;
  width: 10.4rem;
  height: 11rem;
  z-index: 1;
  background-image: url(../assets/play_form.png);
  background-repeat: no-repeat;
  background-size: 100% auto;
}
.heading {
  position: absolute;
}
</style>
