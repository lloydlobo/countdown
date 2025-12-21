import { Link, createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { PlusIcon } from "lucide-react"

import { ComponentExample } from "@/components/component-example"
import { Button } from "@/components/ui/button"

// import { FileRouter } from "@tanstack/react-router"

// export const Route = new FileRoute("/").createRoute({
export const Route = createFileRoute("/")({
  component: Home,
  // loader: async ({ context }) => {
  //     return context.queryClient.ensureQueryData(timersQueryOptions)
  // },
})

function Home() {
  return (
    <div className="flex min-h-[inherit] w-full flex-col justify-center overflow-y-auto py-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Your timers</h1>

        <Link to="/create">
          <Button variant={"secondary"}>
            <PlusIcon className="h-6 w-6" />

            <p className="ml-2 hidden text-base sm:block">Add timer</p>
          </Button>
        </Link>
      </div>

      <div className="mt-4 space-y-2">
        <p className="mt-2 text-center text-base">
          You have no timers.{" "}
          <Link to="/create" className="hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
