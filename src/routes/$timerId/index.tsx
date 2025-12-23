import GlobalTimer from "@/components/global-timer"
import type { Timer } from "@/types/core"
import { createFileRoute } from "@tanstack/react-router"
import * as portals from "react-reverse-portal"

export const Route = createFileRoute("/$timerId/")({
  component: TimerPage,
})

export type TimerProps = {
  timer: Timer
  isMinimized?: boolean
}

function TimerPage() {
  const timerId = Route.useParams().timerId
  return (
    <>
      <span className="flex gap-2">
        In <pre>routes/$timerId/index.tsx</pre>: <pre>{timerId}</pre>
      </span>

      {/* portalNode */}
      {/* <portals.OutPortal isMinimized={false} node={GlobalTimer} /> */}
    </>
  )
}
