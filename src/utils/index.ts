import { gsap } from "gsap"

export const ceilToTwo = (num: number, decimal = 2) => {
  const factor = Math.pow(10, decimal) // 计算10的幂
  const rounded = Math.ceil(num * factor) / factor // 向上取整
  return rounded.toFixed(decimal) // 返回指定小数位的字符串
}

export const slideEnter = (): Promise<string> => {
  const frameElm = document.querySelector(".frame")
  if (frameElm) {
    const frameWidth = frameElm.clientWidth // important!!!
    const lineWidth = frameWidth / 10
    const lineWidthHalf = lineWidth / 2
    const lineGap = lineWidth * 2
    gsap.set(".route-slide-wrapper", {
      width: frameWidth,
      height: frameWidth,
      opacity: 1,
      zIndex: 99,
    })

    gsap.set(".route-slide-line-right", { x: frameWidth })
    gsap.set(".route-slide-line-left", { x: -frameWidth })

    return new Promise((resolve) => {
      gsap.to(".route-slide-line-right1", { x: lineGap - lineGap * 4 + lineWidthHalf })
      gsap.to(".route-slide-line-right2", { x: lineGap - lineGap * 3 + lineWidthHalf })
      gsap.to(".route-slide-line-right3", { x: lineGap - lineGap * 2 + lineWidthHalf })
      gsap.to(".route-slide-line-right4", { x: lineGap - lineGap + lineWidthHalf })
      gsap.to(".route-slide-line-right5", { x: lineGap + lineWidthHalf })

      gsap.to(".route-slide-line-left1", { x: -lineGap - lineWidthHalf })
      gsap.to(".route-slide-line-left2", { x: -(lineGap - lineGap) - lineWidthHalf })
      gsap.to(".route-slide-line-left3", { x: -(lineGap - lineGap * 2) - lineWidthHalf })
      gsap.to(".route-slide-line-left4", { x: -(lineGap - lineGap * 3) - lineWidthHalf })
      gsap
        .to(".route-slide-line-left5", { x: -(lineGap - lineGap * 4) - lineWidthHalf })
        .then(() => resolve("done"))

      setTimeout(() => {
        gsap.to(".route-slide-line-right", { x: frameWidth })
        gsap.to(".route-slide-line-left", { x: -frameWidth }).then(() => {
          gsap.set(".route-slide-wrapper", { opacity: 0, zIndex: -1 })
        })
      }, 1500)
    })
  } else {
    return Promise.reject("frame not found")
  }
}
