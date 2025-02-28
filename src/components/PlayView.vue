<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"
import { Howl } from "howler"
import ad from "/audio/play_bgm.mp3"

import { GameManager, KeyboardInputManager, HTMLActuator, LocalStorageManager } from "../libs/play"
import { useRouter } from "vue-router"
import { slideEnter } from "../utils"
import { gsap } from "gsap"

const router = useRouter()

const showModal = ref(false)

const toggleModalState = async () => {
  showModal.value = !showModal.value
  if (showModal.value) {
    gsap.set(".play-view-modal", { display: "block" })
  }
  gsap.to(".play-view-modal-mask", { opacity: showModal.value ? 1 : 0, duration: 0.2 })
  await gsap.to(".play-view-modal-body", { opacity: showModal.value ? 1 : 0, duration: 0.2 })

  if (!showModal.value) {
    gsap.set(".play-view-modal", { display: "none" })
  }
}

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

const onBack = async () => {
  toggleModalState()
  await slideEnter()
  router.back()
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
        <feMorphology operator="dilate" radius="2.4359375"></feMorphology>
        <feComposite operator="xor" in="SourceGraphic"></feComposite>
      </filter>
    </defs>
  </svg>
  <svg
    data-v-49463ad2=""
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    style="display: none"
  >
    <defs>
      <filter id="stroke-text-svg-filter-1">
        <feMorphology operator="dilate" radius="0.4359375"></feMorphology>
        <feComposite operator="xor" in="SourceGraphic"></feComposite>
      </filter>
    </defs>
  </svg>

  <div class="play-view slide-enter-in">
    <div class="qq-block-bottom"></div>
    <div class="right-top" @click="toggleModalState">
      <span class="right-top-txt">结束关卡</span>
    </div>
    <div class="right-bottom"></div>

    <div class="play-bot-avatar"></div>
    <div class="play-container">
      <div class="heading">
        <div class="scores-container">
          <div class="score-label" data-text="当前电费">当前电费</div>
          <div class="score-container">0</div>
          <div class="best-container" style="display: none">0</div>
          <div class="score-label-2" data-text="目标电费">目标电费</div>
        </div>
      </div>

      <div class="above-game" style="display: none">
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

  <div class="play-view-modal">
    <div class="play-view-modal-mask"></div>
    <div class="play-view-modal-body">
      <div class="play-view-modal-body-title" data-text="确认要结算吗？">确认要结算吗？</div>
      <div class="play-view-modal-body-content">
        <div class="play-view-modal-body-content-row-1">
          <div class="play-view-modal-body-content-text" data-text="当前电费">当前电费</div>
          <div class="play-view-modal-body-content-value" data-text="32131230">32131230</div>
        </div>
        <div class="play-view-modal-body-content-row-2">
          <div class="play-view-modal-body-content-text" data-text="目标电费">目标电费</div>
          <div class="play-view-modal-body-content-value" data-text="32131230">32131230</div>
        </div>
        <div class="play-view-modal-body-content-tips">
          <div class="play-view-modal-body-content-tips-txt">
            目标电费尚未达成，结束关卡后将无法推进剧情也无法领取奖励
          </div>
        </div>
      </div>
      <div class="play-view-modal-btn play-view-modal-btn-1" @click="toggleModalState">
        <div class="play-view-modal-btn-txt" data-text="取消">取消</div>
      </div>
      <div class="play-view-modal-btn play-view-modal-btn-2" @click="onBack">
        <div class="play-view-modal-btn-txt" data-text="确认">确认</div>
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
  height: 1.5rem;
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
.play-bot-avatar {
  position: absolute;
  top: 0.79rem;
  left: 4.44rem;
  width: 1.1rem;
  height: 2rem;
  background-size: 100% auto;
  background-repeat: no-repeat;
  background-image: url(../assets/play_bot_1.png);
}
.score-label {
  position: absolute;
  font-size: 0.46rem;
  color: #fff;
  top: 1.45rem;
  left: 4.6rem;

  &::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    color: #5d497c;
    filter: url(#stroke-text-svg-filter-3);
  }
}

.score-container {
  position: absolute;
  color: #ffd263;
  font-size: 0.46rem;
  top: 1.45rem;
  right: 0.9rem;
  width: 2rem;
  text-align: right;

  .score-addition {
    position: absolute;
    top: -0.35rem;
    left: 0.5rem;
    padding: 0.03rem 0.17rem;
    color: #fff;
    font-size: 0.24rem;
    background-color: #ed6869;
    border-radius: 99rem;

    &::after {
      content: attr(data-text);
      position: absolute;
      top: 0.03rem;
      left: 0.17rem;
      color: #db6a6a;
      filter: url(#stroke-text-svg-filter-1);
    }
  }
}

.score-label-2 {
  position: absolute;
  font-size: 0.28rem;
  color: #fff;
  top: 2.17rem;
  left: 4.6rem;

  &::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    color: #5d497c;
    filter: url(#stroke-text-svg-filter-1);
  }
}

.play-view-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: none;

  .play-view-modal-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
  }

  .play-view-modal-body {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8.8rem;
    height: 7.2rem;
    background-size: 100% auto;
    background-repeat: no-repeat;
    background-image: url(../assets/modal_bg_1.png);
  }

  .play-view-modal-body-title {
    position: absolute;
    top: 0.45rem;
    left: 0.5rem;
    right: 0;
    font-size: 0.52rem;
    color: #fff;

    &::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      color: #60478b;
      filter: url(#stroke-text-svg-filter-3);
    }
  }

  .play-view-modal-body-content-row-1 {
    position: absolute;
    top: 1.6rem;
    left: 0.44rem;
    right: 0.44rem;
    height: 0.94rem;
    background-size: 100% auto;
    background-repeat: no-repeat;
    background-image: url(../assets/modal_row_bg_1.png);

    &::after {
      content: "";
      position: absolute;
      top: 0.16rem;
      right: 0.16rem;
      width: 2.8rem;
      height: 0.57rem;
      background-size: 100% auto;
      background-repeat: no-repeat;
      background-image: url(../assets/modal_row_val_bg_1.png);
    }
  }

  .play-view-modal-body-content-text {
    position: absolute;
    top: 0.2rem;
    left: 0.35rem;
    font-size: 0.4rem;
    color: #fff;

    &::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      color: #60478b;
      filter: url(#stroke-text-svg-filter-3);
    }
  }

  .play-view-modal-body-content-value {
    position: absolute;
    top: 0.27rem;
    right: 0.32rem;
    font-size: 0.28rem;
    color: #fff;
    z-index: 1;
    width: 2rem;
    text-align: right;

    &::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      right: 0;
      color: #e56da0;
      filter: url(#stroke-text-svg-filter-1);
    }
  }

  .play-view-modal-body-content-row-2 {
    position: absolute;
    top: 2.7rem;
    left: 0.44rem;
    right: 0.44rem;
    height: 0.94rem;
    background-size: 100% auto;
    background-repeat: no-repeat;
    background-image: url(../assets/modal_row_bg_1.png);

    &::after {
      content: "";
      position: absolute;
      top: 0.16rem;
      right: 0.16rem;
      width: 2.8rem;
      height: 0.57rem;
      background-size: 100% auto;
      background-repeat: no-repeat;
      background-image: url(../assets/modal_row_bg_2.png);
    }

    .play-view-modal-body-content-value {
      &::after {
        color: #a780d4;
      }
    }
  }

  .play-view-modal-body-content-tips {
    position: absolute;
    top: 3.84rem;
    left: 0.44rem;
    right: 0.44rem;
    height: 1.8rem;
    background-size: 100% auto;
    background-repeat: no-repeat;
    background-image: url(../assets/modal_row_tips_bg_1.png);

    .play-view-modal-body-content-tips-txt {
      position: absolute;
      top: 0.52rem;
      left: 0.38rem;
      right: 0.38rem;
      font-size: 0.32rem;
      color: #ede2ff;
      line-height: 0.4rem;

      &::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        color: #341c58;
        filter: url(#stroke-text-svg-filter-3);
      }
    }
  }

  .play-view-modal-btn {
    position: absolute;
    bottom: 0.4rem;
    width: 3.8rem;
    height: 0.91rem;
    background-size: 100% auto;
    background-repeat: no-repeat;
    cursor: pointer;

    &.play-view-modal-btn-1 {
      left: 0.5rem;
      background-image: url(../assets/modal_btn_1.png);
    }
    &.play-view-modal-btn-2 {
      right: 0.5rem;
      background-image: url(../assets/modal_btn_2.png);
    }

    .play-view-modal-btn-txt {
      position: absolute;
      top: 0.2rem;
      left: 1.5rem;
      font-size: 0.35rem;
      color: #2b2c2b;
      font-style: italic;
    }
  }
}
</style>
