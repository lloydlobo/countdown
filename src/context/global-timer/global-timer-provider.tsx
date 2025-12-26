import React, { useState } from "react"

import type { Timer } from "@/types/core"
import { GlobalTimerContext } from "@/context/global-timer/global-timer-context"

export const GlobalTimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [timer, setTimer] = useState<Timer | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  return (
    <GlobalTimerContext.Provider value={{ timer, setTimer, isRunning, setIsRunning }}>
      {children}
    </GlobalTimerContext.Provider>
  )
}
