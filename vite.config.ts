import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        // MOCK-TEMP-ADJACENT: o backend Django ainda não tem CORS configurado.
        // Esse proxy faz o navegador enxergar /api como same-origin em dev,
        // evitando o bloqueio de CORS sem precisar mexer no backend. Remover
        // (ou ajustar pra produção) quando o backend expuser CORS/estiver
        // atrás do mesmo domínio.
        proxy: {
            "/api": {
                target: "http://localhost:8000",
                changeOrigin: true,
            },
        },
    },
})
