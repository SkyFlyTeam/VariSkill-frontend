import { Lock } from "lucide-react"

import { cn } from "@/lib/utils"

export type LockOverlayProps = {
    /** Rótulo acessível do estado bloqueado. */
    label?: string
    iconClassName?: string
    className?: string
}

/** Camada cinza com cadeado sobre itens/conquistas ainda não desbloqueados. */
export function LockOverlay({
    label = "Bloqueado",
    iconClassName,
    className,
}: LockOverlayProps) {
    return (
        <span
            role="img"
            aria-label={label}
            className={cn(
                "absolute inset-0 z-10 grid place-items-center bg-slate-700/55",
                className,
            )}
        >
            <Lock
                aria-hidden="true"
                className={cn("size-9 stroke-[1.75] text-white", iconClassName)}
            />
        </span>
    )
}
