<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from "vue"
// @ts-ignore
import { GameManager, KeyboardInputManager, HTMLActuator, LocalStorageManager } from "../libs/play"
import { useRouter } from "vue-router"
import { ceilToTwo, slideEnter } from "../utils"
import { gsap } from "gsap"
import throttle from "lodash/throttle"
import { useBgm } from "../hooks/useBgm"
import { useChatMarked } from "../hooks/useChatMark"
import DynamicBg from "./DynamicBg.vue"
import { useStore } from "../stores"
import { CinemaUserEnum } from "../router"

const router = useRouter()

const store = useStore()

const { markGameEnd, chatsMarked } = useChatMarked()

const userDialogIdx = 0

const curChatMarked = computed(() => chatsMarked.value[userDialogIdx])

useBgm(store.assetList["play_bgm"])

const isOver = ref(false)

const showModal = ref(false)

const score = ref(0)

const targetScore = ref(20000)

const randomMultiplierDefault = [0, 0, 0]

const randomMultiplier = ref(randomMultiplierDefault.slice())

const readyMultiplier = computed(() => {
  for (let i = 0; i < randomMultiplier.value.length; i++) {
    if (randomMultiplier.value[i] <= 0) {
      return false
    }
  }
  return true
})

const isMultiplierEnabled = ref(false)

const multedScore = ref(0)

const percent = computed(() => {
  const num = Math.ceil((score.value / targetScore.value) * 100)
  return Math.min(num, 100)
})

const isFinish = computed((prev) => {
  const res = percent.value === 100
  if (!prev && res) {
    gsap.set(".target-score-success", { opacity: 0, width: "0rem", display: "block" })
    gsap.to(".target-score-success", { opacity: 1, width: "2.56rem", duration: 0.6 })

    gsap.set(".play-view-suc-tips", { display: "block" })
    gsap.set(".play-view-suc-tips-bg", { transform: "translateX(100%)" })
    gsap.set(".play-view-suc-tips-text", { opacity: 0 })
    gsap.to(".play-view-suc-tips-bg", { transform: "translateX(0)", duration: 1 })
    gsap.to(".play-view-suc-tips-text", { opacity: 1, duration: 1 })
  }
  if (res) {
    markGameEnd("zhuyuan", score.value)
  }
  return res
})

// toggleBlockLight
watchEffect(() => {
  const cls = ".block-light"
  if (isMultiplierEnabled.value) {
    gsap.to(cls, { opacity: 1, duration: 0.5 })
  } else {
    gsap.to(cls, { opacity: 0, duration: 0.5 })
  }
})

const handleGameOver = () => {
  isOver.value = true
  toggleModalState()
}

const handleUpdateScore = (e: any) => {
  score.value = parseFloat(e.detail.score)
}

const handleGenRandomMultiplier = (e: any) => {
  // [num] | [num, num] | [num, num, num]
  const numberList = e.detail.numberList

  let lastIdx = 2
  let num = numberList.pop()

  while (!!num) {
    randomMultiplier.value[lastIdx] = num

    num = numberList.pop()
    lastIdx--
  }
}

const handleEnableMultiplier = () => {
  isMultiplierEnabled.value = true
}

const handlePopupMultedScore = async (e: any) => {
  multedScore.value = e.detail.multedScore || 0
  const cls = ".popup-multiplier"

  isMultiplierEnabled.value = false
  randomMultiplier.value = randomMultiplierDefault.slice()

  gsap.set(cls, { transform: "scale(0)" })
  await gsap.to(cls, { opacity: 1, transform: "scale(1.1)", duration: 0.2 })
  await gsap.to(cls, { opacity: 1, transform: "scale(1)", duration: 0.03 })
  await gsap.to(cls, { opacity: 0, transform: "translateY(-50%)", duration: 0.5, delay: 1 })
}

const toggleModalState = throttle(
  async () => {
    showModal.value = !showModal.value

    if (showModal.value) {
      gsap.set(".play-view-modal", { display: "block" })
    }

    gsap.to(".play-view-modal-mask", { opacity: showModal.value ? 1 : 0, duration: 0.2 })
    await gsap.to(".play-view-modal-body", { opacity: showModal.value ? 1 : 0, duration: 0.2 })

    if (!showModal.value) {
      gsap.set(".play-view-modal", { display: "none" })
    }
  },
  500,
  { trailing: false },
)

onMounted(() => {
  window.requestAnimationFrame(function () {
    const gameManager = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager)
    window.addEventListener("ganmeOver", throttle(handleGameOver, 1000, { trailing: false }))
    gameManager.actuator.scoreContainer?.addEventListener("updateScore", handleUpdateScore)
    gameManager.actuator.scoreContainer?.addEventListener(
      "genRandomMultiplier",
      handleGenRandomMultiplier,
    )
    gameManager.actuator.scoreContainer?.addEventListener(
      "enableMultiplier",
      handleEnableMultiplier,
    )
    gameManager.actuator.scoreContainer?.addEventListener(
      "popupMultedScore",
      handlePopupMultedScore,
    )
  })
})

const onBack = async () => {
  toggleModalState()
  await slideEnter()
  if (isFinish.value && curChatMarked.value.plot !== 2) {
    router.replace({ path: `/cinema/${CinemaUserEnum.zhuyuan1}` })
  } else {
    router.replace("/home")
  }
}
</script>

<template>
  <svg
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
    <div class="play-view-suc-tips">
      <DynamicBg class="play-view-suc-tips-bg" name="play_suc_bg"></DynamicBg>
      <div class="play-view-suc-tips-text">目标达成可随时结算</div>
    </div>

    <div class="lighting-effects-wrap" v-show="readyMultiplier">
      <DynamicBg
        v-for="item in 3"
        :key="item"
        name="lighting_effect_a"
        class="lighting-effects-a"
      />
      <DynamicBg name="lighting_effects_b" class="lighting-effects-b" />
    </div>

    <DynamicBg class="play-view-random-number-wrap" name="random_number">
      <DynamicBg
        v-for="item in randomMultiplier"
        name="play_random_num"
        class="play-view-random-number v-random-number"
        :data-num="item"
      ></DynamicBg>
    </DynamicBg>
    <div class="enable-button-wrap">
      <DynamicBg
        name="btn_s_1"
        class="enable-multiplier-button"
        :data-disabled="!readyMultiplier || isMultiplierEnabled"
      ></DynamicBg>
      <DynamicBg
        v-if="readyMultiplier && !isMultiplierEnabled"
        name="btn_light"
        class="enable-multiplier-button-light"
      ></DynamicBg>
    </div>
    <div class="cover-box"></div>
    <DynamicBg class="right-bottom" name="blk_di_3"></DynamicBg>

    <DynamicBg name="play_bot_1" class="play-bot-avatar"></DynamicBg>
    <DynamicBg class="play-container" name="play_form">
      <DynamicBg name="block_light" class="block-light"></DynamicBg>
      <div class="popup-multiplier">
        <div
          class="multed-icon-add"
          :style="[
            {
              transform: `translateX(${ceilToTwo((-1 - Math.floor(String(multedScore).length / 2)) * 0.92 + 1.6) + 'rem'})`,
            },
          ]"
        ></div>
        <DynamicBg
          v-for="(item, idx) in String(multedScore)"
          :key="idx"
          name="play_random_num"
          class="multed-num v-random-number"
          :data-num="item"
          :data-index="idx"
          :style="[
            {
              transform:
                `scaleY(${item === '0' ? '1' : '0.8'})` +
                ` translateX(${ceilToTwo((idx - Math.floor(String(multedScore).length / 2)) * 0.92 + 1.6) + 'rem'})`,
            },
          ]"
        ></DynamicBg>
      </div>

      <div class="heading">
        <div class="scores-container">
          <div class="score-label" data-text="当前电费">当前电费</div>
          <div class="score-container">0</div>
          <div class="best-container" style="display: none">0</div>
          <div class="score-label-2" data-text="目标电费">目标电费</div>
          <div class="target-score-wrap">
            <div
              class="target-score-progress"
              :style="{ clipPath: `inset(0 ${100 - percent}% 0 0)` }"
            ></div>
            <div class="target-score-success"></div>
            <span class="target-score" :data-text="isFinish ? '已达成' : targetScore">{{
              isFinish ? "已达成" : targetScore
            }}</span>
          </div>
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
    </DynamicBg>
  </div>

  <div class="play-view-modal">
    <div class="play-view-modal-mask"></div>
    <DynamicBg class="play-view-modal-body" name="modal_bg_1">
      <div class="play-view-modal-body-title" data-text="确认要结算吗？">确认要结算吗？</div>
      <div class="play-view-modal-body-content">
        <div class="play-view-modal-body-content-row-1">
          <div class="play-view-modal-body-content-text" data-text="当前电费">当前电费</div>
          <div class="play-view-modal-body-content-value" :data-text="score">
            {{ score }}
          </div>
        </div>
        <div class="play-view-modal-body-content-row-2">
          <div class="play-view-modal-body-content-text" data-text="目标电费">目标电费</div>
          <div class="play-view-modal-body-content-value" :data-text="targetScore">
            {{ targetScore }}
          </div>
        </div>
        <div class="play-view-modal-body-content-tips">
          <div class="play-view-modal-body-content-tips-txt">
            目标电费尚未达成，结束关卡后将无法推进剧情也无法领取奖励
          </div>
        </div>
      </div>
      <div
        v-if="!isOver"
        class="play-view-modal-btn play-view-modal-btn-1 dc-button"
        data-index="1"
        @click="toggleModalState"
      >
        <div class="dc-button-text" data-text="取消">取消</div>
      </div>
      <div
        class="play-view-modal-btn play-view-modal-btn-2 dc-button"
        :class="isOver ? 'play-view-modal-btn-over' : ''"
        @click.once="onBack"
        data-index="2"
      >
        <div class="dc-button-text" data-text="确认">确认</div>
      </div>
    </DynamicBg>
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
  background-size: 100% 100%;
  background-repeat: no-repeat;
  // background-image: url(../assets/bg2.jpg);
}
.v-random-number {
  width: 0.9rem;
  height: 1.7rem;
  background-size: 100% auto;
  background-repeat: no-repeat;
  background-position: 0 -0.5rem;
  transform: scaleY(0.88);

  &[data-num="1"] {
    background-position: 0rem -5.7rem;
  }
  &[data-num="2"] {
    background-position: 0rem -8.3rem;
  }
  &[data-num="3"] {
    background-position: 0rem -10.9rem;
  }
  &[data-num="4"] {
    background-position: 0rem -13.46rem;
  }
  &[data-num="5"] {
    background-position: 0rem -16.15rem;
  }
  &[data-num="6"] {
    background-position: 0rem -18.78rem;
  }
  &[data-num="7"] {
    background-position: 0rem -21.4rem;
  }
  &[data-num="8"] {
    background-position: 0rem -24.04rem;
  }
  &[data-num="9"] {
    background-position: 0rem -26.65rem;
  }
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
  background-image: url(data:image/png;base64,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);
}
.right-top {
  position: absolute;
  top: 0.45rem;
  right: 2.8rem;
  width: 4.2rem;
  height: 1.8rem;
  z-index: 3;
  cursor: pointer;
  background-size: 100% auto;
  background-repeat: no-repeat;
  background-image: url(data:image/png;base64,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);
  .right-top-txt {
    position: absolute;
    top: 0.47rem;
    left: 1.3rem;
    font-size: 0.4rem;
    color: #312d2e;
  }
}
.play-view-suc-tips {
  display: none;
  position: absolute;
  top: 0.84rem;
  right: 6.54rem;
  width: 3.2rem;
  height: 1.8rem;

  .play-view-suc-tips-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: 100% auto;
    background-repeat: no-repeat;
  }

  .play-view-suc-tips-text {
    position: absolute;
    font-size: 0.22rem;
    color: #507012;
    top: 0.24rem;
    left: 0.85rem;
  }
}

.lighting-effects-wrap {
  @keyframes liveLightB {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  @keyframes liveLightA {
    0% {
      opacity: 1;
      transform: rotate(90deg) scale(1.2);
    }
    100% {
      opacity: 0;
      transform: rotate(90deg) scale(0.5);
    }
  }
  .lighting-effects-a {
    position: absolute;
    top: 2.1rem;
    right: 5rem;
    width: 3rem;
    height: 6rem;
    background-size: auto 100%;
    background-repeat: no-repeat;
    // -1rem -0.5rem
    background-position: -5rem 0;
    z-index: 9;
    transform: rotate(90deg) scale(1);
    animation: liveLightA 0.5s linear forwards;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }

  .lighting-effects-b {
    position: absolute;
    top: 1.5rem;
    right: 2.5rem;
    width: 8.5rem;
    height: 8rem;
    opacity: 0.4;
    background-size: 100% auto;
    background-repeat: no-repeat;
    animation: liveLightB 5s linear infinite;
  }
}

.play-view-random-number-wrap {
  position: absolute;
  top: 4.12rem;
  right: 4.36rem;
  width: 4.26rem;
  height: 2.26rem;
  background-size: 100% auto;
  background-repeat: no-repeat;

  .play-view-random-number {
    position: absolute;
    top: 0.3rem;
    &:nth-child(1) {
      left: 0.3rem;
    }
    &:nth-child(2) {
      left: 1.68rem;
    }
    &:nth-child(3) {
      left: 3.1rem;
    }
  }
}
.cover-box {
  position: absolute;
  top: 8.37rem;
  right: 7.74rem;
  width: 0.8rem;
  height: 0.3rem;
  background-color: #5e468b;
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
}
.play-container {
  position: absolute;
  left: 2.5rem;
  top: 0;
  width: 10.4rem;
  height: 11rem;
  z-index: 1;
  background-repeat: no-repeat;
  background-size: 100% auto;

  .block-light {
    opacity: 0;
    position: absolute;
    top: 2.5rem;
    left: 1rem;
    width: 8.33rem;
    height: 8.1rem;
    background-size: 100% auto;
    background-repeat: no-repeat;
  }
}
.popup-multiplier {
  opacity: 0;
  position: absolute;
  top: 4.2rem;
  // left: 1.6rem;
  width: 8.63rem;
  height: 1.7rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.02rem;
  z-index: 5;
  pointer-events: none;
}
.multed-icon-add {
  position: absolute;
  width: 0.9rem;
  height: 0.9rem;
  background-size: 100% auto;
  background-repeat: no-repeat;
  background-image: url(data:image/png;base64,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);
}
.multed-num {
  position: absolute;

  &[data-num="0"] {
    background-position: 0;
    transform: scaleY(1.1);
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAB9CAMAAADtP39JAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAERUExURUdwTHxanHhZoHZZopNiintZneSHSnZbluKGTLNxcYNemNqDU+OGSNOAWOCGTrh0bt6FT+GGTN6ET6lueeWIStiCVMd7YqNrfs14Q7l1baluev/mqOWISv/Uhv/LcuOERv/su+WHSf/FZ//Mdv/wwf/Tgv/Jb//Rfv/IbP/Wifvpu//uv//DZNaES//BYP/Gaf/OeeeJSPfhsuC5iN6DRv/mrP/osf/CYv/quNOTXf/alP/Yj//jo+SGSOmJR+eRU8t4QP/em9V9Q+vOn/zhsPHaq+PCk8BxPKdgMOibX5RSJo1XMI5SKbRoNfjWovzAasiiddSMVZ1rQuqqcdKwg5xaLPG6gvXHkOCKT7B+UrmQZhh9kO4AAAAbdFJOUwAzYUoTIvUH51GC5SLUka7wRWlCzLHHm/aGcBNSqF8AAAmaSURBVGjexZoJV+LMEoaHLaCIoONyHAOENSTBASLEDIuyyKrwMSxu//+H3KoOwZB0MAyec18EAimeVHVVN9LdP35sl9/rPTLI6/+xj/wAOz0+Pj87CxCdnZ0fn578M9Z7dHJ6DiiGYQ1iGAAj1rurd0cnx2cBZJXYDZXIGwxQd4J6ddwWEajXMe8Tl2g0GvF4vEFueNBoJD6hjpj+T14CGAn2wSQW3tWpyPwqS97TM0bHIW3+8jqZPK41mby+DAlVg5aYwOnRVuDRcUAPln0YvgBL5SRQmgiPOBW4QGX18JnzLW76T86ZFY/gVIIwCd9TCTRBmKVS4NSuNf2nZ+Sq4N/wleA4TlUVpVKpXKPguaIoqkqo6uPr8GHlZ+D4yAYY0BxEHkdwioYyqaIQKAdMvDq2JhW5Bj7MJ2hvg/uEIvNl5SYVeXK2Ar4+Et71FyJMdQJuArIUOLa0pfeYgf6ViA9foQG5L3lr5uP8gXgZOPXTYgYgRMyplWtnUhD58qB5eWKKOaCFjEDl2rEUFZEsSc+51xQzls3D625ASBFE/jgnyM24iYsNdq7sCESkJE2GJO6zI5OLicZwAm14vaMqENbrg9lJ31kJXXwRJZukQP2pdgWq6HEbWtJ/ECBp6drEjGWCA4VNlcLZCTpZiqzHDFKLmos2cUlyt9uVbdIG59U5i0W5LnNvCIN+69i4qEpc52P2NHvv2VxS4bgOOnkf8q2IPwNAjA8fJa5Cd6Eze34ePT/Pepydk48k3YEDvb9gptk53YOKIonT5aDf74+XHzLdSVUSscxLzCrbpHYabz3RJui0/D5ul+Pldv+9m7YN+w0LaJVt3zkGjc1ILQ8u3e030Zxt97tpu4bpvsU/G9IXvEeivXWn2SaDe7lpd1WIYxjH4eLnOjEw6shpm9rheu0yGTvLN5AaOlGSSf1o3UZLTGMu25WG2LuJEx/jN3ZtDdm7xYZkrgjxiiTmVpSUL4hlO2JlTSQ1vkr1FuLt2sdbOx/hspgarWuvUt2zN/6aCI3duSFE35p407FpdAzIAVHSiKR8fCGNKDkiSo6IWI43kz2J3RtS4i4gukiB33T3I6Y1YtBITO9BhK4qm4jlGznNXe9HLH838S9mJogd+2cQc/33e4hkqNBG8G8gljeI5b82Q48NsW6SaiQe4GBW/mMz9Fj7DAJaoCqqBoKnFhD/6ET/AfHRMfG6BRghmsnwfHEtXkFiAogHfo24g4+tDF9MxbLZXK6QXCtb2YNYzRaSedAd6LeuwvUeRCH/+5OkK7kX0crbiVivVzgHxLxjItRJnftGH4FXi7a+z0fCK8ZqToj/OSHWW1WBjxWSAmfJNepOe7jTDhxUDzqYSeWSd3kK8c4sB0R0sJhN5u9+fxMRHYzlAPhNRIhY4MFB7GjfQqzXq9FijvRdgNKI+qm1fue2EaEJMSUr2ztKrg0o3WobkTRhIZm3JyZ3IwKQNwCpxDyFaDs+moH5fGEPInxzrYAG5ZPmXliD98zKZ+2IFuC+xHo1YwImkwULsbADsQVl44CYdExUBCtwTyKfLZhFIeaSVis7YrFgtc3tQ6ykrMQChVhwTowVckYVyJ1C/DytW8acEXN0YpZitQsx+93EHIWYc05M5bJmUYlWq9T/k5iNVU3Eaiy7AzFLkRNiViOyFCJYx7Kx2OqJPFKIyESjmGYMR0XF8J+9gVjUzhtFJ1qsNoifvz6UbyL6txJjKQsxFbMn3gdNPsb+kRgrqtRfmkBMxVIpvOMf4lJUomaB53Vznk5UeTTYFJ1osQJi10LsptWM1TZFIVKUUdMdw6yCPvOhRim2RQuxSLGKqvrMx5pYRqIAAJNMxB4hWoxSwgbRd1HSjNVakaKqad6sSjOqqZpRYjWDRKbEbm2MHRHXgWjEMAPG7QX8LOW/JlID4eFHz6INRkwYiV4yt9eeylIdiHxx9aDdMCCtidhV+oxE3YavS/KUEK/I3N6vCAwVbRwqMkUefofzBhWLgpE4gfQVNwyIUaYiyX/aDbYU+YVEvwcLst2EgoziNXmDi2AeVbXpJlabHtFsTDe0abYTUOAHZLJZK58mtjpvVQYnDOLaitVQlioZig22TLNMiocQfWEy6zulm2euJXHeiCcSifgb1EOdZoKJQSJ77tLmmq+wIZs42S1QHGhx0mSIi37s/FFSaWFE4Tvho4kz7Ffa7LXXg7NS7f5C8yDDoxuZ1TPPC4okTl7mwzmuIlai63OZtU0Vgu43E3piIDWuCwybzMjXwGZTEJOKS5iPuEymVi3nM+CiJE77bWxGj7YK4F+FPV6I6IP5E5loS8H1GVyeqWYoasHA897EXh126aspHpJt4mSL9hmhda0oCvxcpJ2sKlDeY3Qx8ktfTfG7LnHJpzmeipLuRvTzCe7RqCAI0WjGcg6uVpGk3qyPmb7wrJelfG7i5HjWk6SKAJ83S0dZTwh1Lt19H7cxL1eu9dLZysn2AOLm6jSkjaA94BvmY4CtaHQRcuPW0j34kBHpmIhAcToYY38J/nIZliD9rqsIftuMB1NE1tDY8DkBXwnkQH+LnBfqAFzMxjhIMGHPxjKpzxNmcAQaLxGptMjHtwoMqhUuLS9mA9JdLty+jdVhjJvke7D86KYltVJFx7aqCpWflqfLgTZGHLq8pk0trsMQGTAGT+8dkTBrW3C1al3l0mLn44kA74OXHq9ln4znMkhGtcFoNu0Ck1PqOKtqYQm1WrVVAZ4EEY8AiIUT9vgseyD80JQRREJbPs8WXVHSlkXrZMa2ps/YVlstbdVU7N6+P43GxMNI2O2ibKqApgwHWSzL/mD0PPvodWURezOHeyDWwh0VaUmUO9PZ02jQhy+XEhsEIHVLhdflvsT0JMqE+TT7WHS6siyK3GrPB67miqIsd3vT96fn5+WYRMxcXNoAMTvuw3AE3UTmcvT8/ATY6WLR63Q6XVCn01tMP96fAAf+NctQNdCEhwC020ji9XnclyGmRJjN/ngwAipyDYLXo+Vg3G8THhO6dHtcW/bk+H3oZohhNShQATtYLkeAhttotATYuN9sl3E4LDFBcJCSZVPkHvfh5UWEYe9xCToO2HaTqE8e4WU5Dq0Hl4yEkOf6ch8WuInM8EUQqKX7Eu7bADUSDfiDA4DBtZhI6OISeT4n+7oI030I1FAwEsG9XKV7XSXczhUJXoQvDwnP4UYxv99LoEgFZy9CQVAEFAyGQgR26HZ7nPNWTIC6PBp2U25C2wm3guIGOx/BegiZCI9dPp/3n3fb+YmzGwLYdtr/ANkPCcpcFScJAAAAAElFTkSuQmCC) !important;
  }
}
.play-bot-avatar {
  position: absolute;
  top: 0.79rem;
  left: 4.44rem;
  width: 1.1rem;
  height: 2rem;
  background-size: 100% auto;
  background-repeat: no-repeat;
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
  width: 3rem;
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
  top: 2.1rem;
  left: 4.6rem;

  &::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    color: #8470a6;
    filter: url(#stroke-text-svg-filter-1);
  }
}

.target-score-wrap {
  position: absolute;
  top: 2.1rem;
  right: 1.4rem;
  width: 2.28rem;
  height: 0.4rem;
  background-size: 100% auto;
  background-repeat: no-repeat;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKEAAAAcCAYAAAAJBd8dAAAACXBIWXMAAAAAAAAAAQCEeRdzAAAAAXNSR0IB2cksfwAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABGdBTUEAALGPC/xhBQAABE5JREFUeJzt3G1MW1Ucx/FuLzQakyVqMjU6TQzOCItxI8MR7CNINodrkYfSljoNEdFBeVAYsNlxb9vbW+69wObYXKaGbOCcDzEOXAJI7BCnbg4Tl/gQHxOTvXAZL8ySuVJ+nnMLCGG+WNlosvybfF7epi++Oeee3nOuwTD9ue/uxwxFNnWN26wJTpMaLTWqF5hYqVG7TEhyeD/qX6ynIY9Zay60RtJW3pFmuOJn1Z1rDS5L+zMui3am2q5M7q+LoD8kYUiVMEhIkng/HwclvF4TQVWBEvNYOsZKTVLeyhUPzw9w9W3rDE5LR6HX1nFuzzYZvx0NIj4aAE4x4yJwhpAk8X5YR7ETAfzYG0T7CxF4rJ0/l5iUvAduXv1fhNsy1PQyqzbOA/x7kIU3JuD0gSa81ViLvTU+dPsISQJrh/fTs70O3729HTgp4MJAAOGKCNy2rtHnHmy5dzbCslxNqNmiTPEREGNtOLKjAfasalgyGmBOb9RZCLlKM+1YM+pRnF3Nbu9e1UM82xNC1WY17sjp9C5flp2I0GlSovvrZEyNihg/2IySnAYUrA+wYVOBN1fVlRNylWbacbOONmWK8Fob8FNfKy6NBKBURuA07u4zr61dsfymWwwGvgo+xhYh+FrEkdda8HRWG8pt2uyXELIYzzIemwr7434cb29lnQUw2C7h+Xzloju/W867q+xWFqEW46sYfCPgcIsf9g1hdjFFSK4dPqg5NoTQL/vZgiWAeFTEkCahYqNy0WvsqOARXh5UEhH27fDDkS2n/EeTG4/TJMPnaMKbjT6c79+Jf0ZEdL0sw2nWRhZEWEgRkuugPFfB5vUCTI/U46i/CTglYkCSUGJUJyhCsoQ0tuaQ0NO8k03LAoY1PcIYRUiWkKb3xTvjvfG1CO+PIiRLiiIkKUcRkpSjCEnKUYQk5RZGqFKEZGnxhyG9MxFqNBKSJVZuU7ElS8ahlkSEw6r+P+HCCOmxHbleXGYVFfkSPt+zC/hSwIdteoR/ztvA0NtKEZJrj4+ATpOCffUSvu8VEY8KmPgkAHFrBGVW5b05W7kEfCD4UZwj6xel+oeTGwffyuU0hvFZVxtwWsS5jwI4+IrMnyf/UZ55wDK7qTV+QsTZHj9efEpC8ROJC/UNijZCkjQdYFGOilpHEL++uwuXPhWxt0aGy6L97t7Y7Xn0ds8yg8s2d3u/gOOyiJcKZDZ8qny+JmRRyswKfHYZ0S5hent/EJWb1HiRrbPq/lWOxPZ+X/rcg06iHuIPh0TwKfr9tjCboiVCksL7GQiH8Ms7LMAv5h502j26Na31njlHPjMXHPmcZFMzv0fkixVCFuUrAbGomDjyWfk/Rz5nDr+7LUqRy6x9W21Xpt5g94j9koRhLaT/q01IckI4FpTYPWCE3eIpk25Lx0mnKfzkgsPv814DYlXXeKZfA8Lm8wl6DQhZHDXGOjo/8xoQhzXy0JVeA/Iv98uEfuCWLjoAAAAASUVORK5CYII=);

  .target-score-progress {
    position: absolute;
    top: 0.09rem;
    left: 0.1rem;
    right: 0.1rem;
    height: 0.25rem;
    background-size: 100% auto;
    background-repeat: no-repeat;
    background-image: url(data:image/png;base64,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);
  }

  .target-score-success {
    display: none;
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    right: -0.28rem;
    bottom: 0;
    z-index: 1;
    background-size: 2.56rem auto;
    background-repeat: no-repeat;
    background-image: url(data:image/png;base64,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);
  }

  .target-score {
    position: absolute;
    top: 0.06rem;
    right: 0.18rem;
    font-size: 0.24rem;
    color: #fff;
    z-index: 2;

    &::after {
      content: attr(data-text);
      position: absolute;
      top: 0;
      right: 0;
      color: #503d76;
      filter: url(#stroke-text-svg-filter-1);
    }
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
    background-image: url(data:image/png;base64,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);

    &::after {
      content: "";
      position: absolute;
      top: 0.16rem;
      right: 0.16rem;
      width: 2.8rem;
      height: 0.57rem;
      background-size: 100% auto;
      background-repeat: no-repeat;
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARcAAAA3CAMAAAAR1v5kAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABpUExURUdwTPhloPhkoPhloPhloPhkoPhloPhloPpenflkoPlkoPlloPhjn/hkoPhloPhloP3bTPhjouOXGPrTR/homuqqJ+WPKvB3bvdvkv3gav754vvFWfmQffPANv7qlPd5ieuCTf7yvPmoZ5FTOI8AAAAPdFJOUwC63u38Y6H2Dj7VfiDh5rkglhUAAAMnSURBVGje7ZvH0qswDIXpvdh0CIHA+z/kFcZJDDbOXaNfM1lm843OUcEyDCmCJHQ9M7L9+4cdmZ4bJoHxO4IwNlPbd3Ic4fh2asZh8JOKZ9nABAuWnY1teVoyQCVDReSLJtOQSWILJxVGxooTNZbQ9DX/o/TuZHwzVGnIjXTJQqvq9mCcyA1kLJaOSt6NY3d/MNYZTOCmWizzg5QrgoxJT2D02VKND0LKus1vDyaP3IPlRj+xkLJo7q8kACOYb2JqLJd2az9NhDxRcHEc81Oug9jXlOduJdOw9GVdvCoE+ZL78dtiQkvvuH0/9SCjAoO/QFhcSYHn6KylX5aeYJERk5K3J0yY6bBMwwDmQggWGUHYoT5dmOMOw5YtUKWLFguXPWGu3QWwLAMTEZPRjATL7jBXxWhz3C8WkBEWe9mEBCXponehOTjuZi0l4TJCYy8gJOhhwvSyEHHH5TJCUqXfQnLt/8CCqErvQnINz1cWovKAZZcRpVjQ+J4h2ws47kpIv3yx7M1unldYpOSYRqRs/SH6LxbyrJtxHkcMuyk+VRuyvbCtAuGFiOcLBHnAkLQiAZMZZ3upOBYpoJmZyBNJtbYlLt0FFjYnPbEM1f6ZC902uUw3pSgksnAsSKYk++wv0LnUWxRFXR6xbJuponnhMJhMqke0ahtIi6YRuSz7wg6aXiTDQCT3LwCGxUP0lqV/YsIC/Yvc71Lo36DlFbj0U79ZC54RCfpdxXzEGv7x0L9sWF4zmskR5qOreXoVsdQblo5iWkyp9y8HGb0LEar9y8W+bi6PWNoK0ZqBfUJS7XdFGT3RYdm/xaq+B9DqITpuM+eYsPAPSKrvR297wVaI9mZ3/+CYeHJrN5Y4C5GQLgqHedsLwwLWggrL5/u0XJJ4lUbouLn4nkHqYSiTEa7WX+xdLt5LMRlxx0WmoeN7qdP7OuBSonTc/Py+DsAcxqS5xtb680jlh6qWuGloG4SOC6VI9bBZeO9Nq/aFD4vqvffpPoDyH6oCrbwPYPck6SdlKDZrcdKre5K/+6PrSPi9Gi4ov+7V/u4btWT2e9js/gexdnZ5D/sPD3RdODefDvIAAAAASUVORK5CYII=);
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
    background-image: url(data:image/png;base64,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);

    &::after {
      content: "";
      position: absolute;
      top: 0.16rem;
      right: 0.16rem;
      width: 2.8rem;
      height: 0.57rem;
      background-size: 100% auto;
      background-repeat: no-repeat;
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARcAAAA3CAMAAAAR1v5kAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAACHUExURUdwTKRy/7R6/LR6+7R5/LR6+7R6/LR6+7N1/bR6+7R6+7R6+7R6+7R4+7R5+7R6/LR6+7R6+/3cS7N5/eOXFbZ88fvWSruC4t6TKv3eYueiHf765tCetfTPYOuuK/K/NfjOQf7mftiRTsOLzf71yMKCtuvBccaGo96vjs+Kd/7qlP7vq8mHkRwavbIAAAARdFJOUwAD6bo+3/P2Dvyl1X4gaViZ2UlKFgAAA35JREFUaN7tm9mOozAQRQlbIGSzDWYPIQlZ+/+/b8qGAAmG1rxSbfVIM2rNy1HdW7eMS9MGx9mY273h6cv5H90z9ltz42i/noVjrg1Lt12C47i2bhlr01n8RmVloWHSsbFWk2SAio4NSoNGBzJjxbJZWzipCDCutd4oS2ZhGvbEf2Rs7mhsw1SAcXaeO0UlCGYPxvV2Ay05W2uqWEiYZeH8wVhb5/+wnK+c3+dfMeQLzGJnTWoou1LKDxVBUDG7vseY3jSWnFJ6TE7zVxJ4jNlh2RjuBJbwnpfPmBc+Bi7ENTatuaztSSz8mV5ifvAfCAwG2vX6bTGmNem4NIZyARlFN4KBC7EaJTmrURUJx41flxjspfCjEAUW4q6cOufqE1jyMk2fVHQj/xTg4EJ0mXtHy0U67iu9lFRwSaIfLFzqghlzF4ElvoDjUl7L6IwEC4QYc7wZCccFLC/hLbWMQixcZEsayS4CSymx8FpGSLp0m2HUMmodV1KBsOtHFUHDRbTqrT4S/ZtGVMuowCQj6EhbbW+rMy54S4ulkRFjWNDYe21oL4yd75yW0J9BRPUPyOgGvwkIEjKuoXnK6A8npl25FEmUnbNM3E3hAONpuiL6SxZvy5X/4DzP8zjmVyQuo2v2sBHRHpDurzAnlbR44ABja8svLmEfS4/NM4UwU2AZqu1BvYQ5l+d45D0y8StNS+jW4L84LmEG/hLcDodDkiR+0nYjoSEYH48HwPIIUfQjfdCPWHCL/AjOoa0XLrDEEguWmdob5hcWVD+3W1VdO4cpAUuRoBGRzC/DvMsgv739l8s/5VNiOaEZkSDvKuYjGfgzTj+CHWA5o5kcYT4am6fv/VhXOy6a8UjM0+r7l1pGtYroERsWcf+ivK+D0bGLd+9GhOeeQX5CUgmpL6PacQNEty/yflf5PYCF1w/HxXRX9/4eoPp+1E5JIvr7jzMqLM33I0XBwFDNO2vB5LhduWiLxcBhWFBfweBz3KZJj7xnaGR0bKI/Lizde4bvDMOI6NIYHZd8vH/5fi8FXRpf9G8naXP0fZ1ILygdV5jLx/u6z/eYoKOTsJYfhFgmH6oyUkUIHVeBRUip996bBdUDVfSvLVfx3lvEmN5+gLibwoZFvR+gfe6TMGwaGt0n0eRWFtL9o+XE/pHQ0t++2giYv/3GETLdPqw9+3VYe3wf9h8os9G/mYsPCQAAAABJRU5ErkJggg==);
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
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAxYAAACyBAMAAAAt9UTxAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAkUExURUdwTMam+Mam+Mal98am+FE5fMen+E01eF1Fibma6qGE0IBkrfhgvtsAAAAFdFJOUwD2wSpxuWI+PwAABFRJREFUeNrtmsFOIkEQhjthX6BnDfcB49lFHwAXXoEwWU9jNp2Mngn7ApN18U4WOa9RPGtAX267ewYXELzRNcl+3w2O9aXqr2pQap2TbiPWsH/iRvdEfUStG+u6qRvYO6nWUfd4t4rThk41ZQolo64bnZ0q4jotERQddXapSKlO4N6ob5fxKaY2AmyTUStVZNkEgrCU8T7AvxZRMZm9XkMA5q+zwoY+fBcWXkV2O897vf4Q9s6gl9w8FKHR2TqhHvP+YNCDIAwHyct4y5RqubbIHnNMBKTfL2SkzXdtkU3zIQUKayNZuMa4WG2MlvvmFhXh51TiM2OlMWpHri3mqBCQcT5ebwyfFvd9KiPBaK0xamf202VObIuQ3NnqH7y9fvi2QIVgY6TtleS+/ElRJBujubLQ0hZy8T36l95uRGW0hRzXdpXS7bcRNWWJkmNgDz5dDCm3Rc0ZUYLX92i5SblDjxElyo9xGRguLhhR4kPKb7UttqgqDCn/WOvi4gkXoi7OxyZ1gRFz6MkHhj33oiK6r4gL4cB49uHtovs3I0p4SP3y4e3+dPAHF8J88y7sGpU9UQxh3C9KTfWFS68a11762a20rFGVWKQOnAvWKHme3YER8wJShaV24Q4M54JaiC+13sUR50VFDowLxalXCdyxpzQuqnJ40xe4AFzgAnCBC8AFLgAXuABc4AJwgQvABeACF4ALXAAucAG4wAXgAheAC1wALnBBMXABuMAF4AIXgAtcAC5wAbjABeACF4ALXOACF4ALXAAucAG4wAXgAheAC1wALnABuABc4AJwgQvABS4AF7gAXOACcIELwAUuKAYuABe4AFzgAnCBC8AFLgAXuABc4AJwgQtc4AJwgQvABS4AF7gAXOACcIELwMV/6kLjgr6AVawLrY6sC0pRhb64cC6m1EKchXMRG3PVpxbCDKyLSJ3hogo8G3PgXFz+pBbC/LhzLr4Yk+FC3MXYpJ9Vy7p4ohjCnFsXTXVqD4w/HBjCfDPGtNUnjr2KnN1tVTtikZJfae0adXGs3IHBIlWBNSpSyi215okhJTqiXHQfWBd2kTL3uBB1MTJujVI+vAkM2bhY+OhWPry59qQvPR/dRWDMGVKyI8q4uCgCY8qQEh5RTe/CBQZDSpDEjijd9i7chWHuh9REiKEbUdGxehtSnHtybWEPPVOMqGJIcWKIJndajihVO/ONgQwRFb4tvqslrTqrlNgS9WLetihVnnsmmxPfAsF9M15J7mV6m9scGcFVJA/rbWEbw6212RQZwVUszEZblImRPeZDAjxgbA+Tl/FmW5SNYcxj3sdGMBODUsV6Wyj/FwSXGfO8N4QQ9JKbB1/ztKM2+FrImMxeryEEr7OJr7g53FSxnFImm2QT2D/j0oTZnFD+JaSUAUGJOmoLp8ioigono05xgpLuUmFlNDT1CYhu7FRhA7wba3QEEqGj7rH6iJNuw+qAvRM1uicKqspfuAk0O4oVCrEAAAAASUVORK5CYII=);

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

    &[data-index="1"] {
      left: 0.5rem;
    }
    &[data-index="2"] {
      right: 0.5rem;

      &.play-view-modal-btn-over {
        left: 50%;
        right: unset;
        transform: translateX(-50%);
      }
    }
  }
}

.enable-button-wrap {
  position: absolute;
  top: 7rem;
  right: 3.2rem;
  width: 2.4rem;
  height: 2.5rem;

  .enable-multiplier-button {
    position: absolute;
    width: 2.4rem;
    height: 2.5rem;
    cursor: pointer;
    background-size: 100% auto;
    background-repeat: no-repeat;
    z-index: 1;

    &[data-disabled="true"] {
      filter: brightness(0.6) contrast(0.8);
    }
  }

  @keyframes live {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.3);
    }
    70% {
      transform: scale(1.3);
    }
    100% {
      transform: scale(1);
    }
  }
  .enable-multiplier-button-light {
    position: absolute;
    width: 100%;
    height: 100%;
    background-size: 100% auto;
    background-repeat: no-repeat;
    animation: live 1.5s linear infinite;
  }
}
</style>
