import { Label } from "@/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, Tick02Icon } from "@hugeicons/core-free-icons"

type ColorPickerProps = {
    color: string
    onChange: (color: string) => void
}

export const existingColors = [
    "#FF5733",
    "#33FF57",
    "#5733FF",
    "#FF33F6",
    "#33FFF6",
    "#FF8833",
]

const ColorPicker = ({color, onChange}: ColorPickerProps) => {
    return (
        <>
            <div className="mb-2 flex items-center gap-2">
                {color && (<div className="w-3 h-3 rounded-full" style={{backgroundColor:color}} />)}
                <Label className="block text-base">Label color</Label>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
                {existingColors.map((existingColor) => (
                    <div
                        key={existingColor}
                        className="flex items-center justify-center w-32 flex-1 aspect-[9/16] rounded-md" 
                        style={{backgroundColor: existingColor}}
                        onClick={()=>onChange(existingColor)}
                    >
                        {existingColor===color && (
                            <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-6 bg-black rounded-md text-white" />
                        )}
                    </div>
                ))}
            </div>
        </>
    )
}

export default ColorPicker
