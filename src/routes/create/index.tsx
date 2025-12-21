import NameInput from "@/components/routes/create/name-input"
import TimePicker from "@/components/routes/create/time-picker"
import { Button } from "@/components/ui/button"
import type { Time } from "@/types/core"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { get, set } from "idb-keyval"
import { ArrowLeftIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"

export const Route = createFileRoute("/create/")({
  component: CreateTimer,
})

function CreateTimer() {
  const [name, setName] = useState("")
  const [time, setTime] = useState<Time | undefined>(undefined)

  const navigate = useNavigate()

  const createTimer = async () => {
    if (!name) {
      return toast.error("Please enter a name.")
    }

    const existingTimers = await get("timers") // idb-keyval

    const newTimer = {
      id: uuidv4(),
      name,
      time,
    }

    await set("timers", [...(existingTimers || []), newTimer]) // idb-keyval

    toast.success("Created timer successfully!")

    navigate({ to: "/$timerId", params: { timerId: newTimer.id } })
  }

  return (
    <div className="flex min-h-[inherit] w-full flex-col justify-center space-y-8 py-20">
      <Link to="/">
        <Button variant="secondary" className="flex items-center">
          <ArrowLeftIcon className="mr-2 h-6 w-6 shrink-0" />

          <p className="text-xl~ text-lg">Go back</p>
        </Button>
      </Link>

      <h1 className="text-4xl font-semibold">Create timer</h1>

      <div>
        <NameInput name={name} onNameChange={setName} />
      </div>

      <div>
        <TimePicker selected={time} onChange={(time) => setTime(time)} />
      </div>

      <Button onClick={createTimer}>
        <p className="text-base font-semibold">Create</p>
      </Button>
    </div>
  )
}
