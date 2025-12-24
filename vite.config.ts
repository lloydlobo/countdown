import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import {tanstackRouter} from "@tanstack/router-plugin/vite"

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        // https://tanstack.com/router/latest/docs/framework/react/installation/with-vite
        // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
        tanstackRouter({
            target: 'react',
            autoCodeSplitting: true,
        }),
        react(), tailwindcss()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
        base: "/countdown/", // GITHUB repo to deploy via gh-pages as GitHub pages
})
