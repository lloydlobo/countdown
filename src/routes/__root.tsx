import { StrictMode } from "react"

import { QueryClient } from "@tanstack/react-query"
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

import GlobalTimer from "@/components/global-timer"
import { ThemeProvider } from "@/components/theme-provider"
import { GITHUB_URL } from "@/constants"
import { GlobalTimerProvider } from "@/context/global-timer/global-timer-provider"

type RouterContext = {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  const Component = (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <GlobalTimerProvider>
          <div className="container">
            <div className="min-h-[calc(100vh-var(--footer-height))]">
              <Outlet />
            </div>

            <div className="flex h-(--footer-height) items-center justify-center">
              <span>
                Made with ❤️ by{" "}
                <a href={GITHUB_URL} target="_blank" className="hover:underline">
                  <span>lloydlobo</span>
                </a>
              </span>
            </div>

            <GlobalTimer />
          </div>
        </GlobalTimerProvider>
      </ThemeProvider>

      <TanStackRouterDevtools position="bottom-right" />
    </>
  )

  let isStrictMode = false
  isStrictMode = typeof window !== "undefined"
  return isStrictMode ? <StrictMode>{Component}</StrictMode> : Component
}

// https://github.com/TanStack/router/blob/main/examples/react/quickstart-file-based/src/routes/__root.tsx
