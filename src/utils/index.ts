import { gsap } from "gsap"

export const ceilToTwo = (num: number, decimal = 2) => {
  const factor = Math.pow(10, decimal)
  const rounded = Math.ceil(num * factor) / factor
  return rounded.toFixed(decimal)
}

export const loadImageAsBlob = async (imageUrl: string) => {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    return blobUrl
  } catch (error) {
    console.error("Error loading image as blob:", error)
    return ""
  }
}

export const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export const slideEnter = (): Promise<string> => {
  const frameElm = document.querySelector(".layout")
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
    return Promise.reject("layout not found")
  }
}

import assetsList from "../assets-list.json"
import { Assets } from "../assets-list"

export const preloadResources = async () => {
  // @ts-ignore
  const obj: Record<Assets, string> = {}

  assetsList.forEach(async (asset: string) => {
    const [name, file] = asset.split(".") as [Assets, string]
    obj[name] = ""

    const loadAssets = async ({ name, file }: { name: Assets; file: string }) => {
      let path
      switch (file) {
        case "png":
          path = await import(`../assets/${name}.png`)
          break
        case "jpg":
          path = await import(`../assets/${name}.jpg`)
          break
        case "svg":
          path = await import(`../assets/${name}.svg`)
          break

        default:
          path = await import(`../assets/${name}.png`)
          break
      }
      return path.default
    }

    loadAssets({ name, file }).then((url) => {
      loadImageAsBlob(url).then((blobUrl) => {
        obj[name] = blobUrl
      })
    })
  })

  return obj
}
