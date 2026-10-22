import {
    type FormEvent,
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from "react"

import { Camera, ChevronDown, Lock, Pencil, User } from "lucide-react"

import { useToast } from "@/components/shared/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/authContext"
import { ChangePasswordDialog } from "@/pages/Profile/ChangePasswordDialog"
import { useProfilePhoto } from "@/pages/Profile/useProfilePhoto"
import {
    type Interesse,
    type UserProfile,
    userService,
} from "@/services/userService"

const fieldClass =
    "h-11 rounded-xl border-slate-200 bg-slate-50 px-4 pr-10 text-sm shadow-none"

type FieldProps = {
    id: string
    label: string
    children: ReactNode
}

function Field({ id, label, children }: FieldProps) {
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="text-xs font-bold">
                {label}
            </label>
            <div className="relative">{children}</div>
        </div>
    )
}

function sanitizeIdade(value: string): string | null {
    const digits = value.replace(/\D/g, "").slice(0, 3)

    if (digits !== "" && Number(digits) > 120) return null

    return digits
}

function normalizarIdadeInicial(value: number | null): string {
    if (value === null || value < 10 || value > 120) return ""

    return String(value)
}

export function ProfilePage() {
    const toast = useToast()
    const { user, updateUser } = useAuth()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [nome, setNome] = useState("")
    const [apelido, setApelido] = useState("")
    const [sexo, setSexo] = useState<"" | "M" | "F">("")
    const [idade, setIdade] = useState("")
    const [interesses, setInteresses] = useState<Interesse[]>([])
    const [interessesSelecionados, setInteressesSelecionados] = useState<
        string[]
    >([])
    const [saving, setSaving] = useState(false)
    const [passwordOpen, setPasswordOpen] = useState(false)
    const nomeRef = useRef<HTMLInputElement>(null)
    const apelidoRef = useRef<HTMLInputElement>(null)
    const photoInputRef = useRef<HTMLInputElement>(null)
    const { photo, handleFileChange } = useProfilePhoto({
        onError: toast.error,
        onSuccess: toast.success,
    })

    function openPhotoPicker() {
        photoInputRef.current?.click()
    }

    useEffect(() => {
        if (!user?.id) return
        let active = true
        Promise.all([
            userService.getSession(),
            userService.getInterests().catch(() => []),
        ])
            .then(([data, interessesDisponiveis]) => {
                if (!active) return
                setProfile(data)
                setNome(data.nome)
                setApelido(data.apelido)
                setSexo(data.sexo ?? "")
                setIdade(normalizarIdadeInicial(data.idade))
                setInteresses(interessesDisponiveis)
                setInteressesSelecionados(
                    data.interesses.map((interesse) => interesse.id),
                )
            })
            .catch((error) => {
                if (!active) return
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível carregar o perfil.",
                )
            })
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => {
            active = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id])

    const changed =
        profile !== null &&
        (nome.trim() !== profile.nome ||
            apelido.trim() !== profile.apelido ||
            sexo !== (profile.sexo ?? "") ||
            idade !== (profile.idade?.toString() ?? "") ||
            [...interessesSelecionados].sort().join(",") !==
                profile.interesses
                    .map((interesse) => interesse.id)
                    .sort()
                    .join(","))

    function toggleInteresse(interesseId: string) {
        setInteressesSelecionados((current) =>
            current.includes(interesseId)
                ? current.filter((id) => id !== interesseId)
                : [...current, interesseId],
        )
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()
        if (!profile) return

        if (!nome.trim() || !apelido.trim()) {
            toast.error("Nome e apelido não podem ficar vazios.")
            return
        }

        const idadeNumero = idade.trim() === "" ? null : Number(idade)
        if (
            idadeNumero !== null &&
            (!Number.isInteger(idadeNumero) ||
                idadeNumero < 10 ||
                idadeNumero > 120)
        ) {
            toast.error("A idade deve estar entre 10 e 120 anos.")
            return
        }

        setSaving(true)
        try {
            const updated = await userService.updateProfile({
                nome: nome.trim(),
                apelido: apelido.trim(),
                sexo: sexo || null,
                idade: idadeNumero,
                interesses_ids: interessesSelecionados,
            })
            setProfile(updated)
            if (user) {
                updateUser({ ...user, ...updated })
            }
            setNome(updated.nome)
            setApelido(updated.apelido)
            setSexo(updated.sexo ?? "")
            setIdade(normalizarIdadeInicial(updated.idade))
            setInteressesSelecionados(
                updated.interesses.map((interesse) => interesse.id),
            )
            toast.success("Perfil atualizado com sucesso!")
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Não foi possível atualizar o perfil.",
            )
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-page">
                <p className="text-muted-foreground">Carregando perfil...</p>
            </main>
        )
    }

    if (!profile) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-page">
                <p className="text-muted-foreground">
                    Não foi possível carregar seus dados.
                </p>
            </main>
        )
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-page p-4 sm:p-8">
            <form
                noValidate
                onSubmit={handleSubmit}
                className="w-full max-w-4xl rounded-3xl bg-white px-6 py-10 sm:px-20"
            >
                <div className="flex flex-col items-center">
                    <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    <div className="relative">
                        <div className="flex size-40 items-center justify-center overflow-hidden rounded-full bg-brand-blue text-slate-200">
                            {photo ? (
                                <img
                                    src={photo}
                                    alt="Foto de perfil"
                                    className="size-full object-cover"
                                />
                            ) : (
                                <User className="size-24" strokeWidth={1.5} />
                            )}
                        </div>
                        <button
                            type="button"
                            aria-label="Editar foto"
                            onClick={openPhotoPicker}
                            className="absolute right-1 bottom-2 flex size-8 items-center justify-center rounded-full bg-brand-navy text-white"
                        >
                            <Camera className="size-4" />
                        </button>
                    </div>

                    <h1 className="mt-6 text-base font-bold">{profile.nome}</h1>
                    <button
                        type="button"
                        onClick={openPhotoPicker}
                        className="text-xs font-bold text-brand-blue hover:underline"
                    >
                        Editar foto
                    </button>
                </div>

                <section className="mt-10">
                    <h2 className="text-base font-bold">Informações</h2>

                    <div className="mt-6 grid gap-x-16 gap-y-8 sm:grid-cols-2">
                        <Field id="nome" label="Nome">
                            <Input
                                id="nome"
                                ref={nomeRef}
                                className={fieldClass}
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                            />
                            <button
                                type="button"
                                aria-label="Editar nome"
                                onClick={() => nomeRef.current?.focus()}
                                className="absolute top-1/2 right-4 -translate-y-1/2"
                            >
                                <Pencil className="size-4" />
                            </button>
                        </Field>

                        <Field id="email" label="Email">
                            <Input
                                id="email"
                                type="email"
                                className={fieldClass}
                                value={profile.email}
                                readOnly
                                disabled
                            />
                            <Lock className="absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground" />
                        </Field>

                        <Field id="apelido" label="Apelido">
                            <Input
                                id="apelido"
                                ref={apelidoRef}
                                className={fieldClass}
                                value={apelido}
                                onChange={(e) => setApelido(e.target.value)}
                            />
                            <button
                                type="button"
                                aria-label="Editar apelido"
                                onClick={() => apelidoRef.current?.focus()}
                                className="absolute top-1/2 right-4 -translate-y-1/2"
                            >
                                <Pencil className="size-4" />
                            </button>
                        </Field>

                        <Field id="sexo" label="Sexo">
                            <select
                                id="sexo"
                                value={sexo}
                                onChange={(event) =>
                                    setSexo(
                                        event.target.value as "" | "M" | "F",
                                    )
                                }
                                className={`${fieldClass} w-full appearance-none`}
                            >
                                <option value="">Prefiro não informar</option>
                                <option value="M">Masculino</option>
                                <option value="F">Feminino</option>
                            </select>
                            <ChevronDown
                                aria-hidden="true"
                                className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-slate-500"
                            />
                        </Field>

                        <Field id="idade" label="Idade">
                            <Input
                                id="idade"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={3}
                                className={fieldClass}
                                value={idade}
                                onChange={(event) => {
                                    const valor = sanitizeIdade(
                                        event.target.value,
                                    )
                                    setIdade(valor ?? "")
                                }}
                            />
                        </Field>

                        <Field id="senha" label="Senha">
                            <Input
                                id="senha"
                                type="password"
                                className={fieldClass}
                                value="********"
                                readOnly
                                tabIndex={-1}
                            />
                            <button
                                type="button"
                                aria-label="Alterar senha"
                                onClick={() => setPasswordOpen(true)}
                                className="absolute top-1/2 right-4 -translate-y-1/2"
                            >
                                <Pencil className="size-4" />
                            </button>
                        </Field>
                    </div>
                </section>

                <section className="mt-10">
                    <h2 className="text-base font-bold">Interesses</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Selecione os temas que você quer estudar.
                    </p>

                    {interesses.length === 0 ? (
                        <p className="mt-4 text-xs text-muted-foreground">
                            Nenhum interesse disponível no momento.
                        </p>
                    ) : (
                        <div
                            role="group"
                            aria-label="Interesses"
                            className="mt-4 flex flex-wrap gap-2"
                        >
                            {interesses.map((interesse) => {
                                const selecionado =
                                    interessesSelecionados.includes(
                                        interesse.id,
                                    )

                                return (
                                    <button
                                        key={interesse.id}
                                        type="button"
                                        aria-pressed={selecionado}
                                        onClick={() =>
                                            toggleInteresse(interesse.id)
                                        }
                                        className={
                                            selecionado
                                                ? "rounded-full border border-brand-blue bg-brand-blue px-4 py-2 text-xs font-semibold text-white transition-colors"
                                                : "rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-blue"
                                        }
                                    >
                                        {interesse.nome}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </section>

                <div className="mt-12 flex justify-center">
                    <Button
                        type="submit"
                        disabled={!changed || saving}
                        className="h-11 w-full max-w-64 rounded-xl bg-brand-red text-xs font-bold text-white hover:bg-brand-red/90"
                    >
                        {saving ? "Salvando..." : "Salvar"}
                    </Button>
                </div>
            </form>

            <ChangePasswordDialog
                open={passwordOpen}
                onOpenChange={setPasswordOpen}
            />
        </main>
    )
}
