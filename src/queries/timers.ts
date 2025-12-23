import type { Timer } from "@/types/core"
import { queryOptions } from "@tanstack/react-query"
import { get } from "idb-keyval"

export const timerQueryKey = ["timers"]

export const timersQueryOptions = queryOptions({
  queryKey: timerQueryKey,

  queryFn: async () => {
    const timers = await get("timers")

    return (timers || []) as Timer[]
  },
})
