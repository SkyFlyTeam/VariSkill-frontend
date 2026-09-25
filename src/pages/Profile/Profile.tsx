import {
    type FormEvent,
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from "react"

import { Camera, Lock, Pencil, User } from "lucide-react"

import { useToast } from "@/components/shared/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/authContext"
import { ChangePasswordDialog } from "@/pages/Profile/ChangePasswordDialog"
import { useProfilePhoto } from "@/pages/Profile/useProfilePhoto"
import { type UserProfile, userService } from "@/services/userService"

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

export function ProfilePage() {
    const toast = useToast()
    const { user, updateUser } = useAuth()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [nome, setNome] = useState("")
    const [apelido, setApelido] = useState("")
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
        userService
            .getProfile(user.id)
            .then((data) => {
                if (!active) return
                setProfile(data)
                setNome(data.nome)
                setApelido(data.apelido)
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
        (nome.trim() !== profile.nome || apelido.trim() !== profile.apelido)

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()
        if (!profile) return

        if (!nome.trim() || !apelido.trim()) {
            toast.error("Nome e apelido não podem ficar vazios.")
            return
        }

        setSaving(true)
        try {
            const updated = await userService.updateProfile(profile.id, {
                nome: nome.trim(),
                apelido: apelido.trim(),
            })
            setProfile(updated)
            updateUser(updated)
            setNome(updated.nome)
            setApelido(updated.apelido)
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
