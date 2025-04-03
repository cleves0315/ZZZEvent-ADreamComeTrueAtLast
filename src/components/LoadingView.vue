<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"
import gsap from "gsap"
import { preloadResources, slideEnter } from "../utils"
import { useRouter } from "vue-router"
import { CinemaUserEnum } from "../router"
import assetsList from "../assets-list.json"

import loading_ic_0 from "../assets/loading_ic_0.png"
import loading_ic_1 from "../assets/loading_ic_1.png"

import { useStore } from "../stores"
import { useChatMarked } from "../hooks/useChatMark"
import isNumber from "lodash/isNumber"

const store = useStore()

const timer = ref()
let index = 1
let icIndex: 0 | 1 = 0
let end = false

const icCircle64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAACXBIWXMAAAAAAAAAAQCEeRdzAAAABGNJQ1ABBAABk7gAvQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABGdBTUEAALGPC/xhBQAAAblJREFUeJy9VstOwkAUHTYO/AEu1U+QvbrVDTEm0BXE7l0J+jX6C6Jr4qbgGoUoWxhQEjChRTaUjvdAq7xasaGd5KbtzJ1z7r3zOGXMpXHOWfL4dFtUOumvd3mjC7NKppNZ9rOKfhpXkidncc6jblC/LRKJ/LxnUmq0eKflpC4rRmssCdDVMC4NWSkWSrlM6jy2Cm+uY3dvh11eXO+bPamNP6Xsi5EngWP95kjC3+xKDfOBs5IIAx+N7oEcyJYhvKP3zIrmE86RQzTXEAE5NBCVH4LZrKh8gvAScwSZtBqlEj35zWApI8IBXlZRp2vEtzgrFrQcaroJAseA9/hQzgMf2zROu6i27iKvXTbCo/K/Ap+9PXeUwR/b1K8NWpasEz6jA3UbBIFjQ8Jn+vQkB0YCfJDoAZMYILECJrFCyyT4NRmGsbvqYZyTUE58oHfXffkKChvOLbygJ82N6AnhAG9JtGxlPCSHtm9lFBNlbANnSRkXND5BqZb+pfHC1niah/muGj/bkU2rMVq0PEX1YrQt7+hpHH7wx7xVeK4Nu87+71IgB31h1gjU0Kd3nYFv9E/+u8hvooAu7Rv/zp/+JplMEAAAAABJRU5ErkJggg=="

const animate = async () => {
  if (end) return
  gsap.set(`.icon-${index}`, {
    backgroundSize: ".35rem .35rem",
    backgroundPosition: "center center",
  })
  await gsap.to(`.icon-${index}`, { transform: "scaleX(0)", duration: 0.1 })
  gsap.set(`.icon-${index}`, {
    backgroundSize: "auto 100%",
    backgroundPosition: `-${index - 1}rem 0`,
    backgroundImage: `url(${icIndex === 0 ? loading_ic_0 : loading_ic_1})`,
  })

  await gsap.to(`.icon-${index}`, {
    transform: "scaleX(1.4)",
    duration: 0.1,
  })
  await gsap.to(`.icon-${index}`, {
    transform: "scaleX(1)",
    duration: 0.01,
  })

  index++

  if (index > 5) {
    animateEnd()
  } else {
    timer.value = setTimeout(animate, 200)
  }
}

const animateEnd = () => {
  index = 1
  setTimeout(() => {
    icIndex = icIndex === 0 ? 1 : 0
    animate()
  }, 1400)
}

const router = useRouter()

const { chatsMarked } = useChatMarked()

const preloadResEnd = async () => {
  await slideEnter()
  if (isNumber(chatsMarked.value[0].plot) && chatsMarked.value[0].plot !== 0) {
    router.replace("/home")
  } else {
    router.replace({ path: `/cinema/${CinemaUserEnum.zhuyuan0}` })
  }
}

onMounted(async () => {
  animate()
  const obj = await preloadResources(assetsList)
  store.setAssetList(obj)
  preloadResEnd()
})

onUnmounted(() => {
  end = true
  clearTimeout(timer.value)
  gsap.killTweensOf(".icon")
})
</script>

<template>
  <div class="loading-view" name="loading_bg">
    <div class="fairy" name="loading_fairy">
      <div class="fairy-eye"></div>
    </div>
    <div class="icon-wrap">
      <div
        v-for="item in 4"
        class="icon"
        :class="`icon-${item}`"
        :style="{ backgroundImage: `url(${icCircle64})` }"
      ></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.loading-view {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-image: url(../assets/loading_bg.jpg);

  .fairy {
    position: absolute;
    top: 2.5rem;
    left: 11.5rem;
    width: 2rem;
    height: 2rem;
    background-size: 100% auto;
    background-repeat: no-repeat;
    background-image: url(../assets/loading_fairy.png);
  }

  @keyframes moveEyes {
    0% {
      transform: translate(0, 0);
    }
    50% {
      transform: translate(0.1rem, 0.05rem);
    }
    100% {
      transform: translate(0.22rem, 0);
    }
  }

  .fairy-eye {
    position: absolute;
    left: 0.76rem;
    top: 0.86rem;
    width: 0.25rem;
    height: 0.25rem;
    animation: moveEyes 2s linear 1s infinite alternate forwards;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAAAAAAAAQCEeRdzAAAAAXNSR0IB2cksfwAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABGdBTUEAALGPC/xhBQAAAQxJREFUeJytk01uwjAQhb2DKyRHKj0a/8KbgiBBdAEScKHsHC8CFGGHX9llOhNACiiRCHSkt0hmvpHjvMdYqsZ8UoY1VLS0ng5tgDpcFdA76o35tMyy6qs5cH43UFXCRghAlpQw0Rlnuk3fuYP7nZEDMczywEeBhnmvPXQTmLenJVBQfRZOLakTy04/8KFCk3vsfJnVPoIKwwevOHxRLIzPtDDBqwu0sAGd4PjyAmT/Y8Ebn4AGY7F84xKl9dlugdYNzaL4BZrVjn7j1Ui1wkZS0OAtNBJVt+W5aOU5BuY5eJuy8q0G/NvFrXUMzDIPpB6GqUGzmYmkqJ6X8JnEWSZxPiaSlzhTD2dKaeYPYLtJnghr+18AAAAASUVORK5CYII=);
  }

  .icon-wrap {
    position: absolute;
    top: 5.3rem;
    left: 0;
    right: 0;
    height: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.3rem;
  }

  .icon {
    position: relative;
    width: 1rem;
    height: 1rem;
    background-repeat: no-repeat;
    // background-size: auto 100%;
    // background-position: -2rem 0;
    // background-image: url(../assets/loading_ic_0.png);
    // width: 0.35rem;
    // height: 0.35rem;
    background-size: 0.35rem 0.35rem;
    background-position: center center;
  }
}
</style>
