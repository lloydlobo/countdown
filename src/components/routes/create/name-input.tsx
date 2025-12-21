import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

type NameInputProps = {
    name:string;
    onNameChange:(name:string)=>void;
}

const NameInput = ({name,onNameChange}:NameInputProps) => {
    return (
        <>
            <Label htmlFor="timer-name" className="mb-2 block text-base">
                Name your timer
            </Label>

            <Input 
                value={name} 
                id="timer-name" 
                placeholder="Timer name"
                className="text-base"
                onChange={(ev)=>onNameChange(ev.target.value)} 
            />
        </>
    )
}

export default NameInput
