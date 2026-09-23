import { ToastProvider } from "@/components/shared/toast"
import { AuthProvider } from "@/contexts/authContext"
import { AppRoutes } from "@/routes/routes"

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <AppRoutes />
            </ToastProvider>
        </AuthProvider>
    )
}

export default App
