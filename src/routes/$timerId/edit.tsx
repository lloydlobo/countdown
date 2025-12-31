import ColorPicker from "@/components/routes/create/color-picker"
import IntervalSwitch from "@/components/routes/create/interval-switch"
import NameInput from "@/components/routes/create/name-input.tsx"
import OneTimeSwitch from "@/components/routes/create/one-time-switch.tsx"
import SoundUpload from "@/components/routes/create/sound-upload"
import SoundVolume from "@/components/routes/create/sound-volume.tsx"
import TimePicker from "@/components/routes/create/time-picker"
import { Button } from "@/components/ui/button.tsx"
import { timerQueryOptions } from "@/queries/timer.ts"
import type { SoundFile, Time, Timer } from "@/types/core.ts"
import { isTimeEmpty } from "@/utils.ts"

import { useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { get, set } from "idb-keyval"
import { ArrowLeftIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export const Route = createFileRoute("/$timerId/edit")({
  component: EditTimerComponent,
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(
      timerQueryOptions(params.timerId) // options
    )
    if (!data) throw new Error("Timer not found")
    return data
  },
  errorComponent: () => (
    <div className="flex h-full min-h-[inherit] w-full flex-col items-center justify-center">
      <p className="text-6xl font-semibold">Timer not found</p>
      <Link to="/">
        <Button className="mt-8">
          <p className="text-xl font-semibold">Go back</p>
        </Button>
      </Link>
    </div>
  ),
})

// TODO: Direct mutation is risky; consider .map() for existingTimers.
// TODO: Add a loading state to the button to disable it while the save is pending.
function EditTimerComponent() {
  const timer = Route.useLoaderData()! // NOTE: ! (non-null assertion) is fine here since the errorComponent handles the null case.

  const [name, setName] = useState<string>(timer.name)
  const [time, setTime] = useState<Time | undefined>(timer.time)
  const [color, setColor] = useState<string>(timer.color)
  const [volume, setVolume] = useState<number>(timer.volume)
  const [soundFile, setSoundFile] = useState<SoundFile>(timer.soundFile)
  const [isInterval, setIsInterval] = useState<boolean>(timer.isInterval)
  const [isOneTime, setIsOneTime] = useState<boolean>(timer.isOneTime)

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Ensure that if the IndexedDB write takes 200ms, the user can't spam the
  // "Edit" button and trigger multiple
  // navigations.
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const editTimer = async () => {
    if (!name) return toast.error("Name is required")
    if (!time || isTimeEmpty(time)) return toast.error("Time must not be empty.")
    if (!soundFile?.file) return toast.error("Upload a sound file")

    setIsSaving(true)

    try {
      const existingTimers = (await get("timers")) as Timer[]
      const existingTimer = existingTimers.find((existingTimer) => existingTimer.id === timer.id)
      if (!existingTimer) return toast.error("Timer not found")

      // NOTE: Update existingTimer by reference, i.e., it is a pointer to the
      // exact same memory location as the object inside the existingTimers array.
      Object.assign(existingTimer, { name, time, color, volume, soundFile, isInterval, isOneTime })

      await set("timers", existingTimers)

      await queryClient.invalidateQueries(timerQueryOptions(existingTimer.id))
      toast.success("Edited timer successfully!")
      await navigate({ to: "/$timerId", params: { timerId: existingTimer.id } })
    } catch (err) {
      toast.error("Failed to save changes")
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-[inherit] w-full flex-col justify-center space-y-8 py-20">
      <Link to="/">
        <Button variant="secondary" className="flex items-center">
          <ArrowLeftIcon className="mr-2 h-6 w-6 shrink-0" />
          <p className="text-xl~ text-lg">Go back</p>
        </Button>
      </Link>

      <h1 className="text-4xl font-semibold">Edit timer</h1>

      <div>
        <NameInput name={name} onNameChange={setName} />
      </div>

      <div>
        <TimePicker selected={time} onChange={(time) => setTime(time)} />
      </div>

      <div>
        <ColorPicker color={color} onChange={setColor} />
      </div>

      <div>
        <SoundUpload soundFile={soundFile} onChange={setSoundFile} />
      </div>

      <div>
        <SoundVolume volume={volume} onChange={setVolume} />
      </div>

      <div>
        <IntervalSwitch isInterval={isInterval} onChange={setIsInterval} disabled={isOneTime} />
      </div>

      <div>
        <OneTimeSwitch isOneTime={isOneTime} onChange={setIsOneTime} disabled={isInterval} />
      </div>

      <Button onClick={editTimer} disabled={isSaving}>
        <p className="text-base font-semibold">{isSaving ? "Saving..." : "Edit"}</p>
      </Button>
    </div>
  )
}
