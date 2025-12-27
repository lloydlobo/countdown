import { Label } from "@/components/ui/label"
import { existingColors } from "@/utils.ts"
import { CheckIcon } from "lucide-react"

type ColorPickerProps = {
  color: string
  onChange: (color: string) => void
}

const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  return (
    <>
      <div className="mb-2 flex items-center gap-2">
        {color && <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />}
        <Label className="block text-base">Label color</Label>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        {existingColors.map((existingColor) => (
          <div
            key={existingColor}
            className="flex aspect-[9/16] w-32 flex-1 items-center justify-center rounded-md"
            style={{ backgroundColor: existingColor }}
            onClick={() => onChange(existingColor)}
          >
            {existingColor === color && <CheckIcon className="size-6 rounded-md bg-black text-white" />}
          </div>
        ))}
      </div>
    </>
  )
}

export default ColorPicker
