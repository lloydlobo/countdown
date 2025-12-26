import { Button } from "@/components/ui/button"
import { TimeDisplay } from "@/components/ui/time-display.tsx"
import { TooltipButton } from "@/components/ui/tooltip-button.tsx"
import { useGlobalTimer } from "@/context/global-timer/use-global-timer.ts"
import { deleteTimerById } from "@/mutations/timers.ts"
import { timersQueryOptions } from "@/queries/timers.ts"
import type { Timer } from "@/types/core"
import { isTimeEmpty } from "@/utils"
import { useQueryClient } from "@tanstack/react-query"

import { Link, useRouter } from "@tanstack/react-router"
import { ArrowLeftIcon, MaximizeIcon, PauseIcon, PencilIcon, PlayIcon, TimerResetIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import * as portals from "react-reverse-portal"
import { toast } from "sonner"

// eslint-disable-next-line react-refresh/only-export-components
export const portalNode = portals.createHtmlPortalNode<typeof TimerComponent>({
  attributes: {
    class: "w-full h-full min-h-[inherit]",
  },
})

// 1. Callback Registration: The onRun prop is passed to TimerComponent and called whenever the timer's running state changes (line 220).
// 2. State Synchronization: When isRunning state changes, onRun?.(isRunning) is called to notify the parent component about the timer's running status.
// 3. Parent Component Control: In the GlobalTimer component (line 52), setIsRunning from the global timer context is passed as onRun, allowing the context to track when the timer is running.
// 4. Context Integration: This creates a two-way binding where:
//    - The timer component controls its own running state
//    - The global timer context is notified of running state changes
//    - The context can potentially influence timer behavior based on this information
// The onRun callback essentially allows the global timer context to stay synchronized with the individual timer's running state, which could be used for features like preventing multiple timers from running simultaneously or providing global timer controls.
type TimerComponentProps = {
  timer: Timer
  isMinimized?: boolean
  onRun: (isRunning: boolean) => void // useGlobalTimer
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

export const TimerComponent = ({ timer, isMinimized = false, onRun }: TimerComponentProps) => {
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

  const [time, setTime] = useState(timer.time)
  const [isRunning, setIsRunning] = useState(false)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const { setTimer } = useGlobalTimer()

  const countdownInterval = useRef<NodeJS.Timeout>()

  // const navigate=useNavigate()
  const queryClient = useQueryClient()

  // Audio management - extract to useAudioPlayer hook:
  //   typescript   const { isPlaying, play, pause, setSrc } = useAudioPlayer(timer.file, timer.volume);
  const playAudio = () => {
    toast.info(<span>DEBUG: playAudio()</span>)
  }
  const pauseAudio = () => {
    toast.info(<span>DEBUG: pauseAudio()</span>)
  }
  const setAudioSrc = () => {
    toast.info(<span>DEBUG: setAudioSrc()</span>)
  }

  const handleRemoveTimer = async () => {
    await deleteTimerById(timer.id)
    toast.success(
      <span>
        Successfully deleted <span className="font-semibold">{timer.name}</span>.
      </span>
    )
    setTimer(null)
    await queryClient.invalidateQueries(timersQueryOptions)
  }

  // TODO: Timer countdown logic - startTimer/pauseTimer/resetTimer + interval management → useCountdown hook
  const startTimer = () => {
    if (isTimeEmpty(time)) setTime(timer.time)
    setIsRunning(true)
    countdownInterval.current = setInterval(() => {
      setTime((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        else if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        else if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        else {
          const _timer_isOneTime = false
          if (_timer_isOneTime) {
            ;(async () => {
              try {
                await handleRemoveTimer()
              } catch (err) {
                console.error("Failed to remove timer", err)
              }
            })()
          }
          pauseTimer()
          return prev
        }
      })
    }, 1000)
  }
  const pauseTimer = () => {
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

  const onStartPause = () => {
    if (isRunning) pauseTimer()
    else startTimer()
  }
  const onReset = () => {
    resetTimer()
  }
  const onAudioToggle = () => {
    setAudioSrc()
    if (isAudioPlaying) pauseAudio()
    else playAudio()
  }

  return isMinimized ? (
    <div className="bg-secondary fixed top-0 right-0 flex flex-wrap items-center justify-center gap-4 rounded-md px-4 py-2 sm:top-auto sm:right-4 sm:bottom-4 sm:gap-8">
      <TimeDisplay time={time} size="minimized" />
      {/* Controls */}
      <div className="flex items-center gap-2">
        <TooltipButton
          icon={isRunning ? PauseIcon : PlayIcon}
          tooltip={isRunning ? "Pause timer" : "Start timer"}
          onClick={onStartPause}
          className="py-4"
        />
        <div className="flex items-center gap-2">
          <TooltipButton
            icon={TimerResetIcon}
            tooltip="Reset the timer"
            onClick={onReset}
            variant="outline"
            className="grow py-4"
          />
          <Link to="/$timerId/edit" params={{ timerId: timer.id }}>
            <TooltipButton icon={PencilIcon} tooltip="Edit the timer" variant="outline" className="grow py-4" />
          </Link>
          <Link to="/$timerId" params={{ timerId: timer.id }}>
            <TooltipButton icon={MaximizeIcon} tooltip="Open the timer" variant="outline" className="grow py-4" />
          </Link>
          <TooltipButton
            icon={isAudioPlaying ? PauseIcon : PlayIcon}
            tooltip={isAudioPlaying ? "Pause sound" : "Play sound"}
            onClick={onAudioToggle}
            variant="destructive"
            className="grow py-4"
          />
        </div>
      </div>
    </div>
  ) : (
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
      <TimeDisplay time={time} />
      {/*Controls*/}
      <div className="mt-8 flex flex-col gap-2 md:flex-row">
        <TooltipButton
          icon={isRunning ? PauseIcon : PlayIcon}
          label={isRunning ? "Pause" : "Start"}
          tooltip={isRunning ? "Pause timer" : "Start timer"}
          onClick={onStartPause}
          className="py-4"
        />
        <div className="flex items-center gap-2">
          <TooltipButton
            icon={TimerResetIcon}
            tooltip="Reset the timer"
            onClick={onReset}
            variant="secondary"
            className="grow py-4"
          />
          <Link to="/$timerId/edit" params={{ timerId: timer.id }} className="block">
            <TooltipButton icon={PencilIcon} tooltip="Edit the timer" variant="secondary" className="grow py-4" />
          </Link>
          <TooltipButton
            icon={isAudioPlaying ? PauseIcon : PlayIcon}
            tooltip={isAudioPlaying ? "Pause sound" : "Play sound"}
            onClick={onAudioToggle}
            variant="destructive"
            className="grow py-4"
          />
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
