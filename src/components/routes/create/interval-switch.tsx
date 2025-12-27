import { Label } from "@/components/ui/label.tsx"
import { Switch } from "@/components/ui/switch.tsx"
import React from "react"

const IntervalSwitch = ({
  isInterval,
  onChange,
  disabled,
}: {
  isInterval: boolean
  onChange: React.Dispatch<React.SetStateAction<boolean>>
  disabled: boolean
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor="interval-switch" className="block text-base">
          Interval
        </Label>
        <p className="text-muted-foreground text-base">Repeat the timer after it ends</p>
      </div>

      <Switch
        id="interval-switch"
        checked={isInterval}
        onCheckedChange={(checked) => onChange?.(checked)}
        disabled={disabled}
      />
    </div>
  )
}

export default IntervalSwitch
