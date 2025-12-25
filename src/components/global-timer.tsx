import React, { useEffect, useRef, useState } from "react"

import { Link, useRouter } from "@tanstack/react-router"
import { ArrowLeftIcon, PauseIcon, PencilIcon, PlayIcon, TimerResetIcon } from "lucide-react"
import * as portals from "react-reverse-portal"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useGlobalTimer } from "@/context/global-timer-context"
import { cn } from "@/lib/utils"
import type { Time, Timer } from "@/types/core"
import { isTimeEmpty } from "@/utils"

// eslint-disable-next-line react-refresh/only-export-components
export const portalNode = portals.createHtmlPortalNode<typeof TimerComponent>({
  attributes: {
    class: "w-full h-full min-h-[inherit]",
  },
})
type TimerComponentProps = {
  timer: Timer
  isMinimized?: boolean
  // 1. Callback Registration: The onRun prop is passed to TimerComponent and called whenever the timer's running state changes (line 220).
  // 2. State Synchronization: When isRunning state changes, onRun?.(isRunning) is called to notify the parent component about the timer's running status.
  // 3. Parent Component Control: In the GlobalTimer component (line 52), setIsRunning from the global timer context is passed as onRun, allowing the context to track when the timer is running.
  // 4. Context Integration: This creates a two-way binding where:
  //    - The timer component controls its own running state
  //    - The global timer context is notified of running state changes
  //    - The context can potentially influence timer behavior based on this information
  // The onRun callback essentially allows the global timer context to stay synchronized with the individual timer's running state, which could be used for features like preventing multiple timers from running simultaneously or providing global timer controls.
  onRun: (isRunning: boolean) => void
}

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

      console.trace("resolved", id, href)

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
      <portals.InPortal node={portalNode}>
        {timer && <TimerComponent timer={timer} onRun={setIsRunning} />}
      </portals.InPortal>

      {!isMatch && (
        <portals.OutPortal<typeof TimerComponent> // force-line-break
          isMinimized={true}
          node={portalNode}
        />
      )}
    </>
  )
}

const TimeDisplay = ({ time }: { time: Time }) => {
const TimeColon = () => <p className="text-6xl font-bold uppercase tabular-nums md:block md:text-9xl">:</p>
const TimeChars = ({ children }: { children: React.ReactNode }) => (
  <p className="text-6xl font-bold uppercase tabular-nums md:text-9xl">{children}</p>
)
return (
  <div className="flex md:flex-row md:items-center md:gap-2">
    <TimeChars>{time.hours.toString().padStart(2, "0")}</TimeChars>
    <TimeColon />
    <TimeChars>{time.minutes.toString().padStart(2, "0")}</TimeChars>
    <TimeColon />
    <TimeChars>{time.seconds.toString().padStart(2, "0")}</TimeChars>
  </div>
)
}

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
export const TimerComponent = ({ timer, isMinimized = false, onRun }: TimerComponentProps) => {
  const [time, setTime] = useState(timer.time)
  const [isRunning, setIsRunning] = useState(false)
  const { isAudioPlaying, setIsAudioPlaying } = useState(false)
  //   const { setTimer } = useGlobalTimer()

  const countdownInterval = useRef<NodeJS.Timeout>()

  const playAudio = () => {
    toast.info(<span>DEBUG: playAudio()</span>)
  }
  const pauseAudio = () => {
    toast.info(<span>DEBUG: pauseAudio()</span>)
  }
  const deleteTimer = () => {
    toast.info(<span>DEBUG: deleteAudio()</span>)
  }
  const setAudioSrc = () => {
    toast.info(<span>DEBUG: setAudioSrc()</span>)
  }

  const startTimer = () => {
    console.assert(!isRunning)

    if (isTimeEmpty(time)) setTime(timer.time)
    setIsRunning(true)
    countdownInterval.current=setInterval(()=>{
        setTime((prev)=>{
            if (prev.seconds>0){
                return {...prev,seconds:prev.seconds-1}
            } else if (prev.minutes>0){
                return {...prev, minutes:prev.minutes-1,seconds:59}
            } else if (prev.hours > 0) {
                return {...prev,hours:prev.hours-1, minutes:59, seconds: 59,}
            } else {
                pauseTimer()
                return prev
            }
        })
    },1000)
  }

  const pauseTimer = () => {
    console.assert(!isTimeEmpty(time))

    setIsRunning(false)
    clearInterval(countdownInterval.current!)
  }

  const resetTimer = () => {
      setTime(timer.time)
      pauseTimer()
  }

  useEffect(() => {
      setTime(timer.time)
      pauseTimer()
  }, [timer.time])

  useEffect(() => {
      onRun?.(isRunning)
  }, [isRunning, onRun])

  useEffect(() => {
      // TODO: for audioRef
  }, [])

  if (isMinimized) {
    return (
      <>
        <div className="flex">
          <p>
            <pre>[TimerComponent] isMinimized: {isMinimized ? "true" : "false"}</pre>
          </p>
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
          {timer.name}
        </p>
      </div>

      <TimeDisplay time={timer.time} />

      <div className="mt-8 flex flex-col gap-2 md:flex-row">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              onClick={() => (isRunning ? pauseTimer : startTimer)()}
              className={cn(buttonVariants({ className: "py-4", variant: "default" }))}
            >
              <div className="flex items-center">
                {isRunning ? (
                  <>
                    <PauseIcon className="mr-3 h-5 w-5" />

                    <p className="text-base font-semibold uppercase">Pause</p>
                  </>
                ) : (
                  <>
                    <PlayIcon className="mr-3 h-5 w-5" />

                    <p className="text-base font-semibold uppercase">Start</p>
                  </>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-secondary">
              {isRunning ? "Pause the timer" : "Start the timer"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                className={cn(buttonVariants({ variant: "secondary", className: "grow py-4" }))}
                onClick={resetTimer}
              >
                <TimerResetIcon className="h-5 w-5" />
              </TooltipTrigger>
              <TooltipContent className="bg-secondary">Reset the timer</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Link to="/$timerId/edit" params={{ timerId: timer.id }} className="block">
            <TooltipProvider>
              <Tooltip>
                {/* NOTE: Disabled h-full for even icon for all providers */}
                <TooltipTrigger
                  className={cn(buttonVariants({ variant: "secondary", className: "h-full~ grow py-4" }))}
                >
                  <PencilIcon className="h-5 w-5" />
                </TooltipTrigger>
                <TooltipContent className="bg-secondary">Edit the timer</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Link>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                onClick={() => {
                  setAudioSrc()
                  isAudioPlaying ? pauseAudio() : playAudio()
                }}
                className={cn(buttonVariants({ variant: "destructive", className: "grow py-4" }))}
              >
                {isAudioPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
              </TooltipTrigger>
              <TooltipContent className="bg-secondary">
                {isAudioPlaying ? "Pause the sound" : "Play the sound"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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
