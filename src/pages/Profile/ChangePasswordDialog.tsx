import { type FormEvent, useState } from "react"

import { Dialog } from "@base-ui/react/dialog"

import { useToast } from "@/components/shared/toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/authContext"
import { userService } from "@/services/userService"

type ChangePasswordDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({
    open,
    onOpenChange,
}: ChangePasswordDialogProps) {
    const toast = useToast()
    const { clearSession } = useAuth()
    const [senhaAtual, setSenhaAtual] = useState("")
    const [novaSenha, setNovaSenha] = useState("")
    const [confirmacao, setConfirmacao] = useState("")
    const [saving, setSaving] = useState(false)

    function handleOpenChange(next: boolean) {
        if (!next) {
            setSenhaAtual("")
            setNovaSenha("")
            setConfirmacao("")
        }
        onOpenChange(next)
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()

        if (novaSenha.length < 8) {
            toast.error("A nova senha deve ter no mínimo 8 caracteres.")
            return
        }

        if (novaSenha !== confirmacao) {
            toast.error("A confirmação não confere com a nova senha.")
            return
        }

        setSaving(true)
        try {
            await userService.changePassword({ senhaAtual, novaSenha })
            toast.success("Senha alterada. Entre novamente com a nova senha.")
            handleOpenChange(false)
            clearSession()
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Não foi possível alterar a senha.",
            )
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
                <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
                    <Dialog.Title className="text-lg font-bold">
                        Alterar senha
                    </Dialog.Title>
                    <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                        Informe sua senha atual para definir uma nova.
                    </Dialog.Description>

                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                        <div className="space-y-1.5">
                            <label
                                htmlFor="senhaAtual"
                                className="text-xs font-bold"
                            >
                                Senha atual
                            </label>
                            <Input
                                id="senhaAtual"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={senhaAtual}
                                onChange={(e) => setSenhaAtual(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label
                                htmlFor="novaSenha"
                                className="text-xs font-bold"
                            >
                                Nova senha
                            </label>
                            <Input
                                id="novaSenha"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={novaSenha}
                                onChange={(e) => setNovaSenha(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label
                                htmlFor="confirmacao"
                                className="text-xs font-bold"
                            >
                                Confirmar nova senha
                            </label>
                            <Input
                                id="confirmacao"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={confirmacao}
                                onChange={(e) => setConfirmacao(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="bg-brand-red text-white hover:bg-brand-red/90"
                            >
                                {saving ? "Alterando..." : "Alterar senha"}
                            </Button>
                        </div>
                    </form>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
