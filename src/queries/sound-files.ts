import type { SoundFile } from "@/types/core.ts"
import { queryOptions } from "@tanstack/react-query"
import { get } from "idb-keyval"

const soundFilesOption = queryOptions({
  queryKey: ["soundFiles"],
  queryFn: async () => {
    const timers = await get("timers")
    return (timers || []) as SoundFile[]
  },
})

export default soundFilesOption
