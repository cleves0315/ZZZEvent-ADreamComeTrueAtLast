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
  <div class="play-view slide-enter-in">
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
.play-container {
  position: absolute;
  left: 3.5rem;
  bottom: 1rem;
  width: 8rem;
  height: 8rem;
  background-image: url(../assets/play_form.png);
  background-repeat: no-repeat;
  background-size: 100% 100%;
}
.heading {
  position: absolute;
}
.grid-container {
  // position: absolute;
  // top: 2.4rem;
  // left: 1.4rem;
  // width: 5.3rem;
  // height: 5.1rem;
}
// .elm-item {
//   width: 1.3rem;
//   height: 1.3rem;
//   background-color: red;
//   border-radius: 0.2rem;
// }
</style>
