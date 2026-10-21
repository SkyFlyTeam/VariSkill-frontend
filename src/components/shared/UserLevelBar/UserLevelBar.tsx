import { Trophy } from "lucide-react"

import { ProgressBar } from "@/components/shared/ProgressBar/ProgressBar"
import { useAuth } from "@/contexts/authContext"
import { cn } from "@/lib/utils"

type UserLevelBarProps = {
    className?: string
    compact?: boolean
    tone?: "light" | "dark"
}

const numberFormat = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
})

export function UserLevelBar({
    className,
    compact = false,
    tone = "light",
}: UserLevelBarProps) {
    const { user } = useAuth()

    if (!user) return null

    const progresso = user.progresso_nivel
    const nivel = progresso?.nivel ?? user.nivel ?? 1
    const xpAtual = progresso?.xp_atual ?? user.xp_total ?? 0
    const xpProximo = progresso?.xp_proximo_nivel ?? xpAtual
    const xpRestante =
        progresso?.xp_restante ?? Math.max(0, xpProximo - xpAtual)
    const progressoPct = progresso?.progresso_pct ?? 0
    const textoRestante = xpRestante === 1 ? "Falta" : "Faltam"
    const isDark = tone === "dark"

    return (
        <section
            aria-label={`Progresso do nível ${nivel}`}
            className={cn(
                "w-full rounded-2xl border",
                compact ? "p-3" : "p-4",
                isDark
                    ? "border-white/10 bg-[#12325d] text-white"
                    : "border-slate-200 bg-white text-slate-900 shadow-[0_3px_8px_rgba(15,23,42,0.08)]",
                className,
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
                        isDark
                            ? "bg-main-blue text-[#06244b]"
                            : "bg-[#e6f6fc] text-[#0b5c7a]",
                    )}
                >
                    <Trophy aria-hidden="true" className="size-3.5" />
                    Nível {nivel}
                </span>
            </div>

            <ProgressBar
                value={progressoPct}
                aria-label={`Progresso para o nível ${nivel + 1}`}
                className={cn(
                    "mt-3",
                    compact ? "h-1.5 sm:h-1.5" : "h-2.5 sm:h-3",
                    isDark && "bg-white/20",
                )}
            />

            <p
                className={cn(
                    "mt-2 text-[10px] leading-snug sm:text-[11px]",
                    isDark ? "text-slate-200" : "text-slate-600",
                )}
            >
                {numberFormat.format(xpAtual)} /{" "}
                {numberFormat.format(xpProximo)} XP ({textoRestante}{" "}
                {numberFormat.format(xpRestante)} XP para o Nível {nivel + 1})
            </p>
        </section>
    )
}
