import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import BaseTimePicker from "@/components/ui/time-picker"
import { cn } from "@/lib/utils"
import type { Time } from "@/types/core"
import { formatTime, isTimeEmpty as isTimeEmpty } from "@/utils"

import { TimerIcon } from "lucide-react"

interface TimePickerProps {
  selected: Time | undefined
  onChange: (time: Time) => void
}

const TimePicker = ({ selected: time, onChange }: TimePickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div>
          <Label className="mb-2 block text-base">Timer time</Label>

          <Button
            variant={"outline"}
            className={cn("w-full justify-start text-left font-normal", !time && "text-muted-foreground")}
          >
            <TimerIcon className="mr-2 h-5 w-5" />
            {time && !isTimeEmpty(time) ? formatTime(time) : <span>Pick a time</span>}
          </Button>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <BaseTimePicker selected={time} onChange={onChange} />
      </PopoverContent>
    </Popover>
  )
}

export default TimePicker
