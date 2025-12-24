import GlobalTimer, { portalNode } from "@/components/global-timer"
import { Button } from "@/components/ui/button"
import { useGlobalTimer } from "@/context/global-timer-context"
import { timerQueryOptions } from "@/queries/timer"
import type { Timer } from "@/types/core"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { useEffect } from "react"
import * as portals from "react-reverse-portal"

export const Route = createFileRoute("/$timerId/")({
  component: TimerPage,
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(timerQueryOptions(params.timerId))
    if (!data) throw new Error("Timer not found")

    return data
  },
  errorComponent: () => (
    <div className="flex h-full min-h-[inherit] w-full flex-col items-center justify-center">
      <p className="font-semibod text-6xl">Timer not found</p>

      <Link to="/">
        <Button className="mt-8">
          <p className="text-xl font-semibold">Go back</p>
        </Button>
      </Link>
    </div>
  ),
})

export type TimerProps = {
  timer: Timer
  isMinimized?: boolean
}

function TimerPage() {
  const timerId = Route.useParams().timerId

  const { data: timer } = useSuspenseQuery(timerQueryOptions(timerId))

  const { timer: existingTimer, setTimer, isRunning } = useGlobalTimer()

  useEffect(() => {
    if (!timer) return

    if (existingTimer) {
      if (existingTimer.id !== timer.id && isRunning) return
    }

    setTimer(timer)
  }, [timer, setTimer, existingTimer, isRunning])

  const shouldAsk = !!existingTimer && existingTimer?.id !== timer?.id && isRunning

  return (
    <>
      {shouldAsk && (
        <div>
          <span>TODO: Dialog</span>
          <span>TODO: DialogDescription: You are about to open a new timer. The old timer will be paused</span>
          <span className="flex gap-2 opacity-15">
            In <pre>routes/$timerId/index.tsx</pre>: <pre>{timerId}</pre>
          </span>
        </div>
      )}
      <portals.OutPortal isMinimized={false} node={portalNode} />
    </>
  )
}
