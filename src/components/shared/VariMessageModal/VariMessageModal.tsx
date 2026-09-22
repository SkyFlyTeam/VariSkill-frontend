import type { ReactNode } from "react"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import variMascot from "@/assets/vari-mascot.svg"
import { Button } from "@/components/ui/button"
import { DialogOverlay, DialogPortal } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface VariMessageModalProps {
    /** Controla se o modal está aberto. */
    open: boolean
    /** Chamado quando o modal deve abrir/fechar (clique no overlay, Esc, botão de ação). */
    onOpenChange: (open: boolean) => void
    /** Mensagem do Vari. Aceita `\n` para quebras de parágrafo. */
    message: ReactNode
    /** Nome exibido acima da mensagem. */
    title?: string
    /** Texto do botão de ação, que fecha o modal. */
    actionLabel?: string
    /** Chamado ao clicar no botão de ação, antes de fechar o modal. */
    onAction?: () => void
    className?: string
}

export function VariMessageModal({
    open,
    onOpenChange,
    message,
    title = "Vari",
    actionLabel = "Entendi!",
    onAction,
    className,
}: VariMessageModalProps) {
    function handleAction() {
        onAction?.()
        onOpenChange(false)
    }

    return (
        <DialogPrimitive.Root
            open={open}
            onOpenChange={(nextOpen) => onOpenChange(nextOpen)}
        >
            <DialogPortal>
                <DialogOverlay />

                <DialogPrimitive.Popup
                    data-slot="vari-message-modal"
                    className={cn(
                        "fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-162.5 -translate-x-1/2 -translate-y-1/2 flex-col gap-7 rounded-2xl bg-white p-6 text-black shadow-lg outline-none sm:gap-9 sm:rounded-[15px] sm:p-6.25",
                        "duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
                        className,
                    )}
                >
                    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left">
                        <img
                            src={variMascot}
                            alt="Vari, o mascote polvo do VariSkill"
                            className="h-24 w-auto shrink-0 sm:h-32"
                        />

                        <div className="flex flex-col gap-3 sm:gap-4">
                            <DialogPrimitive.Title className="text-lg font-bold sm:text-xl">
                                {title}
                            </DialogPrimitive.Title>

                            <DialogPrimitive.Description className="text-xs font-medium whitespace-pre-line sm:text-sm">
                                {message}
                            </DialogPrimitive.Description>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Button
                            variant="vari"
                            className="h-auto rounded-[10px] px-9 py-3.5 text-xs font-bold"
                            onClick={handleAction}
                        >
                            {actionLabel}
                        </Button>
                    </div>
                </DialogPrimitive.Popup>
            </DialogPortal>
        </DialogPrimitive.Root>
    )
}
