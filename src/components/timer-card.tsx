import { Button, buttonVariants } from "@/components/ui/button"
import { useGlobalTimer } from "@/context/global-timer/use-global-timer.ts"
import { cn } from "@/lib/utils"
import { deleteTimerById } from "@/mutations/timers.ts"
import { timersQueryOptions } from "@/queries/timers.ts"
import type { Timer } from "@/types/core"
import { formatTime } from "@/utils"

import { useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Pencil, TrashIcon } from "lucide-react"
import { toast } from "sonner"

interface TimerCardProps {
  timer: Timer
}

const TimerCard = ({ timer }: TimerCardProps) => {
  const queryClient = useQueryClient()

  const { setTimer } = useGlobalTimer() // NOTE: The global context holds only one timer - the currently active/running timer.

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

  return (
    <div
      className={cn(
        buttonVariants({
          className: "flex h-auto w-full items-center justify-between rounded-md px-4 py-3", // use h-auto to override `h-9` in buttonVariants
          variant: "secondary",
        })
      )}
    >
      <Link className="block w-full" to="/$timerId" params={{ timerId: timer.id }}>
        <div className="w-full">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-sm" style={{ backgroundColor: timer.color }}></div>
              <p className="text-lg font-semibold">{timer.name}</p>
            </div>

            <span>
              <span className="text-base font-semibold text-gray-200">Time:</span>{" "}
              <span className="text-base font-medium text-gray-300">{formatTime(timer.time)}</span>
            </span>
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <Link to="/$timerId/edit" params={{ timerId: timer.id }}>
          <Button variant={"ghost"}>
            <Pencil className="h-5 w-5" />
          </Button>
        </Link>

        <Button onClick={handleRemoveTimer} variant="destructive">
          <TrashIcon />
        </Button>
      </div>
    </div>
  )
}

export default TimerCard

/**
 * TIMER MANAGEMENT FLOW
 *
 * Architecture: Single active timer in global context + multiple timer cards from IndexedDB
 *
 * Flow: TimerCard click → navigate → setTimer(timer) → GlobalTimer renders TimerComponent
 *
 * Bug: TimerCard deletion only cleared IndexedDB, not global context
 * Fix: TimerCard must call setTimer(null) when deleting active timer
 *
 * Key: setTimer establishes correspondence between prop and global state via navigation
 * Portal: Same TimerComponent teleported between minimized/full contexts
 *
 * Note: isMinimized controls visual only, not timer execution
 */
