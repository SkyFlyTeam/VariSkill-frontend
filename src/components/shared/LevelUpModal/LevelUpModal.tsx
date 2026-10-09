import { useRef } from "react"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import celebrationVari from "@/assets/vari/celebrationVari.svg"
import { Button } from "@/components/ui/button"
import { DialogOverlay, DialogPortal } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface LevelUpModalProps {
    /** Controla se o modal está aberto (`level_up === true` no retorno da submissão). */
    open: boolean
    /** Nível alcançado (`novo_nivel` da API). */
    level: number
    /** Nível antes da submissão (`nivel_anterior` da API). Omitido = sem indicador "Nível X → Nível Y". */
    previousLevel?: number
    /** Chamado ao clicar em "Continuar Aprendendo" ou pressionar Esc. */
    onClose: () => void
}

const CONFETTI_SHAPES = ["h-3.5 w-2", "size-2.5 rounded-full", "h-1.5 w-3.5"]
const CONFETTI_COLORS = [
    "bg-vari",
    "bg-main-blue",
    "bg-amber-400",
    "bg-main-blue-dark",
]

/** Posição, atraso, velocidade e formato de cada confete; determinísticos para a animação não mudar a cada render. */
const CONFETTI = Array.from({ length: 24 }, (_, index) => ({
    left: `${3 + index * 4}%`,
    delay: `${((index * 7) % 12) * 0.12}s`,
    duration: `${2.2 + ((index * 5) % 6) * 0.15}s`,
    className: cn(
        CONFETTI_SHAPES[index % CONFETTI_SHAPES.length],
        CONFETTI_COLORS[(index * 3) % CONFETTI_COLORS.length],
    ),
}))

export function LevelUpModal({
    open,
    level,
    previousLevel,
    onClose,
}: LevelUpModalProps) {
    const actionButtonRef = useRef<HTMLButtonElement>(null)

    return (
        <DialogPrimitive.Root
            open={open}
            /** Clique fora é ignorado: só o botão de ação ou Esc encerram o modal. */
            disablePointerDismissal
            onOpenChange={(nextOpen) => {
                if (!nextOpen) onClose()
            }}
        >
            <DialogPortal>
                <DialogOverlay className="bg-[rgba(30,41,57,0.6)]" />

                <DialogPrimitive.Popup
                    data-slot="level-up-modal"
                    initialFocus={() => {
                        actionButtonRef.current?.focus({ preventScroll: true })
                        return false
                    }}
                    className={cn(
                        "fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-175 -translate-x-1/2 -translate-y-1/2 max-h-[calc(100dvh-2rem)] flex-col gap-7 overflow-hidden rounded-2xl bg-white p-6 text-black shadow-lg outline-none sm:gap-9 sm:rounded-[15px] sm:px-10 sm:pt-10 sm:pb-9",
                        "duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
                    )}
                >
                    <div
                        aria-hidden="true"
                        data-testid="level-up-confetti"
                        className="pointer-events-none absolute inset-0"
                    >
                        {CONFETTI.map((piece) => (
                            <span
                                key={piece.left}
                                className={cn(
                                    "absolute top-0 animate-confetti-fall",
                                    piece.className,
                                )}
                                style={{
                                    left: piece.left,
                                    animationDelay: piece.delay,
                                    animationDuration: piece.duration,
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left">
                        <div className="relative shrink-0">
                            <img
                                src={celebrationVari}
                                alt="Vari comemorando o novo nível"
                                className="h-24 w-auto sm:h-32"
                            />

                            <div
                                aria-hidden="true"
                                className="absolute -right-3 -bottom-1 flex size-12 animate-level-pop flex-col items-center justify-center rounded-full border-3 border-main-blue bg-main-blue-dark text-white sm:size-14"
                            >
                                <span className="text-[7px] font-bold tracking-widest sm:text-[8px]">
                                    NÍVEL
                                </span>
                                <span className="text-lg leading-none font-extrabold sm:text-xl">
                                    {level}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-3 sm:items-start sm:gap-3.5">
                            <DialogPrimitive.Title className="text-lg font-bold sm:text-xl">
                                Parabéns! Você alcançou o Nível {level}!
                            </DialogPrimitive.Title>

                            <DialogPrimitive.Description className="text-xs font-medium sm:text-sm">
                                Você está mandando muito bem! Continue
                                praticando para desbloquear novos desafios na
                                sua trilha.
                            </DialogPrimitive.Description>

                            {previousLevel !== undefined &&
                                previousLevel < level && (
                                    <p className="flex items-center gap-2.5 text-xs font-semibold">
                                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">
                                            Nível {previousLevel}
                                        </span>
                                        <span
                                            aria-hidden="true"
                                            className="text-gray-600"
                                        >
                                            →
                                        </span>
                                        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-main-blue-dark">
                                            Nível {level}
                                        </span>
                                    </p>
                                )}
                        </div>
                    </div>

                    <div className="relative flex justify-center">
                        <Button
                            ref={actionButtonRef}
                            variant="vari"
                            className="h-auto rounded-[10px] px-9 py-3.5 text-xs font-bold"
                            onClick={onClose}
                        >
                            Continuar Aprendendo
                        </Button>
                    </div>
                </DialogPrimitive.Popup>
            </DialogPortal>
        </DialogPrimitive.Root>
    )
}
