import { createContext, useContext, useState } from "react"

import type { Timer } from "@/types/core"

type GlobalTimerContextType = {
  timer: Timer | null
  setTimer: (timer: Timer | null) => void

  isRunning: boolean
  setIsRunning: (isRunning: boolean) => void
}

export const GlobalTimerContext = createContext<GlobalTimerContextType>(null as unknown as any)

export const GlobalTimerProvider = ({ children }: { children: React.ReactNode }) => {
  const [timer, setTimer] = useState<Timer | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  return (
    <GlobalTimerContext.Provider value={{ timer, setTimer, isRunning, setIsRunning }}>
      {children}
    </GlobalTimerContext.Provider>
  )
}

export const useGlobalTimer = () => {
  const data = useContext(GlobalTimerContext)
  if (!data) throw new Error("GlobalTimerCOntext not found")
  return data
}
