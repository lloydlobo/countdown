import { useEffect, useState } from "react"

import * as portals from "react-reverse-portal"
import { Button } from "@/components/ui/button"
import { Link, useRouter } from "@tanstack/react-router"
import { ArrowLeftIcon } from "lucide-react"
import { useGlobalTimer } from "@/context/global-timer-context"
import type { Timer } from "@/types/core"

// eslint-disable-next-line react-refresh/only-export-components
export const portalNode = portals.createHtmlPortalNode<typeof TimerComponent>({
  attributes: {
    class: "w-full h-full min-h-[inherit]",
  },
})

const GlobalTimer = () => {
  const router = useRouter()

  const [isMatch, setIsMatch] = useState(
    // @ts-expect-error matchRoute expect params, which is not needed here
    !!router.matchRoute({ to: "/$timerId" })
  )

  const { timer, setIsRunning } = useGlobalTimer()

  useEffect(() => {
    const unsub = router.subscribe("onResolved", (ev) => {
      const href = ev.toLocation.href
      const id = timer?.id

      const label = `GlobalTimer: router.subscribe: "onResolved":`
      console.log(label, "resolved", id, href)

      setIsMatch(href === `/${id}`)
    })

    return unsub
  }, [timer, router])

  useEffect(() => {
    // @ts-expect-error matchRoute expect params, which is not needed here
    setIsMatch(!!router.matchRoute({ to: "/$timerId" }))
  }, [router, timer?.id])

  return (
    <>
      <div className="flex gap-0">
        <span>Global</span> <span>Timer</span>
      </div>
      <portals.InPortal node={portalNode}>
        {timer && <TimerComponent timer={timer} onRun={setIsRunning} />}
      </portals.InPortal>

      {!isMatch && <portals.OutPortal<typeof TimerComponent> isMinimized={true} node={portalNode} />}
    </>
  )
}

type TimerComponentProps = {
  timer: Timer | null
  isMinimized?: boolean
  onRun: (isRunning: boolean) => void
}

export const TimerComponent = ({ timer, isMinimized = false, onRun }: TimerComponentProps) => {
  if (!timer) {
    return (
      <>
        <div className="flex">
          <p>Timer not found</p>
        </div>
      </>
    )
  }
  return (
    <div className="relative flex h-full min-h-[inherit] w-full flex-col items-center justify-center py-20">
      <Link to="/">
        <Button variant="ghost" className="absolute top-4 left-4 flex items-center md:top-16 md:left-4">
          <ArrowLeftIcon className="mr-2 h-6 w-6 shrink-8" />
          <p className="text-xl">Go back</p>
        </Button>
      </Link>

      <div className="flex items-center gap-1.5">
        <div className="h-2 w-2 rounded-sm" style={{ backgroundColor: timer.color }}></div>
        <p className="text-xl font-semibold" style={{ color: timer.color }}>
          {timer?.name}
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:gap-2">
        <p className="text-8xl font-bold uppercase tabular-nums md:text-9xl">
          {timer.hours || "00"}
          {/* {timer.hours.toString().padStart(2, "0")} */}
        </p>

        <p className="hidden text-8xl font-bold uppercase tabular-nums md:block md:text-9xl">:</p>
        <p className="-mt-14 text-8xl font-bold uppercase tabular-nums md:-mt-20 md:hidden md:text-9xl">..</p>

        <p className="text-8xl font-bold uppercase tabular-nums md:text-9xl">
          {timer.minutes || "00"}
          {/* {timer.minutes.toString().padStart(2, "0")} */}
        </p>

        <p className="hidden text-8xl font-bold uppercase tabular-nums md:block md:text-9xl">:</p>
        <p className="-mt-14 text-8xl font-bold uppercase tabular-nums md:-mt-20 md:hidden md:text-9xl">..</p>

        <p className="text-8xl font-bold uppercase tabular-nums md:text-9xl">
          {timer.seconds || "00"}
          {/* {timer.seconds.toString().padStart(2, "0")} */}
        </p>
      </div>
    </div>
  )
}

export default GlobalTimer

// 1. Portal Node Creation (global-timer.tsx:29)
//        export const portalNode = portals.createHtmlPortalNode<typeof TimerComponent>({
// 2. Import Connection ($timerId/index.tsx:1)
//        import { portalNode } from "@/components/global-timer";
// 3. Portal Source - GlobalTimer (global-timer.tsx:71-73)
//        <portals.InPortal node={portalNode}>
//          {timer && <TimerComponent onRun={setIsRunning} timer={timer} />}
//        </portals.InPortal>
// 4. Portal Destination - Timer Page ($timerId/index.tsx:137)
//        <portals.OutPortal isMinimized={false} node={portalNode} />
// 5. State Synchronization ($timerId/index.tsx:62)
//        setTimer(timer);
//
// How the Connection Works:
//
// 1. Line 29: Creates the portal node (the "teleport destination")
// 2. Line 1: Imports that portal node into the timer page
// 3. Line 71-73: GlobalTimer puts the TimerComponent "into" the portal
// 4. Line 137: $timerId/index.tsx renders the portal content "out" at full size
// 5. Line 62: The timer page updates the global state, which triggers GlobalTimer to show the timer
//
// The portalNode is the shared reference that connects both components - it's
// like a TV channel where GlobalTimer broadcasts the timer content and
// $timerId/index.tsx tunes in to display it.
