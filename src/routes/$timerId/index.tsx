import { portalNode } from "@/components/portal-node.tsx"
import { useEffect } from "react"

import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import * as portals from "react-reverse-portal"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { timerQueryOptions } from "@/queries/timer"
import type { Timer } from "@/types/core"
import { useGlobalTimer } from "@/context/global-timer/use-global-timer.ts"

export const Route = createFileRoute("/$timerId/")({
  component: TimerPage,
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(timerQueryOptions(params.timerId))
    if (!data) throw new Error("Timer not found")
    return data
  },
  errorComponent: () => (
    <div className="flex h-full min-h-[inherit] w-full flex-col items-center justify-center">
      <p className="font-semibold text-6xl">Timer not found</p>
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
        <Dialog open>
          <DialogContent className="sm:max-w-106.25">
            <DialogHeader>
              <DialogTitle>Open new timer?</DialogTitle>
              <DialogDescription>You are about to open a new timer. The old timer will be paused.</DialogDescription>
            </DialogHeader>

            <div>
              <p>
                Current timer:{" "}
                <span
                  className="mr-1 inline-block h-2 w-2 rounded-md"
                  style={{ backgroundColor: existingTimer?.color }}
                ></span>
                <span className="font-semibold" style={{ color: existingTimer?.color }}>
                  {existingTimer?.name}
                </span>
              </p>

              <p>
                New timer:{" "}
                <span className="mr-1 inline-block h-2 w-2 rounded-md" style={{ backgroundColor: timer?.color }}></span>
                <span className="font-semibold" style={{ color: timer?.color }}>
                  {timer?.name}
                </span>
              </p>
            </div>

            <DialogFooter>
              <Link to="/$timerId" params={{ timerId: existingTimer!.id }}>
                <Button variant={"secondary"}>Open the current timer</Button>
              </Link>

              <Button
                onClick={() => {
                  if (!timer) return

                  setTimer(timer)
                }}
              >
                Open the new timer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <portals.OutPortal isMinimized={false} node={portalNode} />
    </>
  )
}
