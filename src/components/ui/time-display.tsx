import React from "react"

import type { Time } from "@/types/core.ts"

type Size = "full" | "minimized"

const columnClasses: Record<Size, string> = {
  full: "text-6xl font-bold uppercase tabular-nums md:text-9xl",
  minimized: "text-2xl font-bold uppercase tabular-nums",
}

const wrapperClasses: Record<Size, string> = {
  full: "flex md:flex-row md:items-center md:gap-2",
  minimized: "flex items-center~ gap-2",
}

const TimeText = ({ children, size }: { children: React.ReactNode; size: Size }) => {
  return <p className={columnClasses[size]}>{children}</p>
}

export const TimeDisplay = ({ time, size = "full" }: { time: Time; size?: Size }) => {
  const pad = (value: number) => value.toString().padStart(2, "0")
  return (
    <div className={wrapperClasses[size]}>
      <TimeText size={size}>{pad(time.hours)}</TimeText>
      <TimeText size={size}>:</TimeText>
      <TimeText size={size}>{pad(time.minutes)}</TimeText>
      <TimeText size={size}>:</TimeText>
      <TimeText size={size}>{pad(time.seconds)}</TimeText>
    </div>
  )
}
