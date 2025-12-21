import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/$timerId/edit")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$timerId/edit"!</div>
}
