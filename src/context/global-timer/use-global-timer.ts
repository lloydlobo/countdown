import { useContext } from "react"

import { GlobalTimerContext } from "@/context/global-timer/global-timer-context"

export const useGlobalTimer = () => {
  const data = useContext(GlobalTimerContext)

  if (!data) throw new Error("GlobalTimerContext not found")

  return data
}
