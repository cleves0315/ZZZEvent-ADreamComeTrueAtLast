<script setup lang="ts">
import { computed, ref } from "vue"
import DynamicBg from "./DynamicBg.vue"
import {
  arrowBtm64,
  botAvatar64,
  icA64,
  icD64,
  icS64,
  icSLight64,
  icW64,
  space64,
  icALight64,
  icStar64,
} from "../contants"
import { isMobile } from "../utils"

export type GuidePosition =
  | "reply"
  | "play"
  | "play-2"
  | "play-score"
  | "play-elect"
  | "multip"
  | "multip-miss-one"
  | "multip-finish"
  | "multip-start"
  | "multip-started"
  | "award"

interface Props {
  position?: GuidePosition | undefined
  closeByMask?: boolean
  visible?: boolean
}

const { position, visible } = defineProps<Props>()

const emits = defineEmits(["click", "start"])

const ismobile = isMobile()

const tipsText = ismobile ? "点击任意位置继续" : "按任意键继续"

const positionStyle = {
  reply: [
    {
      top: 7.3,
      left: 8.5,
      width: 7.4,
      height: 2.1,
    },
  ],
  play: [
    {
      top: 2.7,
      left: 3.5,
      width: 8.4,
      height: 7.7,
    },
  ],
  "play-2": [
    {
      top: 2.7,
      left: 3.5,
      width: 8.4,
      height: 7.7,
    },
  ],
  "play-score": [
    {
      top: 8.1,
      left: 4.2,
      width: 2,
      height: 2,
    },
    {
      top: 0.9,
      left: 6.9,
      width: 5.5,
      height: 1.3,
    },
  ],
  "play-elect": [
    {
      top: 1.8,
      left: 6.9,
      width: 4.8,
      height: 0.9,
    },
  ],
  multip: [
    {
      top: 4.1,
      left: 17.6,
      width: 1.7,
      height: 2.4,
    },
    {
      top: 6.6,
      left: 16.1,
      width: 3.5,
      height: 2.6,
    },
  ],
  "multip-miss-one": [
    {
      top: 4.1,
      left: 16.1,
      width: 4.7,
      height: 2.4,
    },
  ],
  "multip-finish": [
    {
      top: 4.1,
      left: 16.1,
      width: 4.7,
      height: 2.4,
    },
  ],
  "multip-start": [
    {
      top: 4.1,
      left: 16.1,
      width: 4.7,
      height: 2.4,
    },
  ],
  "multip-started": [
    {
      top: 4.1,
      left: 16.1,
      width: 4.7,
      height: 2.4,
    },
  ],
  award: [
    {
      top: 6.8,
      left: 17.8,
      width: 3.7,
      height: 3.4,
    },
  ],
}

const s = computed(() => {
  if (!position) return
  return positionStyle[position].map(({ top, height, left, width }, index) => {
    if (index === 0) {
      return {
        "--top": top + "rem",
        "--left": left + "rem",
        "--width": width + "rem",
        "--height": height + "rem",
      }
    } else {
      return {
        "--top2": top + "rem",
        "--left2": left + "rem",
        "--width2": width + "rem",
        "--height2": height + "rem",
      }
    }
  })
})

const overlapY = ref(false)

const overlap = ref(false)

const isMinLTop = ref(false)

const c = computed(() => {
  if (!position) return
  const cur = positionStyle[position]
  if (cur.length === 1) return

  const { height, left, top, width } = cur[0]
  const { height: height2, left: left2, top: top2, width: width2 } = cur[1]

  const minTop = Math.min(top, top2)
  const minTLeft = top < top2 ? left : left2
  const minTWidth = top < top2 ? width : width2
  const minTHeight = top < top2 ? height : height2
  const minLeft = Math.min(left, left2)
  const minLWidth = left < left2 ? width : width2
  const minLTop = left < left2 ? top : top2
  const minLHeight = left < left2 ? height : height2
  const maxTop = Math.max(top, top2)
  const maxTLeft = top > top2 ? left : left2
  const maxTWidth = top > top2 ? width : width2
  const maxTHeight = top > top2 ? height : height2
  const maxLeft = Math.max(left, left2)
  const maxLTop = left > left2 ? top : top2
  const maxLWidth = left > left2 ? width : width2
  const maxLHeight = left > left2 ? height : height2
  const minRLeft = Math.min(left + width, left2 + width2)
  const maxRLeft = Math.max(left + width, left2 + width2)

  overlapY.value = maxLeft < minLeft + minLWidth
  overlap.value = maxLeft + maxLWidth < minLeft + minLWidth
  isMinLTop.value = minLTop < maxLTop

  return {
    "--min-top": minTop + "rem",
    "--min-t-left": minTLeft + "rem",
    "--min-t-width": minTWidth + "rem",
    "--min-t-height": minTHeight + "rem",
    "--min-left": minLeft + "rem",
    "--min-l-width": minLWidth + "rem",
    "--min-l-top": minLTop + "rem",
    "--min-l-height": minLHeight + "rem",
    "--max-top": maxTop + "rem",
    "--max-t-left": maxTLeft + "rem",
    "--max-t-width": maxTWidth + "rem",
    "--max-t-height": maxTHeight + "rem",
    "--max-left": maxLeft + "rem",
    "--max-l-top": maxLTop + "rem",
    "--max-l-width": maxLWidth + "rem",
    "--max-l-height": maxLHeight + "rem",
    "--min-r-left": minRLeft + "rem",
    "--max-r-left": maxRLeft + "rem",
  }
})

const windowNum = computed(() => (position ? positionStyle[position].length : 0))

// watchEffect(async () => {
//   if (windowNum.value > 0) {
//     gsap.set(".guide-container", { display: "block", opacity: 0 })
//     gsap.to(".guide-container", { opacity: 1, duration: 0.5 })
//   } else {
//     await gsap.to(".guide-container", { opacity: 0, duration: 0.5 })
//     gsap.set(".guide-container", { display: "none" })
//   }
// })

const handleClick = () => {
  emits("click")
}

const handleStart = () => {
  position === "multip-start" && emits("start")
}
</script>

<template>
  <div
    v-if="!!windowNum && visible"
    class="guide-container"
    :class="position"
    :style="s"
    @click="handleClick"
  >
    <div class="guide-1" v-if="windowNum === 1">
      <div class="guide-mask guide-l"></div>
      <div class="guide-mask guide-t"></div>
      <div class="guide-mask guide-r"></div>
      <div class="guide-mask guide-b"></div>
    </div>
    <div
      class="guide-2"
      :class="[overlapY ? 'overlap-y' : '', isMinLTop ? 'min-l-top' : '', overlap ? 'overlap' : '']"
      v-else="windowNum === 2"
      :style="c"
    >
      <div class="guide-mask guide-l-l"></div>
      <div class="guide-mask guide-r-r"></div>
      <div class="guide-mask guide-t-t"></div>
      <div class="guide-mask guide-b-b"></div>
      <div class="guide-mask guide-c-c"></div>
      <div class="guide-mask guide-c-l"></div>
      <div class="guide-mask guide-c-r"></div>
    </div>

    <div v-if="position === 'reply'" class="reply-tips tips-popup">
      回复代理人的消息吧
      <div class="r-icon" :style="{ backgroundImage: `url(${icStar64})` }"></div>
    </div>
    <div
      v-else-if="position === 'award'"
      class="reply-tips tips-popup"
      :style="{ top: '8.6rem', left: '14.9rem' }"
    >
      有奖励可以领取啦
      <div class="r-icon" :style="{ backgroundImage: `url(${icStar64})` }"></div>
      <div class="play-score-text">点击领取</div>
    </div>
    <template v-else-if="position === 'play'">
      <div class="play-tips tips-popup">
        <div class="p-icon" :style="{ backgroundImage: `url(${botAvatar64})` }"></div>
        <div>
          主人，这是2个<span class="m-text">电费单元</span
          >，它们会沿着划动方向移动到最边缘，建议您试试向下滑动
        </div>

        <div v-if="!ismobile">
          <div class="key-t-text">按</div>
          <div class="dirc-wrap" :style="{ top: '1rem', left: '4.2rem' }">
            <div class="dirc-item dirc-w" :style="{ backgroundImage: `url(${icW64})` }"></div>
            <div class="dirc-item dirc-a" :style="{ backgroundImage: `url(${icA64})` }"></div>
            <div class="dirc-item dirc-s" :style="{ backgroundImage: `url(${icSLight64})` }"></div>
            <div class="dirc-item dirc-d" :style="{ backgroundImage: `url(${icD64})` }"></div>
          </div>
          <div class="key-t-text key-t-text-r">向下滑动</div>
        </div>
      </div>
      <div class="play-tips-arrow" :style="{ backgroundImage: `url(${arrowBtm64})` }"></div>
    </template>
    <template v-else-if="position === 'play-2'">
      <div class="play-tips tips-popup">
        <div class="p-icon" :style="{ backgroundImage: `url(${botAvatar64})` }"></div>
        <div>
          此外，<span class="m-text">相同的电费单元</span>碰撞在一起时会合成一个新单元并使<span
            class="m-text"
            >数字翻倍</span
          >，建议现在向左滑
        </div>
        <div v-if="!ismobile">
          <div class="key-t-text">按</div>
          <div class="dirc-wrap" :style="{ top: '1rem', left: '4.2rem' }">
            <div class="dirc-item dirc-w" :style="{ backgroundImage: `url(${icW64})` }"></div>
            <div class="dirc-item dirc-a" :style="{ backgroundImage: `url(${icALight64})` }"></div>
            <div class="dirc-item dirc-s" :style="{ backgroundImage: `url(${icS64})` }"></div>
            <div class="dirc-item dirc-d" :style="{ backgroundImage: `url(${icD64})` }"></div>
          </div>
          <div class="key-t-text key-t-text-r">向左滑动</div>
        </div>
      </div>

      <div
        class="play-tips-arrow play-tips-arrow-left"
        :style="{ backgroundImage: `url(${arrowBtm64})` }"
      ></div>
    </template>
    <template v-else-if="position === 'play-score'">
      <div class="play-score-tips tips-popup">
        <div class="p-icon" :style="{ backgroundImage: `url(${botAvatar64})` }"></div>
        <div>
          合成新电费单元可以<span class="m-text">获得电费</span>，您刚刚用2+2为我合成了4点电费
        </div>

        <div class="play-score-text">{{ tipsText }}</div>
      </div>
    </template>
    <template v-else-if="position === 'play-elect'">
      <div class="play-score-tips tips-popup" :style="{ top: '3.3rem' }">
        <div class="p-icon" :style="{ backgroundImage: `url(${botAvatar64})` }"></div>
        <div>这里是<span class="m-text">目标电费</span>，达成目标即可完成关卡。加油，主人！</div>
        <div class="play-score-text">{{ tipsText }}</div>
      </div>
    </template>
    <template v-else-if="position === 'multip'">
      <div class="play-score-tips tips-popup" :style="{ top: '7.3rem', left: '9.9rem' }">
        <div class="p-icon" :style="{ backgroundImage: `url(${botAvatar64})` }"></div>
        <div>
          每合成<span class="m-text">5</span>次，都会提供1个「<span class="m-text">电费加倍</span
          >」倍率数字
        </div>
        <div class="play-score-text">{{ tipsText }}</div>
      </div>
    </template>
    <template v-else-if="position === 'multip-miss-one'">
      <div class="play-score-tips tips-popup" :style="{ top: '4.9rem', left: '9.9rem' }">
        <div class="p-icon" :style="{ backgroundImage: `url(${botAvatar64})` }"></div>
        <div>「电费加倍」倍率共有3位，还差最后一位，继续合成吧！</div>
        <div class="play-score-text">{{ tipsText }}</div>
      </div>
    </template>
    <template v-else-if="position === 'multip-finish'">
      <div class="play-score-tips tips-popup" :style="{ top: '4.9rem', left: '9.9rem' }">
        <div class="p-icon" :style="{ backgroundImage: `url(${botAvatar64})` }"></div>
        <div>集齐3位数了！这就是你本次获得的「<span class="m-text">电费加倍</span>」倍率</div>
        <div class="play-score-text">{{ tipsText }}</div>
      </div>
    </template>
    <template v-else-if="position === 'multip-start'">
      <div class="play-score-tips tips-popup" :style="{ top: '7.7rem', left: '13.1rem' }">
        <div class="p-icon" :style="{ backgroundImage: `url(${botAvatar64})` }"></div>
        <div>
          <span v-if="!isMobile()">
            按<img alt="" class="space-icon" :src="space64" :style="{ margin: '0 .1rem' }" />
          </span>
          <span v-else>点击按钮</span>
          使用「电费加倍」！下次合成时获取的电费将乘以该倍率！
        </div>
        <div class="play-score-text">
          <span v-if="!ismobile"
            >按<img
              alt=""
              class="space-icon"
              :src="space64"
              :style="{ margin: '0 .1rem' }"
            />键</span
          >
          <span v-else-if="ismobile">点击按钮继续</span>
        </div>
      </div>
      <div
        class="enable-button-wrap"
        @click.stop="handleStart"
        :style="{ pointerEvents: 'initial' }"
      >
        <DynamicBg name="btn_s_1" class="enable-multiplier-button"></DynamicBg>
        <DynamicBg name="btn_light" class="enable-multiplier-button-light"></DynamicBg>
      </div>
    </template>
    <template v-else-if="position === 'multip-started'">
      <div class="play-score-tips tips-popup" :style="{ top: '7.7rem', left: '13.1rem' }">
        <div class="p-icon" :style="{ backgroundImage: `url(${botAvatar64})` }"></div>
        <div>
          推荐<span class="m-text">在合成高电费单元前使用，「电费加倍」</span
          >，可获得超多电费，更快完成目标！
        </div>
        <div class="play-score-text">
          {{ tipsText }}
        </div>
      </div>
      <div
        class="enable-button-wrap"
        @click.stop="handleStart"
        :style="{ pointerEvents: 'initial' }"
      >
        <DynamicBg
          :data-disabled="true"
          name="btn_s_1"
          class="enable-multiplier-button"
        ></DynamicBg>
      </div>
    </template>

    <div class="guide-view-1"></div>
    <div v-if="windowNum > 1" class="guide-view-2"></div>
  </div>
</template>

<style scoped lang="scss">
.guide-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  pointer-events: none;

  --bg-color: rgba(0, 0, 0, 0.6);

  .guide-mask {
    position: absolute;
    background-color: var(--bg-color);
    pointer-events: initial;
  }

  .guide-1 {
    .guide-l {
      top: 0;
      bottom: 0;
      left: 0;
      width: var(--left);
    }
    .guide-t {
      top: 0;
      left: var(--left);
      width: var(--width);
      height: var(--top);
    }
    .guide-r {
      top: 0;
      bottom: 0;
      right: 0;
      left: calc(var(--left) + var(--width));
    }
    .guide-b {
      bottom: 0;
      left: var(--left);
      width: var(--width);
      height: calc(100% - var(--top) - var(--height));
    }
  }

  .guide-view-1 {
    position: absolute;
    top: var(--top);
    left: var(--left);
    width: var(--width);
    height: var(--height);
    box-shadow: 0 0rem 0.2rem 0.2rem var(--bg-color) inset;
  }

  .guide-2 {
    .guide-l-l {
      top: 0;
      bottom: 0;
      left: 0;
      width: var(--min-left);
    }
    .guide-r-r {
      top: 0;
      bottom: 0;
      right: 0;
      left: calc(var(--max-r-left));
    }
    .guide-t-t {
      top: 0;
      left: var(--min-t-left);
      width: var(--min-t-width);
      height: var(--min-top);
    }
    .guide-b-b {
      bottom: 0;
      top: calc(var(--max-top) + var(--max-t-height));
      left: var(--max-t-left);
      width: var(--max-t-width);
    }

    &.overlap-y {
      .guide-c-c {
        left: var(--max-left);
        width: calc(var(--min-r-left) - var(--max-left));
        top: calc(var(--min-top) + var(--min-t-height));
        height: calc(var(--max-top) - calc(var(--min-top) + var(--min-t-height)));
      }

      .guide-c-l {
        width: calc(var(--max-left) - var(--min-left));
      }

      .guide-c-r {
        left: calc(var(--min-r-left));
        width: calc(var(--max-r-left) - calc(var(--min-r-left)));
      }
    }
    &.min-l-top {
      .guide-c-l {
        top: calc(var(--min-l-top) + var(--min-l-height));
        height: unset;
        bottom: 0;
      }

      .guide-c-r {
        top: 0;
        height: var(--max-l-top);
        bottom: unset;
      }
    }
    &.overlap {
      .guide-c-r {
        top: 0;
        height: var(--min-l-top);
        bottom: unset;
      }
    }

    .guide-c-c {
      top: 0;
      bottom: 0;
      left: calc(var(--min-left) + var(--min-l-width));
      width: calc(var(--max-left) - var(--min-left) - var(--min-l-width));
    }

    .guide-c-l {
      width: var(--min-l-width);
      left: var(--min-left);
      top: 0;
      height: var(--min-l-top);
      bottom: unset;
    }

    .guide-c-r {
      left: var(--max-left);
      width: var(--max-l-width);
      top: calc(var(--max-l-top) + var(--max-l-height));
      height: unset;
      bottom: 0;
    }
  }

  .guide-view-2 {
    position: absolute;
    top: var(--top2);
    left: var(--left2);
    width: var(--width2);
    height: var(--height2);
    box-shadow: 0 0rem 0.2rem 0.2rem var(--bg-color) inset;
  }

  .tips-popup {
    position: absolute;
    padding: 0.1rem 0.25rem;
    box-shadow: 0 0.1rem 0.2rem 0.1rem rgba(0, 0, 0, 0.1);
    background-color: #ddd0ff;
    border-radius: 99rem;
    border: 0.05rem solid #feeafd;
    font-size: 0.28rem;
    color: #7e6da6;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;

    .m-text {
      flex-shrink: 0;
      color: #ff6924;
    }
  }
  .key-t-text {
    position: absolute;
    top: 1.6rem;
    left: 4rem;
    color: #fdf2ff;
    font-size: 0.28rem;

    &.key-t-text-r {
      left: 5.3rem;
      width: 2rem;
    }
  }

  .reply-tips {
    top: 6.6rem;
    left: 8.8rem;

    .r-icon {
      width: 0.4rem;
      height: 0.4rem;
      position: absolute;
      bottom: -0.1rem;
      left: -0.14rem;
      background-size: 100% auto;
      background-repeat: no-repeat;
    }
  }

  .play-tips {
    border-radius: 0.3rem;
    top: 8rem;
    left: 12.4rem;
    width: 6.1rem;
    padding-left: 0.6rem;
  }
  .p-icon {
    width: 1rem;
    height: 1rem;
    position: absolute;
    top: -0.6rem;
    left: -1.8em;
    background-size: 100% auto;
    background-repeat: no-repeat;
  }
  .play-tips-arrow {
    position: absolute;
    width: 1.1rem;
    height: 2.6rem;
    background-size: 100% auto;
    background-repeat: no-repeat;
    top: 5.3rem;
    left: 9.55rem;

    &.play-tips-arrow-left {
      transform: rotate(90deg);
      top: 6.2rem;
      left: 7rem;
    }
  }

  .play-score-tips {
    top: 2.8rem;
    left: 7.3rem;
    width: 6.1rem;
    padding-left: 0.6rem;
    border-radius: 0.3rem;
  }
  .play-score-text {
    position: absolute;
    bottom: -0.6rem;
    right: 0;
    color: #fdf2ff;
    font-size: 0.28rem;
  }
}
</style>
