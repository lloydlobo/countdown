import ColorPicker from "@/components/routes/create/color-picker"
import IntervalSwitch from "@/components/routes/create/interval-switch"
import NameInput from "@/components/routes/create/name-input"
import OneTimeSwitch from "@/components/routes/create/one-time-switch.tsx"
import SoundUpload from "@/components/routes/create/sound-upload.tsx"
import SoundVolume from "@/components/routes/create/sound-volume.tsx"
import TimePicker from "@/components/routes/create/time-picker"
import { Button } from "@/components/ui/button"
import type { SoundFile, Time, Timer } from "@/types/core"
import { defaultSoundFile, existingColors, isTimeEmpty } from "@/utils.ts"

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
  const [name, setName] = useState<string>("")
  const [time, setTime] = useState<Time | undefined>(undefined)
  const [color, setColor] = useState(existingColors[0])
  const [volume, setVolume] = useState<number>(1) // 0..1
  const [soundFile, setSoundFile] = useState<SoundFile>(defaultSoundFile)
  const [isInterval, setIsInterval] = useState<boolean>(false)
  const [isOneTime, setIsOneTime] = useState<boolean>(false)

  const navigate = useNavigate()

  const createTimer = async () => {
    if (!name) return toast.error("Name is required")
    if (!time || isTimeEmpty(time)) return toast.error("Time must not be empty.")
    if (!soundFile?.file) return toast.error("Upload a sound file")

    const existingTimers = await get("timers") // idb-keyval

    const newTimer: Timer = {
      id: uuidv4(),
      name: name,
      time: time,
      color: color,
      volume: volume,
      soundFile: soundFile,
      isInterval: isInterval,
      isOneTime: isOneTime,
    }

    await set("timers", [...(existingTimers || []), newTimer]) // idb-keyval

    toast.success("Created timer successfully!")

    await navigate({ to: "/$timerId", params: { timerId: newTimer.id } })
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

      <Button onClick={createTimer}>
        <p className="text-base font-semibold">Create</p>
      </Button>
    </div>
  )
}
