export function formatTime (time: Time) {
    let result = ""
    const hours = time.hours.toString().padStart(2, "0")
    const minutes = time.minutes.toString().padStart(2, "0")
    const seconds = time.seconds.toString().padStart(2, "0")
    if (time.hours > 0) result += `${hours}:`
    result += `${minutes}:${seconds}`
    return result
}
