import type { Timer } from "@/types/core.ts"

import { get, set } from "idb-keyval"

export const deleteTimerById = async (id: string): Promise<Timer[]> => {
  const timers = (await get("timers")) as Timer[] | undefined
  if (!timers) return [] as Timer[]

  const newTimers = timers.filter((t) => t.id !== id) as Timer[]
  await set("timers", newTimers)
  return newTimers
}
