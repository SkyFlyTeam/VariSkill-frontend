import { type FormEvent, useState } from "react"

import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/authContext"

export function RegistroPage() {
    const { register } = useAuth()
    const [nome, setNome] = useState("")
    const [apelido, setApelido] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            await register({ nome, apelido, email, password })
        } catch {
            setError("Não foi possível criar a conta. Verifique os dados.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center p-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm space-y-6 rounded-lg border p-6"
            >
                <div>
                    <h1 className="text-2xl font-bold">Criar conta</h1>

                    <p className="text-sm text-muted-foreground">
                        Preencha os dados para começar.
                    </p>
                </div>

                <div className="space-y-4">
                    <Input
                        value={nome}
                        onChange={(event) => setNome(event.target.value)}
                        placeholder="Nome Completo"
                        autoComplete="name"
                        required
                    />

                    <Input
                        value={apelido}
                        onChange={(event) => setApelido(event.target.value)}
                        placeholder="Apelido"
                        autoComplete="username"
                        required
                    />

                    <Input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Email"
                        autoComplete="email"
                        required
                    />

                    <Input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Senha"
                        autoComplete="new-password"
                        required
                    />

                    {error && (
                        <p role="alert" className="text-sm text-destructive">
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Cadastrando..." : "Cadastrar"}
                    </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    Já tem uma conta?{" "}
                    <Link
                        to="/login"
                        className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                        Entrar
                    </Link>
                </p>
            </form>
        </main>
    )
}
