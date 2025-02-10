export const ceilToTwo = (num: number, decimal = 2) => {
  const factor = Math.pow(10, decimal) // 计算10的幂
  const rounded = Math.ceil(num * factor) / factor // 向上取整
  return rounded.toFixed(decimal) // 返回指定小数位的字符串
}
