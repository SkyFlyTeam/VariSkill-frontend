import { Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

const VARIANT_STYLES = {
    // Sobre cards brancos.
    light: "bg-violet-100 text-violet-800",
    // Sobre fundos coloridos (cabeçalho da trilha, chips do chat).
    inverse: "bg-white/20 text-white",
} as const

export type AiGeneratedBadgeProps = {
    variant?: keyof typeof VARIANT_STYLES
    // Mostra só "IA", para espaços estreitos como os chips do chat.
    compact?: boolean
    className?: string
}

// Identifica trilhas criadas pelo Coach com IA generativa (transparência do uso de IA).
export function AiGeneratedBadge({ variant = "light", compact = false, className }: AiGeneratedBadgeProps) {
    return (
        <span
            title="Trilha criada pelo Coach com IA generativa"
            className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                VARIANT_STYLES[variant],
                className,
            )}
        >
            <Sparkles aria-hidden="true" className="size-3" />
            {compact ? (
                <>
                    <span aria-hidden="true">IA</span>
                    <span className="sr-only">Gerada por IA</span>
                </>
            ) : (
                "Gerada por IA"
            )}
        </span>
    )
}
