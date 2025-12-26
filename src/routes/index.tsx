import TimerCard from "@/components/timer-card"
import { Button } from "@/components/ui/button"
import { timersQueryOptions } from "@/queries/timers"

import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"

export const Route = createFileRoute("/")({
  component: Home,
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData(timersQueryOptions)
  },
})

function Home() {
  const { data } = useSuspenseQuery(timersQueryOptions)

  return (
    <div className="flex min-h-[inherit] w-full flex-col justify-center overflow-y-auto py-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Your timers</h1>

        <Link to="/create">
          <Button variant="secondary">
            <PlusIcon className="mr-2 h-6 w-6" />
            <p className="text-base~ hidden text-lg sm:block">Add timer</p>
          </Button>
        </Link>
      </div>

      <div className="mt-4 space-y-2">
        {!data?.length ? (
          <p className="mt-2 text-center text-base">
            You have no timers.{" "}
            <Link to="/create" className="hover:underline">
              Create one
            </Link>
          </p>
        ) : (
          data.map((timer) => <TimerCard timer={timer} key={timer.id} />)
        )}
      </div>
    </div>
  )
}
