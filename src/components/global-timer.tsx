import { portalNode } from "@/components/portal-node.tsx"
import { TimerComponent } from "@/components/timer-component.tsx"
import { useGlobalTimer } from "@/context/global-timer/use-global-timer.ts"
import { useRouter } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import * as portals from "react-reverse-portal"

const GlobalTimer = () => {
  const router = useRouter()

  // @ts-expect-error matchRoute expect params, which is not needed here
  const [isMatch, setIsMatch] = useState(!!router.matchRoute({ to: "/$timerId" }))
  const { timer, setIsRunning } = useGlobalTimer()

  useEffect(() => {
    return router.subscribe("onResolved", (ev) => {
      const href = ev.toLocation.href
      const id = timer?.id

      console.log("resolved", id, href)
      setIsMatch(href === `/${id}`)
    }) // returns an unsubscribe function
  }, [timer, router])

  useEffect(() => {
    // @ts-expect-error matchRoute expect params, which is not needed here
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMatch(!!router.matchRoute({ to: "/$timerId" }))
  }, [router, timer?.id])

  // FIX: on delete timer by id, the minimized timer remains even if timer doesn't exist
  return (
    <>
      <portals.InPortal node={portalNode}>
        {timer && <TimerComponent timer={timer} onRun={setIsRunning} />}
      </portals.InPortal>
      {!isMatch && <portals.OutPortal<typeof TimerComponent> isMinimized={true} node={portalNode} />}
    </>
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

// type TimerComponentProps
// 1. Callback Registration: The onRun prop is passed to TimerComponent and called whenever the timer's running state changes (line 220).
// 2. State Synchronization: When isRunning state changes, onRun?.(isRunning) is called to notify the parent component about the timer's running status.
// 3. Parent Component Control: In the GlobalTimer component (line 52), setIsRunning from the global timer context is passed as onRun, allowing the context to track when the timer is running.
// 4. Context Integration: This creates a two-way binding where:
//    - The timer component controls its own running state
//    - The global timer context is notified of running state changes
//    - The context can potentially influence timer behavior based on this information
// The onRun callback essentially allows the global timer context to stay synchronized with the individual timer's running state, which could be used for features like preventing multiple timers from running simultaneously or providing global timer controls.

// TimerComponent
//
// The timer ticks using a setInterval in the startTimer function at line 157. Here's how it works:
// 1. Interval Setup: When startTimer() is called, it creates a setInterval that runs every 1000ms (1 second) at line 157.
// 2. Time Decrement Logic: The interval callback (lines 158-199) decrements the time in this order:
//    - If seconds > 0: decrement seconds by 1
//    - If seconds = 0 and minutes > 0: decrement minutes by 1, set seconds to 59
//    - If minutes = 0 and hours > 0: decrement hours by 1, set minutes to 59, seconds to 59
//    - If all reach 0: timer completes
// 3. Timer Completion: When time reaches 00:00:00, it plays audio and handles different timer modes (one-time, interval, or normal).
// 4. Interval Cleanup: The pauseTimer() function at line 202 clears the interval using clearInterval(countDownInterval.current!).
// The timer state is managed with useState for the current time and useRef to store the interval reference for proper cleanup.
