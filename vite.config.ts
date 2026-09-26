import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "")
    return {
        plugins: [react(), tailwindcss()],
        resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
        server: {
            proxy: {
                // Preserva Host/Origin do navegador para a verificação CSRF do
                // Django. localhost e 127.0.0.1 já estão em ALLOWED_HOSTS.
                "/api": {
                    target: env.BACKEND_URL || "http://localhost:8000",
                    changeOrigin: false,
                },
            },
        },
    }
})
