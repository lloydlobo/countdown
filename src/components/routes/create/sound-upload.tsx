import AddSound from "@/components/routes/create/add-sound.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import soundFilesOptions from "@/queries/sound-files.ts"
import type { SoundFile } from "@/types/core"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2Icon, PlayIcon, PlusIcon, TrashIcon } from "lucide-react"
import React from "react"
import { toast } from "sonner"

type SoundUploadProps = {
  soundFile: SoundFile
  onChange: React.Dispatch<React.SetStateAction<SoundFile>>
}

const defaultSound = new URL("@/assets/default-alarm.m4a", import.meta.url).href

export const defaultSoundFile: SoundFile = {
  id: "default",
  name: "Default notification sound",
  file: defaultSound,
}

const SoundUpload = ({ soundFile, onChange }: SoundUploadProps) => {
  const { data, isLoading } = useQuery(soundFilesOptions)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  const isSoundFileExists = (file: SoundFile | null) => {
    return file && data?.some((soundFile) => soundFile.id === file.id)
  }

  return (
    <>
      <Label htmlFor="sound-upload" className="mb-1 block text-base">
        Notification sound
      </Label>

      <div className="flex items-center gap-2">
        <Select
          value={isSoundFileExists(soundFile) ? soundFile?.id : "default"}
          onValueChange={(value) => {
            if (value === "default") {
              onChange?.(defaultSoundFile)
            } else {
              const soundFile = data?.find((file) => file.id === value)
              if (!soundFile) {
                toast.error("Sound file not found!")
                return
              }
              onChange?.(soundFile)
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Notification sound" />
          </SelectTrigger>

          <SelectContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2Icon className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <SongItem soundFile={defaultSoundFile} />

                {data?.map((file) => (
                  <SongItem soundFile={file} key={file.id} />
                ))}

                <Button
                  onClick={() => {
                    setIsDialogOpen(true)
                  }}
                  className="mt-2 w-full justify-start px-1.5"
                  variant="ghost"
                >
                  <PlusIcon className="h-4 w-4" />
                  <p className="ml-2 hidden text-sm sm:block">
                    <span>[TODO] </span>Add sound
                  </p>
                </Button>
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      <AddSound onOpenChange={(open) => setIsDialogOpen(open)} open={isDialogOpen} onSoundAdded={onChange} />
    </>
  )
}

const SongItem: React.FC<{ soundFile: SoundFile }> = ({ soundFile }) => {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const audioRef = React.useRef<HTMLAudioElement>(null)

  const queryClient = useQueryClient()

  const playSound = () => {
    if (!audioRef.current) {
      return
    }

    let audioUrl = null

    if (soundFile.file instanceof File) {
      audioUrl = URL.createObjectURL(soundFile.file)
    } else if (typeof soundFile.file === "string") {
      audioUrl = soundFile.file
    }

    if (!audioUrl) {
      return
    }

    audioRef.current.src = audioUrl

    audioRef.current.play()
  }

  const stopSound = () => {
    if (!audioRef.current) {
      return
    }

    audioRef.current.pause()
    audioRef.current.currentTime = 0
  }

  const deleteSoundFile = async () => {
    if (soundFile.id === "default") {
      toast.error("Cannot delete default sound file")

      return
    }

    const existingSoundFiles = ((await get("soundFiles")) || []) as SoundFile[]

    await set(
      "soundFiles",
      existingSoundFiles.filter((file) => file.id !== soundFile.id)
    )

    toast.success("Sound file deleted")

    queryClient.invalidateQueries(soundFilesOptions)
  }

  React.useEffect(() => {
    const audio = audioRef.current

    const handleEnded = () => {
      setIsPlaying(false)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    audio?.addEventListener("play", handlePlay)
    audio?.addEventListener("ended", handleEnded)
    audio?.addEventListener("pause", handleEnded)

    return () => {
      audio?.removeEventListener("play", handlePlay)
      audio?.removeEventListener("ended", handleEnded)
      audio?.removeEventListener("pause", handleEnded)
    }
  }, [])

  return (
    <div key={soundFile.id} className="relative">
      <audio
        onError={() => {
          toast.error("Failed to play audio")
        }}
        ref={audioRef}
        className="hidden"
      />

      <SelectItem value={soundFile.id}>{soundFile.name}</SelectItem>

      <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-2">
        <Button className="p-0 hover:opacity-80" variant="ghost" onClick={!isPlaying ? playSound : stopSound}>
          {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
        </Button>

        <Button
          className="p-0 text-red-500 hover:opacity-80"
          variant="ghost"
          onClick={deleteSoundFile}
          disabled={soundFile.id === "default"}
        >
          <TrashIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

export default SoundUpload
