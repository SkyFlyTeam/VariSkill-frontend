import { type FormEvent, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/authContext"
import { ApiError } from "@/services/api"

export function LoginPage() {
    const { login, loading, sessionError } = useAuth()
    const [apelido, setApelido] = useState("")
    const [password, setPassword] = useState("")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleLogin(event: FormEvent) {
        event.preventDefault()
        setSaving(true)
        setError(null)
        try {
            await login({ apelido: apelido.trim(), password })
        } catch (error) {
            setError(
                error instanceof ApiError && error.status === 400
                    ? "Apelido ou senha incorretos."
                    : "Não foi possível entrar. Verifique a conexão com o servidor.",
            )
        } finally {
            setSaving(false)
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center p-4">
            <form
                onSubmit={handleLogin}
                className="w-full max-w-sm space-y-6 rounded-lg border p-6"
            >
                <div>
                    <h1 className="text-2xl font-bold">Login</h1>
                    <p className="text-sm text-muted-foreground">
                        Entre para acessar o sistema.
                    </p>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label
                            htmlFor="login-apelido"
                            className="text-sm font-medium"
                        >
                            Apelido
                        </label>
                        <Input
                            id="login-apelido"
                            autoComplete="username"
                            placeholder="Seu apelido"
                            required
                            value={apelido}
                            onChange={(event) => setApelido(event.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label
                            htmlFor="login-password"
                            className="text-sm font-medium"
                        >
                            Senha
                        </label>
                        <Input
                            id="login-password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Sua senha"
                            required
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                        />
                    </div>
                    {(error || sessionError) && (
                        <p role="alert" className="text-sm text-red-700">
                            {error || sessionError}
                        </p>
                    )}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={
                            loading || saving || !apelido.trim() || !password
                        }
                    >
                        {saving ? "Entrando..." : "Entrar"}
                    </Button>
                </div>
            </form>
        </main>
    )
}
