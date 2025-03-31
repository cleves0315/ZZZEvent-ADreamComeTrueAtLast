import { gsap } from "gsap"

export const isMobile = () => {
  const userAgent = navigator.userAgent
  const reg = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
  return reg.test(userAgent)
}

export const ceilToTwo = (num: number, decimal = 2) => {
  const factor = Math.pow(10, decimal)
  const rounded = Math.ceil(num * factor) / factor
  return rounded.toFixed(decimal)
}

export const generateRandomString = (length = 6) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters[randomIndex]
  }

  return result
}

export const loadAssetAsBlob = async (imageUrl: string) => {
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
      zIndex: 999,
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

import { Assets } from "../assets-list"

export const preloadResources = async (assetsList: string[]) => {
  return new Promise<Record<Assets, string>>((resolve) => {
    // @ts-ignore
    const obj: Record<Assets, string> = {}
    let count = 0

    assetsList.forEach(async (asset: string) => {
      const [name, file] = asset.split(".") as [Assets, string]
      obj[name] = ""

      const getPath = async ({ name, file }: { name: Assets; file: string }) => {
        let path = { default: "" }
        try {
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
            case "mp3":
              path = await import(`../assets/${name}.mp3`)
              break
            case "mp4":
              path = await import(`../assets/${name}.mp4`)
              break

            default:
              path = await import(`../assets/${name}.png`)
              break
          }
        } catch (e) {
          // console.error(`Error loading asset: ${name}.${file}`, e)
        }
        return path.default
      }

      getPath({ name, file }).then((url) => {
        loadAssetAsBlob(url)
          .then((blobUrl) => {
            obj[name] = blobUrl
          })
          .finally(() => {
            count++

            if (count === assetsList.length) {
              resolve(obj)
            }
          })
      })
    })
  })
}

export const copyToClipboard = (
  text: string,
  options?: { successMessage: string; errorMessage: string },
) => {
  const { successMessage = "已复制到剪贴板", errorMessage = "复制失败，请手动复制" } = options || {}

  return new Promise((resolve) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          if (successMessage !== null) {
            alert(successMessage)
          }
          resolve(true)
        })
        .catch((err) => {
          console.error("Clipboard API 复制失败:", err)
          if (fallbackCopy(text)) {
            resolve(true)
          } else {
            if (errorMessage !== null) {
              alert(errorMessage)
            }
            resolve(false)
          }
        })
    } else {
      if (fallbackCopy(text)) {
        if (successMessage !== null) {
          alert(successMessage)
        }
        resolve(true)
      } else {
        if (errorMessage !== null) {
          alert(errorMessage)
        }
        resolve(false)
      }
    }
  })

  function fallbackCopy(text: string) {
    try {
      const textarea = document.createElement("textarea")
      textarea.value = text
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()

      if (navigator.userAgent.match(/ipad|iphone|android/i)) {
        // @ts-ignore
        textarea.contentEditable = true
        textarea.readOnly = true
        const range = document.createRange()
        range.selectNodeContents(textarea)
        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)
        textarea.setSelectionRange(0, 999999)
      }

      const successful = document.execCommand("copy")
      document.body.removeChild(textarea)
      return successful
    } catch (err) {
      console.error("传统复制方法失败:", err)
      return false
    }
  }
}
