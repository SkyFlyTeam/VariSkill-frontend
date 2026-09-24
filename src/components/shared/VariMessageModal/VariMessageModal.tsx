import { type ReactNode, useRef } from "react"

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
    /** Dots de progresso (ex.: sequências de onboarding). Omitido = sem indicador. */
    stepIndicator?: { current: number; total: number }
    /** Ação secundária opcional, exibida ao lado do botão principal (ex.: "Pular tour"). */
    secondaryAction?: { label: string; onClick: () => void }
    /** Arte do mascote. Omitido = Vari padrão. */
    illustration?: { src: string; alt: string }
    /** Conteúdo extra exibido entre o texto e o botão de ação (ex.: resultados, listas). */
    children?: ReactNode
    className?: string
}

export function VariMessageModal({
    open,
    onOpenChange,
    message,
    title = "Vari",
    actionLabel = "Entendi!",
    onAction,
    stepIndicator,
    secondaryAction,
    illustration = {
        src: variMascot,
        alt: "Vari, o mascote polvo do VariSkill",
    },
    children,
    className,
}: VariMessageModalProps) {
    const actionButtonRef = useRef<HTMLButtonElement>(null)

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
                <DialogOverlay className="bg-[rgba(30,41,57,0.6)]" />

                <DialogPrimitive.Popup
                    data-slot="vari-message-modal"
                    // Foca o botão de ação sem rolar até ele: em conteúdo alto (mobile) o modal abriria já rolado.
                    initialFocus={() => {
                        actionButtonRef.current?.focus({ preventScroll: true })
                        return false
                    }}
                    className={cn(
                        "fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-162.5 -translate-x-1/2 -translate-y-1/2 max-h-[calc(100dvh-2rem)] flex-col gap-7 overflow-y-auto rounded-2xl bg-white p-6 text-black shadow-lg outline-none sm:gap-9 sm:rounded-[15px] sm:p-6.25",
                        "duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
                        className,
                    )}
                >
                    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left">
                        <img
                            src={illustration.src}
                            alt={illustration.alt}
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

                    {children}

                    {stepIndicator && (
                        <div
                            className="flex justify-center gap-2"
                            role="tablist"
                            aria-label="Progresso"
                        >
                            {Array.from(
                                { length: stepIndicator.total },
                                (_, index) => (
                                    <span
                                        key={index}
                                        role="tab"
                                        aria-selected={
                                            index === stepIndicator.current - 1
                                        }
                                        aria-label={`Etapa ${index + 1} de ${stepIndicator.total}`}
                                        className={cn(
                                            "h-2 w-2 rounded-full transition-colors",
                                            index === stepIndicator.current - 1
                                                ? "bg-vari"
                                                : "bg-gray-200",
                                        )}
                                    />
                                ),
                            )}
                        </div>
                    )}

                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                        <Button
                            ref={actionButtonRef}
                            variant="vari"
                            className="h-auto rounded-[10px] px-9 py-3.5 text-xs font-bold"
                            onClick={handleAction}
                        >
                            {actionLabel}
                        </Button>

                        {secondaryAction && (
                            <button
                                type="button"
                                className="text-xs font-bold text-muted-foreground underline-offset-2 hover:underline"
                                onClick={secondaryAction.onClick}
                            >
                                {secondaryAction.label}
                            </button>
                        )}
                    </div>
                </DialogPrimitive.Popup>
            </DialogPortal>
        </DialogPrimitive.Root>
    )
}
