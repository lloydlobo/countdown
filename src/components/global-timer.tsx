import * as portals from "react-reverse-portal"
import { Button } from "./ui/button"
import { Link } from "@tanstack/react-router"
import { ArrowLeftIcon } from "lucide-react"

// eslint-disable-next-line react-refresh/only-export-components
export const portalNode = portals.createHtmlPortalNode<typeof TimerComponent>({
  attributes: {
    class: "w-full h-full min-h-[inherit]",
  },
})

const GlobalTimer = () => {
  return (
    <>
      <div className="flex gap-0">
        <span>Global</span> <span>Timer</span>
      </div>
    </>
  )
}

export const TimerComponent = ({ timer, isMinimized = false, onRun }) => {
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

      <div className="flex flex-col md:flex-row md:items-center md:gap-2">
        <p className="text-8xl font-bold uppercase tabular-nums md:text-9xl">
          {timer.hours.toString().padStart(2, "0")}
        </p>

        <p className="hidden text-8xl font-bold uppercase tabular-nums md:block md:text-9xl">:</p>
        <p className="-mt-14 text-8xl font-bold uppercase tabular-nums md:-mt-20 md:hidden md:text-9xl">..</p>

        <p className="text-8xl font-bold uppercase tabular-nums md:text-9xl">
          {timer.minutes.toString().padStart(2, "0")}
        </p>

        <p className="hidden text-8xl font-bold uppercase tabular-nums md:block md:text-9xl">:</p>
        <p className="-mt-14 text-8xl font-bold uppercase tabular-nums md:-mt-20 md:hidden md:text-9xl">..</p>

        <p className="text-8xl font-bold uppercase tabular-nums md:text-9xl">
          {timer.seconds.toString().padStart(2, "0")}
        </p>
      </div>
    </div>
  )
}

export default GlobalTimer
