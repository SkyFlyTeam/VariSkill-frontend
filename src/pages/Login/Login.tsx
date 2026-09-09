import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/authContext"

export function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()

    function handleLogin() {
        login()
        navigate("/")
    }

    return (
        <main className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-sm space-y-6 rounded-lg border p-6">
                <div>
                    <h1 className="text-2xl font-bold">Login</h1>

                    <p className="text-sm text-muted-foreground">
                        Entre para acessar o sistema.
                    </p>
                </div>

                <div className="space-y-4">
                    <Input type="email" placeholder="seu@email.com" />

                    <Input type="password" placeholder="Sua senha" />

                    <Button className="w-full" onClick={handleLogin}>
                        Entrar
                    </Button>
                </div>
            </div>
        </main>
    )
}
