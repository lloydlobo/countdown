import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Timer } from "@/types/core"
import { formatTime } from "@/utils"
import { Link } from "@tanstack/react-router"
import { Pencil, TrashIcon } from "lucide-react"

interface TimerCardProps {
  timer: Timer
}

const TimerCard = ({ timer }: TimerCardProps) => {
  return (
    <div
      className={cn(
        buttonVariants({
          // use h-auto to override `h-9` in buttonVariants
          className: "flex w-full items-center justify-between rounded-md h-auto px-4 py-3",
          variant: "secondary",
        }),
      )}
    >
      <Link className="block w-full" to="/$timerCard" params={{ timerId: timer.id }}>
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

        <Button variant={"destructive"}>
          <TrashIcon />
        </Button>
      </div>
    </div>
  )
}

export default TimerCard
