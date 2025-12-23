import { StrictMode } from "react"

import GlobalTimer from "@/components/global-timer"
import { ThemeProvider } from "@/components/theme-provider"
import { GITHUB_URL } from "@/constants"
import { GlobalTimerProvider } from "@/context/global-timer-context"
import { QueryClient } from "@tanstack/react-query"
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

type RouterContext = {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <StrictMode>
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
    </StrictMode>
  )
}

// https://github.com/TanStack/router/blob/main/examples/react/quickstart-file-based/src/routes/__root.tsx
