import { Label } from "@/components/ui/label.tsx"
import { Switch } from "@/components/ui/switch.tsx"

import React from "react"

const OneTimeSwitch = ({
  isOneTime,
  onChange,
  disabled,
}: {
  isOneTime: boolean
  onChange: React.Dispatch<React.SetStateAction<boolean>>
  disabled: boolean
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor="interval-switch" className="block text-base">
          One time
        </Label>
        <p className="text-muted-foreground text-base">Delete the timer after it ends</p>
      </div>

      <Switch checked={isOneTime} onCheckedChange={(checked) => onChange?.(checked)} disabled={disabled} />
    </div>
  )
}

export default OneTimeSwitch
