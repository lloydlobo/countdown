import React, { useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { Time } from "@/types/core"

export interface TimePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  selected: Time | undefined
  onChange: (time: Time) => void
}

const TimePicker = ({ selected, onChange, className, ...props }: TimePickerProps) => {
  const [time, setTime] = useState<Time>({ hours: 0, minutes: 0, seconds: 0 })

  const handleChange = (t: Partial<Time>) => {
    setTime(t)
    onChange(t)
  }

  return (
    <div className={cn("bg-background w-64", className)} {...props}>
      <div className="flex h-72 w-full space-x-2">
        <div className="flex flex-col gap-3">
          <Label htmlFor="time-picker-hours" className="mb-2 block text-center text-base">
            Hours
          </Label>
          <Input
            type="number"
            id="time-picker-hours"
            min={0}
            max={24}
            step={1}
            defaultValue={0}
            onChange={(ev) => handleChange({ ...time, hours: ev.target.value })}
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
        <div className="flex flex-col gap-3">
          <Label htmlFor="time-picker-hours" className="mb-2 block text-center text-base">
            Minutes
          </Label>
          <Input
            type="number"
            id="time-picker-hours"
            min={0}
            max={60}
            step={1}
            defaultValue={0}
            onChange={(ev) => handleChange({ ...time, minutes: ev.target.value })}
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
        <div className="flex flex-col gap-3">
          <Label htmlFor="time-picker-hours" className="mb-2 block text-center text-base">
            Seconds
          </Label>
          <Input
            type="number"
            id="time-picker-hours"
            min={0}
            max={60}
            step={1}
            defaultValue={0}
            onChange={(ev) => handleChange({ ...time, seconds: ev.target.value })}
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
      </div>
    </div>
  )
}

export default TimePicker
