import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/$timerId/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$timerId/"!</div>
}
