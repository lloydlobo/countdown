import { createRoot } from "react-dom/client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Router, RouterProvider } from "@tanstack/react-router"
import ReactDOM from "react-dom/client"

import { routeTree } from "@/routeTree.gen"

import { Toaster } from "@/components/ui/sonner"

import "@/styles/globals.css"

const queryClient = new QueryClient()

const router = new Router({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  context: {
    queryClient,
  },
})

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById("root")

if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
      <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster />
      </QueryClientProvider>
  )
}

// https://github.com/TanStack/router/blob/main/examples/react/quickstart-file-based/src/main.tsx
