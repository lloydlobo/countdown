import React from "react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip.tsx"
import { buttonVariants } from "@/components/ui/button.tsx"
import { cn } from "@/lib/utils.ts"

type TooltipButtonProps = {
  icon: React.ComponentType<{ className?: string }>
  tooltip: string
  onClick?: () => void
  variant?: "default" | "outline" | "secondary" | "destructive"
  className?: string
  label?: string
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
        <TooltipTrigger //
          onClick={onClick}
          className={cn(buttonVariants({ variant, className }))}
        >
          <Icon className={"h-5 w-5"} />
          {label && <p className={"ml-3 text-base font-semibold uppercase"}>{label}</p>}
        </TooltipTrigger>
        <TooltipContent className={"bg-secondary"}>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
