import { type FormEvent, useState } from "react"

import { Link } from "react-router-dom"

import { Eye, EyeOff } from "lucide-react"

import { AuthLayout } from "@/components/shared/AuthLayout/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/authContext"
import { getFieldErrors } from "@/services/api"
import { formatCpf, onlyDigits, validateRegister } from "@/utils/validation"

const inputClassName =
    "h-10 rounded-[10px] border border-[#cad5e2] bg-white px-3 text-sm shadow-none placeholder:text-neutral-400 focus-visible:ring-1"

const labelClassName = "text-[14px] leading-[20px] font-medium text-[#101828]"

export function RegistroPage() {
    const { register } = useAuth()
    const [nome, setNome] = useState("")
    const [apelido, setApelido] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [sexo, setSexo] = useState<"" | "M" | "F">("")
    const [idade, setIdade] = useState("")
    const [responsavelNome, setResponsavelNome] = useState("")
    const [responsavelCpf, setResponsavelCpf] = useState("")
    const [responsavelEmail, setResponsavelEmail] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [aceiteTermos, setAceiteTermos] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const menorDeIdade = Number(idade) > 0 && Number(idade) < 18

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)

        const validationErrors = validateRegister({
            nome,
            apelido,
            email,
            password,
            sexo,
            idade,
            responsavel: {
                nome: responsavelNome,
                cpf: responsavelCpf,
                email: responsavelEmail,
            },
        })

        if (!aceiteTermos) {
            validationErrors.aceite_termos =
                "Para se cadastrar, aceite os termos de uso."
        }

        setFieldErrors(validationErrors)

        if (Object.keys(validationErrors).length > 0) {
            return
        }

        setIsSubmitting(true)

        try {
            await register({
                nome,
                apelido,
                email,
                password,
                sexo: sexo as "M" | "F",
                idade: Number(idade),
                aceite_termos: aceiteTermos,
                ...(menorDeIdade
                    ? {
                          responsavel: {
                              nome: responsavelNome,
                              cpf: onlyDigits(responsavelCpf),
                              email: responsavelEmail,
                          },
                      }
                    : {}),
            })
        } catch (requestError) {
            const apiFieldErrors = getFieldErrors(requestError)

            if (Object.keys(apiFieldErrors).length > 0) {
                setFieldErrors(apiFieldErrors)
            } else {
                setError("Não foi possível criar a conta. Tente novamente.")
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AuthLayout>
            <form
                noValidate
                onSubmit={handleSubmit}
                className="flex flex-col gap-[25px]"
            >
                <h1 className="font-poppins text-[24px] leading-[100%] font-bold tracking-normal text-[#101828]">
                    Cadastrar
                </h1>
                <div className="space-y-1.5">
                    <label htmlFor="nome" className={labelClassName}>
                        Nome Completo
                    </label>

                    <Input
                        id="nome"
                        value={nome}
                        onChange={(event) => setNome(event.target.value)}
                        placeholder="Joe Doe"
                        autoComplete="name"
                        required
                        aria-invalid={Boolean(fieldErrors.nome)}
                        className={inputClassName}
                    />

                    {fieldErrors.nome && (
                        <p role="alert" className="text-xs text-destructive">
                            {fieldErrors.nome}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="apelido" className={labelClassName}>
                        Apelido
                    </label>

                    <Input
                        id="apelido"
                        value={apelido}
                        onChange={(event) => setApelido(event.target.value)}
                        placeholder="joe.doe"
                        autoComplete="username"
                        required
                        aria-invalid={Boolean(fieldErrors.apelido)}
                        className={inputClassName}
                    />

                    {fieldErrors.apelido && (
                        <p role="alert" className="text-xs text-destructive">
                            {fieldErrors.apelido}
                        </p>
                    )}
                </div>

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

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label htmlFor="idade" className={labelClassName}>
                            Idade
                        </label>

                        <Input
                            id="idade"
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={120}
                            value={idade}
                            onChange={(event) => setIdade(event.target.value)}
                            placeholder="18"
                            required
                            aria-invalid={Boolean(fieldErrors.idade)}
                            className={inputClassName}
                        />

                        {fieldErrors.idade && (
                            <p
                                role="alert"
                                className="text-xs text-destructive"
                            >
                                {fieldErrors.idade}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="sexo" className={labelClassName}>
                            Sexo
                        </label>

                        <select
                            id="sexo"
                            value={sexo}
                            onChange={(event) =>
                                setSexo(event.target.value as "" | "M" | "F")
                            }
                            required
                            aria-invalid={Boolean(fieldErrors.sexo)}
                            className={`${inputClassName} w-full outline-none ${sexo ? "" : "text-neutral-400"}`}
                        >
                            <option value="" disabled>
                                Selecione
                            </option>
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                        </select>

                        {fieldErrors.sexo && (
                            <p
                                role="alert"
                                className="text-xs text-destructive"
                            >
                                {fieldErrors.sexo}
                            </p>
                        )}
                    </div>
                </div>

                {menorDeIdade && (
                    <section
                        aria-labelledby="responsavel-title"
                        className="space-y-4 rounded-xl border border-[#cad5e2] p-4"
                    >
                        <div>
                            <h2
                                id="responsavel-title"
                                className="text-[14px] leading-[20px] font-bold text-[#101828]"
                            >
                                Dados do Responsável
                            </h2>
                            <p className="mt-1 text-xs text-neutral-600">
                                Menores de 18 anos precisam da permissão do
                                responsável legal para utilizar o VariSkill.
                            </p>
                        </div>

                        {fieldErrors.responsavel && (
                            <p
                                role="alert"
                                className="text-xs text-destructive"
                            >
                                {fieldErrors.responsavel}
                            </p>
                        )}

                        <div className="space-y-1.5">
                            <label
                                htmlFor="responsavel-nome"
                                className={labelClassName}
                            >
                                Nome do responsável
                            </label>
                            <Input
                                id="responsavel-nome"
                                value={responsavelNome}
                                onChange={(event) =>
                                    setResponsavelNome(event.target.value)
                                }
                                placeholder="Nome completo"
                                autoComplete="name"
                                required
                                aria-invalid={Boolean(
                                    fieldErrors["responsavel.nome"],
                                )}
                                className={inputClassName}
                            />
                            {fieldErrors["responsavel.nome"] && (
                                <p
                                    role="alert"
                                    className="text-xs text-destructive"
                                >
                                    {fieldErrors["responsavel.nome"]}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="responsavel-cpf"
                                className={labelClassName}
                            >
                                CPF do responsável
                            </label>
                            <Input
                                id="responsavel-cpf"
                                inputMode="numeric"
                                value={responsavelCpf}
                                onChange={(event) =>
                                    setResponsavelCpf(
                                        formatCpf(event.target.value),
                                    )
                                }
                                placeholder="000.000.000-00"
                                maxLength={14}
                                required
                                aria-invalid={Boolean(
                                    fieldErrors["responsavel.cpf"],
                                )}
                                className={inputClassName}
                            />
                            {fieldErrors["responsavel.cpf"] && (
                                <p
                                    role="alert"
                                    className="text-xs text-destructive"
                                >
                                    {fieldErrors["responsavel.cpf"]}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="responsavel-email"
                                className={labelClassName}
                            >
                                E-mail do responsável
                            </label>
                            <Input
                                id="responsavel-email"
                                type="email"
                                value={responsavelEmail}
                                onChange={(event) =>
                                    setResponsavelEmail(event.target.value)
                                }
                                placeholder="responsavel@gmail.com"
                                autoComplete="email"
                                required
                                aria-invalid={Boolean(
                                    fieldErrors["responsavel.email"],
                                )}
                                className={inputClassName}
                            />
                            {fieldErrors["responsavel.email"] && (
                                <p
                                    role="alert"
                                    className="text-xs text-destructive"
                                >
                                    {fieldErrors["responsavel.email"]}
                                </p>
                            )}
                        </div>
                    </section>
                )}

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
                            autoComplete="new-password"
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

                <div className="space-y-1.5">
                    <div className="flex items-start gap-2.5">
                        <input
                            id="aceite-termos"
                            type="checkbox"
                            checked={aceiteTermos}
                            onChange={(event) => {
                                setAceiteTermos(event.target.checked)
                                if (event.target.checked) {
                                    setFieldErrors((previous) => {
                                        const next = { ...previous }
                                        delete next.aceite_termos
                                        return next
                                    })
                                }
                            }}
                            aria-invalid={Boolean(fieldErrors.aceite_termos)}
                            aria-label="Para se cadastrar aceite nossos termos de uso"
                            className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-[#cad5e2] accent-vari"
                        />
                        <div className="text-[14px] leading-[20px] text-[#101828]">
                            <label
                                htmlFor="aceite-termos"
                                className="cursor-pointer font-medium"
                            >
                                Para se cadastrar aceite nossos
                            </label>{" "}
                            <Link
                                to="/termos"
                                target="_blank"
                                rel="noreferrer"
                                className="font-bold text-vari hover:underline"
                            >
                                termos de uso
                            </Link>
                        </div>
                    </div>

                    {fieldErrors.aceite_termos && (
                        <p role="alert" className="text-xs text-destructive">
                            {fieldErrors.aceite_termos}
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
                    {isSubmitting ? "Cadastrando..." : "Cadastrar"}
                </Button>

                <p className="text-center text-[16px] leading-[100%] font-medium text-neutral-600">
                    Já tem uma conta?{" "}
                    <Link
                        to="/login"
                        className="text-[16px] leading-[100%] font-bold text-vari hover:underline"
                    >
                        Entrar
                    </Link>
                </p>
            </form>
        </AuthLayout>
    )
}
