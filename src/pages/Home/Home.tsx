import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/authContext"

export function HomePage() {
    const { logout } = useAuth()
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate("/login")
    }

    return (
        <main className="flex min-h-screen items-center justify-center">
            <div className="space-y-4 text-center">
                <h1 className="text-4xl font-bold">Home</h1>

                <p className="text-muted-foreground">Você está autenticado.</p>

                <Button variant="destructive" onClick={handleLogout}>
                    Sair
                </Button>
            </div>
        </main>
    )
}
