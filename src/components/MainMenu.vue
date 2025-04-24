<script setup lang="ts">
import { useRouter } from "vue-router"

import { useBoolean } from "../hooks/useBoolean"
import ShareModal from "./ShareModal.vue"
import { computed } from "vue"
import { slideEnter } from "../utils"
import { useStore } from "../stores"
import { icTopHLignt64 } from "../contants"

const router = useRouter()

const [visShare, { toggle: toggleShare }] = useBoolean()

const store = useStore()

const asstLength = computed(() => Object.keys(store.assetList).length)

// const loadingAssets = [
//   "loading_bg.jpg",
//   "loading_fairy.png",
//   "loading_ic_0.png",
//   "loading_ic_1.png",
// ]

// onMounted(async () => {
//   if (!asstLength) {
//     const obj = await preloadResources(loadingAssets)
//     store.setAssetList(obj)
//   }
// })

const handleShare = () => {
  toggleShare()
}

const onStart = async () => {
  // if (asstLength.value > loadingAssets.length) {
  if (asstLength.value > 0) {
    await slideEnter()
    router.push("/home")
  } else {
    router.push("/loading")
  }
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
        <feMorphology operator="dilate" radius="1.4359375"></feMorphology>
        <feComposite operator="xor" in="SourceGraphic"></feComposite>
      </filter>
    </defs>
  </svg>

  <div class="main-view">
    <div
      class="main-share"
      :style="{ backgroundImage: `url(${icTopHLignt64})` }"
      @click="handleShare"
    ></div>
    <img class="main-title" src="/main_title.png" alt="title" />
    <div class="main-subtitle">
      约定的聚餐近在眼前，突发全员爽约危机！ 好消息，您只需付出一点点额外电费，即可消除烦恼。
    </div>
    <div class="main-tips">
      <div data-text="完成全部关卡，在活动内成就列表领取奖励道具" class="main-tips-1">
        完成全部关卡，在活动内成就列表领取奖励道具
      </div>
      <div
        data-text="绳网等级≥8级，在主线序章·幕间中解锁「活动」功能后即可参与"
        class="main-tips-2"
      >
        绳网等级≥8级，在主线序章·幕间中解锁「活动」功能后即可参与
      </div>
    </div>
    <img class="main-reward" src="/main_reward.png" alt="reward" />
    <div class="main-btns">
      <div class="main-btn-start" @click="onStart">启动游戏</div>
    </div>

    <ShareModal :visible="visShare" @click-by-mask="toggleShare" />
  </div>
</template>

<style scoped lang="scss">
.main-view {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.main-share {
  position: absolute;
  top: -0.02rem;
  right: 3rem;
  width: 1.84rem;
  height: 2.13rem;
  cursor: pointer;
  z-index: 3;
  background-size: 100% 100%;
  background-repeat: no-repeat;

  &::after {
    content: "";
    position: absolute;
    width: 0.9rem;
    height: 0.9rem;
    left: 0.57rem;
    top: 0.69rem;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    background-position: center;
    background-image: url(data:image/png;base64,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);
  }
}

.main-title {
  position: absolute;
  width: 6.53rem;
  height: 2.94rem;
  left: 15.38rem;
  top: 1.82rem;
  z-index: 3;
}

.main-subtitle {
  position: absolute;
  width: 6.04rem;
  height: 1.19rem;
  left: 15.59rem;
  top: 4.61rem;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
  background-image: url(data:image/png;base64,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);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 0.66rem 0.05rem 1.27rem;
  color: #48297a;
  font-size: 0.24rem;
  z-index: 3;
}

.main-tips {
  position: absolute;
  left: 3.49rem;
  bottom: 0.59rem;
  z-index: 3;
}

.main-tips-1 {
  color: #fff;
  font-size: 0.28rem;
  position: absolute;
  z-index: 0;
  position: relative;
  z-index: 3;

  &::after {
    content: attr(data-text);
    position: absolute;
    left: 0;
    color: #000;
    z-index: -1;
    filter: url(#stroke-text-svg-filter-3);
  }
}

.main-tips-2 {
  color: #8e7fd8;
  font-size: 0.24rem;
  position: absolute;
  z-index: 0;
  position: relative;
  margin-top: 0.06rem;
  z-index: 3;

  &::after {
    content: attr(data-text);
    position: absolute;
    color: #000;
    z-index: -1;
    left: 0;
    filter: url(#stroke-text-svg-filter-3);
  }
}

.main-btns {
  position: absolute;
  right: 3.3rem;
  bottom: 0.41rem;
  display: flex;
  z-index: 3;
}

.main-btn-start {
  width: 2.92rem;
  height: 1.02rem;
  cursor: pointer;
  font-size: 0.32rem;
  color: #2c2c2c;
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  padding: 0 0.35rem 0.15rem;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
  background-image: url(data:image/png;base64,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);
  z-index: 3;
}

.main-reward {
  position: absolute;
  width: 7.68rem;
  height: 1.72rem;
  left: 13.93rem;
  top: 7.54rem;
  z-index: 3;
}
</style>
