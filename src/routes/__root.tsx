// https://github.com/TanStack/router/blob/main/examples/react/quickstart-file-based/src/routes/__root.tsx
import * as React from "react"
import { StrictMode } from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { GITHUB_URL } from "@/constants"
import { QueryClient } from "@tanstack/react-query"
import { Link, Outlet, createRootRoute, rootRouteWithContext } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

export const Route = rootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <StrictMode>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
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
          </div>
        </ThemeProvider>
        <TanStackRouterDevtools position="bottom-right" />
      </StrictMode>
    </>
  )
}
