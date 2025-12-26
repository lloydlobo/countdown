import { createContext } from "react"

import type { Timer } from "@/types/core.ts"

export type GlobalTimerContextType = {
  timer: Timer | null
  setTimer: (timer: Timer | null) => void

  isRunning: boolean
  setIsRunning: (isRunning: boolean) => void
}

export const GlobalTimerContext = createContext<GlobalTimerContextType>(null as unknown as GlobalTimerContextType)
