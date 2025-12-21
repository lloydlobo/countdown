import { ComponentExample } from "@/components/component-example"
import { Button } from "@/components/ui/button"
import type { Time, Timer } from "@/types/core"
import { formatTime } from "@/utils"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, createFileRoute } from "@tanstack/react-router"
import { get } from "idb-keyval"
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export const Route = createFileRoute("/")({
  component: Home,
  // loader: async ({ context }) => {
  //     return context.queryClient.ensureQueryData(timersQueryOptions)
  // },
})

function Home() {
  //   const { data } = useSuspenseQuery(timersQueryOptions)
  const [data, setData] = useState<Timer[]>()

  const getTimers = async () => {
    const existingTimers: Timer[] = await get("timers")
    const tempdata = existingTimers.map((x, i) => {
      return `[${i}: ${x.name} ${x.time && formatTime(x.time)}]`
    })

    toast.info(tempdata.join("\n"))
    setData(existingTimers)
  }

  return (
    <div className="flex min-h-[inherit] w-full flex-col justify-center overflow-y-auto py-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Your timers</h1>

        <Link to="/create">
          <Button variant="secondary">
            <PlusIcon className="mr-2 h-6 w-6" />

            {/*<p className="ml-2 hidden text-base~ text-lg sm:block">Add timer</p>*/}
            <p className="text-base~ hidden text-lg sm:block">Add timer</p>
          </Button>
        </Link>
      </div>

      <div className="mt-4 space-y-2">
        {!data?.length ? (
          <p className="mt-2 text-center text-base">
            You have no timers.{" "}
            <Link to="/create" className="hover:underline">
              Create one
            </Link>
          </p>
        ) : (
          data.map((timer) => (
            <div key={timer.id} className="flex justify-between gap-8">
              <p>{timer.name}</p>
              <p>{timer.time ? formatTime(timer.time) : "--:--"}</p>
            </div>
          ))
        )}
      </div>

      <Button onClick={getTimers}>Show existing timers</Button>
    </div>
  )
}
