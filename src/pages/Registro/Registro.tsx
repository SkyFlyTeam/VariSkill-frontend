import { type FormEvent, useState } from "react"

import { Link } from "react-router-dom"

import { Eye, EyeOff } from "lucide-react"

import { AuthLayout } from "@/components/shared/AuthLayout/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/authContext"

const inputClassName =
    "h-10 rounded-md border-0 bg-neutral-200 px-3 text-sm shadow-none placeholder:text-neutral-400 focus-visible:ring-1"

export function RegistroPage() {
    const { register } = useAuth()
    const [nome, setNome] = useState("")
    const [apelido, setApelido] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
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
        <AuthLayout heading="Cadastrar">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label
                        htmlFor="nome"
                        className="text-xs font-medium text-neutral-600"
                    >
                        Nome Completo
                    </label>

                    <Input
                        id="nome"
                        value={nome}
                        onChange={(event) => setNome(event.target.value)}
                        placeholder="Joe Doe"
                        autoComplete="name"
                        required
                        className={inputClassName}
                    />
                </div>

                <div className="space-y-1.5">
                    <label
                        htmlFor="apelido"
                        className="text-xs font-medium text-neutral-600"
                    >
                        Apelido
                    </label>

                    <Input
                        id="apelido"
                        value={apelido}
                        onChange={(event) => setApelido(event.target.value)}
                        placeholder="joe.doe"
                        autoComplete="username"
                        required
                        className={inputClassName}
                    />
                </div>

                <div className="space-y-1.5">
                    <label
                        htmlFor="email"
                        className="text-xs font-medium text-neutral-600"
                    >
                        Email
                    </label>

                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="email@gmail.com"
                        autoComplete="email"
                        required
                        className={inputClassName}
                    />
                </div>

                <div className="space-y-1.5">
                    <label
                        htmlFor="password"
                        className="text-xs font-medium text-neutral-600"
                    >
                        Senha
                    </label>

                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="**********"
                            autoComplete="new-password"
                            required
                            className={`${inputClassName} pr-10`}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword((value) => !value)}
                            aria-label={
                                showPassword ? "Ocultar senha" : "Mostrar senha"
                            }
                            className="absolute inset-y-0 right-3 flex items-center text-neutral-500 hover:text-neutral-700"
                        >
                            {showPassword ? (
                                <EyeOff className="size-4" />
                            ) : (
                                <Eye className="size-4" />
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <p role="alert" className="text-sm text-destructive">
                        {error}
                    </p>
                )}

                <Button
                    type="submit"
                    variant="vari"
                    className="h-11 w-full"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Cadastrando..." : "Cadastrar"}
                </Button>

                <p className="text-center text-xs text-neutral-600">
                    Já tem uma conta?{" "}
                    <Link
                        to="/login"
                        className="font-bold text-vari hover:underline"
                    >
                        Entrar
                    </Link>
                </p>
            </form>
        </AuthLayout>
    )
}
