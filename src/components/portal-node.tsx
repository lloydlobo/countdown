import { TimerComponent } from "@/components/timer-component.tsx"

import * as portals from "react-reverse-portal"

export const portalNode = portals.createHtmlPortalNode<typeof TimerComponent>({
  attributes: {
    class: "w-full h-full min-h-[inherit]",
  },
})
