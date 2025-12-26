import { Label } from "@/components/ui/label.tsx"
import { Slider } from "@/components/ui/slider.tsx"

import React from "react"

type SoundVolumeProps = {
  volume: number
  onChange: React.Dispatch<React.SetStateAction<number>>
}

const SoundVolume = ({ volume, onChange }: SoundVolumeProps) => {
  return (
    <>
      <Label htmlFor="sound-volume" className="mb-1 block text-base">
        Notification sound volume
      </Label>

      <div className="flex">
        <Slider
          id="sound-volume"
          defaultValue={[1]}
          max={1}
          step={0.01}
          onValueChange={(value) => onChange?.(value[0])}
          value={[volume]}
        />

        <p className="ml-2 text-base font-medium">{Math.floor(volume * 100)}</p>
      </div>
    </>
  )
}

export default SoundVolume
