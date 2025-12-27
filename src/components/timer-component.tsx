// FIXME: Cannot update a component (`Transitioner`) while rendering a different component (`TimerComponent`). To locate the bad setState() call inside `TimerComponent`, follow the stack trace as described in
//        CONTEXT: Deletion of `isOneTime` enabled timer both in minimized mode and full mode

import { Button } from "@/components/ui/button.tsx"
import { TimeDisplay } from "@/components/ui/time-display.tsx"
import { TooltipButton } from "@/components/ui/tooltip-button.tsx"
import { useGlobalTimer } from "@/context/global-timer/use-global-timer.ts"
import { deleteTimerById } from "@/mutations/timers.ts"
import { timersQueryOptions } from "@/queries/timers.ts"
import type { Timer } from "@/types/core.ts"
import { isTimeEmpty } from "@/utils.ts"

import { useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeftIcon, MaximizeIcon, PauseIcon, PencilIcon, PlayIcon, TimerResetIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

type TimerComponentProps = {
  timer: Timer
  isMinimized?: boolean
  onRun: (isRunning: boolean) => void // useGlobalTimer
}

export const TimerComponent = ({ timer, isMinimized = false, onRun }: TimerComponentProps) => {
  const [time, setTime] = useState(timer.time)
  const [isRunning, setIsRunning] = useState(false)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const { setTimer } = useGlobalTimer()

  const countdownInterval = useRef<NodeJS.Timeout>()
  const audioRef = useRef<HTMLAudioElement>(new Audio())

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Audio management - extract to useAudioPlayer hook:
  //   typescript   const { isPlaying, play, pause, setSrc } = useAudioPlayer(timer.file, timer.volume);
  const playAudio = () => {
    audioRef.current.play()
    audioRef.current.volume = timer.volume
  }
  const pauseAudio = () => {
    audioRef.current.pause()
    setIsAudioPlaying(false)
  }
  const setAudioSrc = () => {
    // Because the browser will not load this audio when the tab is inactive
    // We have the load the audio first so that it can be played
    const file = timer.soundFile.file
    if (typeof file === "string") {
      audioRef.current.src = file
    } else {
      console.assert(file instanceof File)
      audioRef.current.src = URL.createObjectURL(file)
    }
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
    setAudioSrc()

    if (isTimeEmpty(time)) {
      setTime(timer.time)
    }

    setIsRunning(true)

    countdownInterval.current = setInterval(() => {
      setTime((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        else if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        else if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        else {
          audioRef.current.currentTime = 0
          playAudio()
          if (timer.isOneTime) {
            handleRemoveTimer().catch((err) => console.error("Failed to remove timer", err))
            navigate({ to: "/", replace: true }).then((r) => console.log(r))
            return timer.time
          }
          if (timer.isInterval) {
            return timer.time
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
    const audio = audioRef.current
    const handleEnded = () => {
      setIsAudioPlaying(false)
      console.log("HANDLE ENDED")
    }
    const handlePlay = () => {
      setIsAudioPlaying(true)
    }
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("pause", handleEnded)
    audio.addEventListener("play", handlePlay)
    return () => {
      audio.addEventListener("ended", handleEnded)
      audio.addEventListener("pause", handleEnded)
      audio.addEventListener("play", handlePlay)
    } // cleanup function
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
