```typescript
// lib/timer-utils.ts
export const isTimeEmpty = (time: Time) => {
  return time.hours === 0 && time.minutes === 0 && time.seconds === 0;
};
```

```typescript
// hooks/use-audio-player.ts
import { useEffect, useRef, useState } from "react";

export const useAudioPlayer = (file: File | string, volume: number) => {
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);

  const setSrc = () => {
    const audioUrl = typeof file === "string" ? file : URL.createObjectURL(file);
    audioRef.current.src = audioUrl;
  };

  const play = () => {
    audioRef.current.play();
    audioRef.current.volume = volume;
  };

  const pause = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handleEnded);
    audio.addEventListener("play", handlePlay);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handleEnded);
      audio.removeEventListener("play", handlePlay);
    };
  }, []);

  return { isPlaying, play, pause, setSrc };
};
```

```typescript
// hooks/use-countdown.ts
import { useEffect, useRef, useState } from "react";
import { Time } from "@/components/ui/time-picker";
import { isTimeEmpty } from "@/lib/timer-utils";

interface UseCountdownOptions {
  initialTime: Time;
  onComplete: () => void;
}

export const useCountdown = ({ initialTime, onComplete }: UseCountdownOptions) => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  const start = () => {
    if (isTimeEmpty(time)) {
      setTime(initialTime);
    }
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current!);
  };

  const reset = () => {
    setTime(initialTime);
    pause();
  };

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTime((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          onComplete();
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [isRunning, onComplete]);

  useEffect(() => {
    setTime(initialTime);
    pause();
  }, [initialTime]);

  return { time, isRunning, start, pause, reset };
};
```

```typescript
// mutations/delete-timer.ts
import { get, set } from "idb-keyval";
import { toast } from "sonner";
import { Timer } from "@/types/core";

export const deleteTimer = async (timer: Timer) => {
  const timers = (await get("timers")) as Timer[] | undefined;
  if (!timers) return;

  const newTimers = timers.filter((t) => t.id !== timer.id);
  await set("timers", newTimers);

  toast.success(
    <span>
      Successfully deleted <span className="font-semibold">{timer.name}</span>.
    </span>
  );
};
```

```typescript
// components/tooltip-button.tsx
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TooltipButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  tooltip: string;
  onClick?: () => void;
  variant?: "default" | "outline" | "secondary" | "destructive";
  className?: string;
  label?: string;
}

export const TooltipButton: React.FC<TooltipButtonProps> = ({
  icon: Icon,
  tooltip,
  onClick,
  variant = "default",
  className,
  label,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          onClick={onClick}
          className={cn(buttonVariants({ variant, className }))}
        >
          <Icon className="w-5 h-5" />
          {label && <p className="uppercase font-semibold text-base ml-3">{label}</p>}
        </TooltipTrigger>
        <TooltipContent className="bg-secondary">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
```

```typescript
// components/time-display.tsx
import { Time } from "@/components/ui/time-picker";

interface TimeDisplayProps {
  time: Time;
  size?: "sm" | "lg";
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({ time, size = "lg" }) => {
  const textSize = size === "sm" ? "text-2xl" : "text-8xl md:text-9xl";
  const separator = size === "sm" ? ":" : undefined;

  return (
    <div className="flex flex-col md:flex-row md:items-center md:gap-2">
      <p className={`${textSize} font-bold uppercase tabular-nums`}>
        {time.hours.toString().padStart(2, "0")}
      </p>
      <p className={`${textSize} font-bold uppercase ${separator ? '' : 'hidden md:block'} tabular-nums`}>
        {separator || ":"}
      </p>
      {!separator && (
        <p className={`${textSize} font-bold uppercase md:hidden -mt-14 md:-mt-20 tabular-nums`}>
          ..
        </p>
      )}
      <p className={`${textSize} font-bold uppercase tabular-nums`}>
        {time.minutes.toString().padStart(2, "0")}
      </p>
      <p className={`${textSize} font-bold uppercase ${separator ? '' : 'hidden md:block'} tabular-nums`}>
        {separator || ":"}
      </p>
      {!separator && (
        <p className={`${textSize} font-bold uppercase md:hidden -mt-14 md:-mt-20 tabular-nums`}>
          ..
        </p>
      )}
      <p className={`${textSize} font-bold uppercase mt-0 tabular-nums`}>
        {time.seconds.toString().padStart(2, "0")}
      </p>
    </div>
  );
};
```

```typescript
// components/timer-minimized.tsx
import { Link } from "@tanstack/react-router";
import { Timer } from "@/types/core";
import { Time } from "@/components/ui/time-picker";
import { TimeDisplay } from "./time-display";
import { TooltipButton } from "./tooltip-button";
import {
  PauseIcon,
  PlayIcon,
  TimerResetIcon,
  PencilIcon,
  MaximizeIcon,
} from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimerMinimizedProps {
  timer: Timer;
  time: Time;
  isRunning: boolean;
  isAudioPlaying: boolean;
  onStartPause: () => void;
  onReset: () => void;
  onAudioToggle: () => void;
}

export const TimerMinimized: React.FC<TimerMinimizedProps> = ({
  timer,
  time,
  isRunning,
  isAudioPlaying,
  onStartPause,
  onReset,
  onAudioToggle,
}) => {
  return (
    <div className="gap-4 sm:gap-8 flex flex-wrap items-center justify-center fixed top-0 right-0 sm:top-auto sm:bottom-4 sm:right-4 bg-secondary px-4 py-2 rounded-md">
      <div className="flex gap-2">
        <p className="text-2xl font-bold uppercase tabular-nums">
          {time.hours.toString().padStart(2, "0")}
        </p>
        <p className="text-2xl font-bold uppercase tabular-nums">:</p>
        <p className="text-2xl font-bold uppercase tabular-nums">
          {time.minutes.toString().padStart(2, "0")}
        </p>
        <p className="text-2xl font-bold uppercase">:</p>
        <p className="text-2xl font-bold uppercase mt-0 tabular-nums">
          {time.seconds.toString().padStart(2, "0")}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <TooltipButton
          icon={isRunning ? PauseIcon : PlayIcon}
          tooltip={isRunning ? "Pause the timer" : "Start the timer"}
          onClick={onStartPause}
          className="py-4"
        />

        <TooltipButton
          icon={TimerResetIcon}
          tooltip="Reset the timer"
          onClick={onReset}
          variant="outline"
          className="grow py-4"
        />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/$timerId/edit"
                params={{ timerId: timer.id }}
                className={cn(buttonVariants({ variant: "outline", className: "grow py-4" }))}
              >
                <PencilIcon className="w-5 h-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent className="bg-secondary">Edit the timer</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/$timerId"
                params={{ timerId: timer.id }}
                className={cn(buttonVariants({ variant: "outline", className: "grow py-4" }))}
              >
                <MaximizeIcon className="w-5 h-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent className="bg-secondary">Open the timer</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipButton
          icon={isAudioPlaying ? PauseIcon : PlayIcon}
          tooltip={isAudioPlaying ? "Pause the sound" : "Play the sound"}
          onClick={onAudioToggle}
          variant="destructive"
          className="grow py-4"
        />
      </div>
    </div>
  );
};
```

```typescript
// components/timer-full.tsx
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Timer } from "@/types/core";
import { Time } from "@/components/ui/time-picker";
import { TimeDisplay } from "./time-display";
import { TooltipButton } from "./tooltip-button";
import {
  ArrowLeftIcon,
  PauseIcon,
  PlayIcon,
  TimerResetIcon,
  PencilIcon,
} from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimerFullProps {
  timer: Timer;
  time: Time;
  isRunning: boolean;
  isAudioPlaying: boolean;
  onStartPause: () => void;
  onReset: () => void;
  onAudioToggle: () => void;
}

export const TimerFull: React.FC<TimerFullProps> = ({
  timer,
  time,
  isRunning,
  isAudioPlaying,
  onStartPause,
  onReset,
  onAudioToggle,
}) => {
  return (
    <div className="py-20 relative flex flex-col items-center justify-center h-full w-full min-h-[inherit]">
      <Link to="/">
        <Button variant="ghost" className="flex items-center absolute left-4 top-4 md:left-4 md:top-16">
          <ArrowLeftIcon className="w-6 h-6 mr-2 shrink-0" />
          <p className="text-xl">Go back</p>
        </Button>
      </Link>

      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: timer.color }} />
        <p className="font-semibold text-xl" style={{ color: timer.color }}>
          {timer.name}
        </p>
      </div>

      <TimeDisplay time={time} size="lg" />

      <div className="flex flex-col md:flex-row gap-2 mt-8">
        <TooltipButton
          icon={isRunning ? PauseIcon : PlayIcon}
          label={isRunning ? "Pause" : "Start"}
          tooltip={isRunning ? "Pause the timer" : "Start the timer"}
          onClick={onStartPause}
          className="px-16 py-4"
        />

        <div className="flex gap-2 grow">
          <TooltipButton
            icon={TimerResetIcon}
            tooltip="Reset the timer"
            onClick={onReset}
            variant="secondary"
            className="grow py-4"
          />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/$timerId/edit"
                  params={{ timerId: timer.id }}
                  className={cn(buttonVariants({ variant: "secondary", className: "grow py-4 h-full" }))}
                >
                  <PencilIcon className="w-5 h-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent className="bg-secondary">Edit the timer</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipButton
            icon={isAudioPlaying ? PauseIcon : PlayIcon}
            tooltip={isAudioPlaying ? "Pause the sound" : "Play the sound"}
            onClick={onAudioToggle}
            variant="destructive"
            className="grow py-4"
          />
        </div>
      </div>
    </div>
  );
};
```

```typescript
// hooks/use-timer.ts
import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Timer } from "@/types/core";
import { useCountdown } from "./use-countdown";
import { useAudioPlayer } from "./use-audio-player";
import { useGlobalTimer } from "@/context/global-timer-context";
import { deleteTimer as deleteTimerMutation } from "@/mutations/delete-timer";
import { timersQueryOptions } from "@/queries/timers";

export const useTimer = (timer: Timer, onRun?: (isRunning: boolean) => void) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setTimer } = useGlobalTimer();
  const audio = useAudioPlayer(timer.file, timer.volume);

  const handleComplete = useCallback(() => {
    audio.setSrc();
    audio.play();

    if (timer.isOneTime) {
      deleteTimerMutation(timer);
      setTimer(null);
      queryClient.invalidateQueries(timersQueryOptions);
      navigate({ to: "/", replace: true });
    } else if (!timer.isInterval) {
      countdown.pause();
    }
  }, [timer, audio, navigate, queryClient, setTimer]);

  const countdown = useCountdown({
    initialTime: timer.time,
    onComplete: handleComplete,
  });

  const handleStartPause = () => {
    if (countdown.isRunning) {
      countdown.pause();
    } else {
      countdown.start();
    }
  };

  const handleAudioToggle = () => {
    audio.setSrc();
    if (audio.isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  return {
    time: countdown.time,
    isRunning: countdown.isRunning,
    isAudioPlaying: audio.isPlaying,
    onStartPause: handleStartPause,
    onReset: countdown.reset,
    onAudioToggle: handleAudioToggle,
  };
};
```

```typescript
// components/timer-portal.ts
import * as portals from "react-reverse-portal";
import { TimerComponent } from "./timer-component";

export const portalNode = portals.createHtmlPortalNode<typeof TimerComponent>({
  attributes: {
    class: "w-full h-full min-h-[inherit]",
  },
});
```

```typescript
// components/timer-component.tsx
import React from "react";
import { Timer } from "@/types/core";
import { useTimer } from "@/hooks/use-timer";
import { TimerMinimized } from "./timer-minimized";
import { TimerFull } from "./timer-full";

export interface TimerProps {
  timer: Timer;
  isMinimized?: boolean;
  onRun?: (isRunning: boolean) => void;
}

export const TimerComponent: React.FC<TimerProps> = ({
  timer,
  isMinimized = false,
  onRun,
}) => {
  const timerState = useTimer(timer, onRun);

  if (isMinimized) {
    return <TimerMinimized timer={timer} {...timerState} />;
  }

  return <TimerFull timer={timer} {...timerState} />;
};
```

```typescript
// components/global-timer.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import * as portals from "react-reverse-portal";
import { useGlobalTimer } from "@/context/global-timer-context";
import { portalNode } from "./timer-portal";
import { TimerComponent } from "./timer-component";

const GlobalTimer = () => {
  const router = useRouter();
  const { timer, setIsRunning } = useGlobalTimer();
  const [isMatch, setIsMatch] = useState(
    // @ts-expect-error matchRoute expect params, which is not needed here
    !!router.matchRoute({ to: "/$timerId" })
  );

  useEffect(() => {
    const unsub = router.subscribe("onResolved", (e) => {
      setIsMatch(e.toLocation.href === `/${timer?.id}`);
    });
    return unsub;
  }, [timer, router]);

  useEffect(() => {
    // @ts-expect-error matchRoute expect params, which is not needed here
    setIsMatch(!!router.matchRoute({ to: "/$timerId" }));
  }, [router, timer?.id]);

  return (
    <React.Fragment>
      <portals.InPortal node={portalNode}>
        {timer && <TimerComponent onRun={setIsRunning} timer={timer} />}
      </portals.InPortal>

      {!isMatch && (
        <portals.OutPortal<typeof TimerComponent>
          isMinimized={true}
          node={portalNode}
        />
      )}
    </React.Fragment>
  );
};

export default GlobalTimer;
```

---

```typescript
// components/timer-display.tsx

import React from "react";
import { Timer } from "@/types/core";
import { Time } from "@/components/ui/time-picker";
import { Link } from "@tanstack/react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
PauseIcon,
PlayIcon,
TimerResetIcon,
PencilIcon,
MaximizeIcon,
ArrowLeftIcon,
} from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface TimerDisplayProps {
timer: Timer;
time: Time;
isRunning: boolean;
isAudioPlaying: boolean;
onStartPause: () => void;
onReset: () => void;
onAudioToggle: () => void;
minimized?: boolean;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ timer, time, isRunning, isAudioPlaying, onStartPause, onReset, onAudioToggle, minimized = false, }) => {
const textSize = minimized ? "text-2xl" : "text-8xl md:text-9xl";
const separator = ":";

if (minimized) {
return (
<div className="gap-4 sm:gap-8 flex flex-wrap items-center justify-center fixed top-0 right-0 sm:top-auto sm:bottom-4 sm:right-4 bg-secondary px-4 py-2 rounded-md">
<div className="flex gap-2">
<p className={`${textSize} font-bold uppercase tabular-nums`}>
{time.hours.toString().padStart(2, "0")}
</p>
<p className={`${textSize} font-bold uppercase tabular-nums`}>{separator}</p>
<p className={`${textSize} font-bold uppercase tabular-nums`}>
{time.minutes.toString().padStart(2, "0")}
</p>
<p className={`${textSize} font-bold uppercase tabular-nums`}>{separator}</p>
<p className={`${textSize} font-bold uppercase tabular-nums`}>
{time.seconds.toString().padStart(2, "0")}
</p>
</div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                onClick={onStartPause}
                className={cn(buttonVariants({ variant: "default", className: "py-4" }))}
              >
                {isRunning ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
              </TooltipTrigger>
              <TooltipContent className="bg-secondary">
                {isRunning ? "Pause the timer" : "Start the timer"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                onClick={onReset}
                className={cn(buttonVariants({ variant: "outline", className: "grow py-4" }))}
              >
                <TimerResetIcon className="w-5 h-5" />
              </TooltipTrigger>
              <TooltipContent className="bg-secondary">Reset the timer</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Link to={`/$timerId/edit`} params={{ timerId: timer.id }}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="grow py-4">
                    <PencilIcon className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-secondary">Edit the timer</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Link>

          <Link to={`/$timerId`} params={{ timerId: timer.id }}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="grow py-4">
                    <MaximizeIcon className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-secondary">Open the timer</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Link>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                onClick={onAudioToggle}
                className={cn(buttonVariants({ variant: "destructive", className: "grow py-4" }))}
              >
                {isAudioPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
              </TooltipTrigger>
              <TooltipContent className="bg-secondary">
                {isAudioPlaying ? "Pause the sound" : "Play the sound"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
}

return (
<div className="py-20 relative flex flex-col items-center justify-center h-full w-full min-h-[inherit]">
<Link to="/">
<Button variant="ghost" className="flex items-center absolute left-4 top-4 md:left-4 md:top-16">
<ArrowLeftIcon className="w-6 h-6 mr-2 shrink-0" />
<p className="text-xl">Go back</p>
</Button>
</Link>

      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: timer.color }} />
        <p className="font-semibold text-xl" style={{ color: timer.color }}>
          {timer.name}
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:gap-2 mt-4">
        <p className={`${textSize} font-bold uppercase tabular-nums`}>
          {time.hours.toString().padStart(2, "0")}
        </p>
        <p className={`${textSize} font-bold uppercase hidden md:block tabular-nums`}>:</p>
        <p className={`${textSize} font-bold uppercase md:hidden -mt-14 md:-mt-20 tabular-nums`}>..</p>

        <p className={`${textSize} font-bold uppercase tabular-nums`}>
          {time.minutes.toString().padStart(2, "0")}
        </p>
        <p className={`${textSize} font-bold uppercase hidden md:block tabular-nums`}>:</p>
        <p className={`${textSize} font-bold uppercase md:hidden -mt-14 md:-mt-20 tabular-nums`}>..</p>

        <p className={`${textSize} font-bold uppercase mt-0 tabular-nums`}>
          {time.seconds.toString().padStart(2, "0")}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-2 mt-8">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              onClick={onStartPause}
              className={cn(buttonVariants({ variant: "default", className: "px-16 py-4" }))}
            >
              <div className="flex items-center">
                {isRunning ? (
                  <>
                    <PauseIcon className="w-5 h-5 mr-3" />
                    <p className="uppercase font-semibold text-base">Pause</p>
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-5 h-5 mr-3" />
                    <p className="uppercase font-semibold text-base">Start</p>
                  </>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-secondary">
              {isRunning ? "Pause the timer" : "Start the timer"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex gap-2 grow">
          <TooltipButton icon={TimerResetIcon} tooltip="Reset the timer" onClick={onReset} variant="secondary" className="grow py-4" />
          <Link to={`/$timerId/edit`} params={{ timerId: timer.id }} className="block">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" className="grow py-4 h-full">
                    <PencilIcon className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-secondary">Edit the timer</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Link>
          <TooltipButton
            icon={isAudioPlaying ? PauseIcon : PlayIcon}
            tooltip={isAudioPlaying ? "Pause the sound" : "Play the sound"}
            onClick={onAudioToggle}
            variant="destructive"
            className="grow py-4"
          />
        </div>
      </div>
    </div>
);
};
```


