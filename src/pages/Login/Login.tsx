import { type FormEvent, useState } from "react"

import { Link, useNavigate } from "react-router-dom"

import { Eye, EyeOff } from "lucide-react"

import { AuthLayout } from "@/components/shared/AuthLayout/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/authContext"
import { ApiError } from "@/services/http"
import { validateLogin } from "@/utils/validation"

const inputClassName =
    "h-10 rounded-[10px] border border-[#cad5e2] bg-white px-3 text-sm shadow-none placeholder:text-neutral-400 focus-visible:ring-1"

const labelClassName = "text-[14px] leading-[20px] font-medium text-[#101828]"

export function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)

        const validationErrors = validateLogin({ email, password })
        setFieldErrors(validationErrors)

        if (Object.keys(validationErrors).length > 0) {
            return
        }

        setIsSubmitting(true)

        try {
            await login(email, password)
            // Provisório: leva direto pro preview da tela de lição (VAR-68).
            navigate("/preview/licao")
        } catch (requestError) {
            if (
                requestError instanceof ApiError &&
                requestError.status === 400
            ) {
                setError("Email ou senha inválidos.")
            } else {
                setError("Não foi possível entrar. Tente novamente.")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AuthLayout slogan="Transforme curiosidade em habilidade.">
            <form
                noValidate
                onSubmit={handleSubmit}
                className="flex flex-col gap-[25px]"
            >
                <h1 className="font-poppins text-[24px] leading-[100%] font-bold tracking-normal text-[#101828]">
                    Entrar
                </h1>
                <div className="space-y-1.5">
                    <label htmlFor="email" className={labelClassName}>
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
                        aria-invalid={Boolean(fieldErrors.email)}
                        className={inputClassName}
                    />

                    {fieldErrors.email && (
                        <p role="alert" className="text-xs text-destructive">
                            {fieldErrors.email}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="password" className={labelClassName}>
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
                            autoComplete="current-password"
                            required
                            aria-invalid={Boolean(fieldErrors.password)}
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

                    {fieldErrors.password && (
                        <p role="alert" className="text-xs text-destructive">
                            {fieldErrors.password}
                        </p>
                    )}
                </div>

                {error && (
                    <p role="alert" className="text-sm text-destructive">
                        {error}
                    </p>
                )}

                <Button
                    type="submit"
                    variant="vari"
                    className="h-auto w-full rounded-[10px] px-[35px] py-[20px] text-[16px] leading-[100%] font-bold"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>

                <p className="text-center text-[16px] leading-[100%] font-medium text-neutral-600">
                    Não tem uma conta ainda?{" "}
                    <Link
                        to="/registro"
                        className="text-[16px] leading-[100%] font-bold text-vari hover:underline"
                    >
                        Cadastre-se
                    </Link>
                </p>
            </form>
        </AuthLayout>
    )
}
