import {useState} from "react"

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeftIcon } from "lucide-react"
import {toast} from "sonner"

import { Button } from "@/components/ui/button"
import NameInput from "@/components/routes/create/name-input"
import TimePicker from "@/components/routes/create/time-picker"
import { Time } from "@/components/ui/time-picker"

import {v4 as uuidv4} from "uuid"

export const Route = createFileRoute("/create/")({
  component: CreateTimer,
})

function CreateTimer() {
    const [name,setName] = useState("")
    const [time,setTime] = useState<Time|undefined>(undefined)

    const navigate = useNavigate()

    const createTimer = async () => {
        if (!name) {
            return toast.error("Please enter a name.")
        }

        const newTimer = {
            id: uuidv4(),
        }

        toast.success("Created timer successfully!")
        navigate({to:"/$timerId",params:{timerId:newTimer.id}})
    }

  return (
    <div className="flex flex-col justify-center min-h-[inherit] py-20 w-full space-y-8">
      <Link to="/">
        <Button variant="secondary" className="flex items-center">
          <ArrowLeftIcon className="mr-2 h-6 w-6" />

          <p className="text-xl~ text-lg">Go back</p>
        </Button>
      </Link>

      <h1 className="text-4xl font-semibold">Create timer</h1>

      <div>
        <NameInput name={name} onNameChange={setName} />
      </div>

      <div>
        <TimePicker selected={time} onChange={(time)=>setTime(time)} />
      </div>

      <Button onClick={createTimer}>
        <p className="font-semibold text-base">Create</p>
      </Button>
    </div>
  )
}
