import type { Time } from "@/types/core"

export function isTimeEmpty(time: Time) {
  return time.hours === 0 && time.minutes === 0 && time.seconds === 0
}

export function humanFileSize(bytes: number, si = false, dp = 1) {
  const thresh = si ? 1000 : 1024
  if (Math.abs(bytes) < thresh) {
    return bytes + " B"
  }

  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]
  let u = -1
  const r = 10 ** dp

  do {
    bytes /= thresh
    ++u
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)

  return bytes.toFixed(dp) + " " + units[u]
}

export function formatTime(time: Time) {
  let result = ""
  const hours = time.hours.toString().padStart(2, "0")
  const minutes = time.minutes.toString().padStart(2, "0")
  const seconds = time.seconds.toString().padStart(2, "0")
  if (time.hours > 0) result += `${hours}:`
  result += `${minutes}:${seconds}`
  return result
}
