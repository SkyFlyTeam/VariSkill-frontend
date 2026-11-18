import { Trophy } from "lucide-react"

import neutralVari from "@/assets/vari/neutralVari.svg"
import { FireStreak } from "@/components/shared/FireStreak/FireStreak"
import { ProgressBar } from "@/components/shared/ProgressBar/ProgressBar"
import { cn } from "@/lib/utils"
import type { Streak } from "@/services/authService"

export type UserStatisticsProps = {
    name: string
    level: number
    /** XP acumulado dentro da faixa do nível atual. */
    xpCurrent: number
    /** XP necessário para concluir a faixa do nível atual. */
    xpTarget: number
    /** 0–100 */
    progressPct: number
    streak: Pick<Streak, "atual" | "recorde" | "concluiu_hoje">
    /** Contador do troféu (ex.: trilhas concluídas). Oculto quando omitido. */
    trophies?: number
    trophiesLabel?: string
    avatarUrl?: string
    compact?: boolean
    className?: string
}

const numberFormat = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
})

const HEXAGON = "polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0% 50%)"

function LevelBadge({ level, compact }: { level: number; compact: boolean }) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "absolute -bottom-1 -right-3 grid place-items-center bg-white",
                compact ? "size-7" : "size-11",
            )}
            style={{ clipPath: HEXAGON }}
        >
            <span
                className={cn(
                    "grid size-[86%] place-items-center bg-[#7a1010] font-bold text-white",
                    compact ? "text-[11px]" : "text-lg",
                )}
                style={{ clipPath: HEXAGON }}
            >
                {level}
            </span>
        </span>
    )
}

export function UserStatistics({
    name,
    level,
    xpCurrent,
    xpTarget,
    progressPct,
    streak,
    trophies,
    trophiesLabel = "trilhas concluídas",
    avatarUrl = neutralVari,
    compact = false,
    className,
}: UserStatisticsProps) {
    return (
        <section
            aria-label={`Estatísticas de ${name}`}
            className={cn(
                "w-full rounded-3xl border border-white/25 bg-[#0f3a66] text-white shadow-[inset_0_0_24px_rgba(255,255,255,0.06),0_6px_16px_rgba(0,27,65,0.25)]",
                compact ? "p-3" : "p-4 sm:p-5",
                className,
            )}
        >
            <div className={cn("flex items-center", compact ? "gap-4" : "gap-6")}>
                <div className="relative shrink-0">
                    <div
                        className={cn(
                            "grid place-items-center overflow-hidden rounded-full bg-[#e9c8f7]",
                            compact ? "size-12" : "size-20 sm:size-24",
                        )}
                    >
                        <img
                            src={avatarUrl}
                            alt=""
                            className="size-[80%] object-contain"
                        />
                    </div>
                    <LevelBadge level={level} compact={compact} />
                </div>

                <div className="min-w-0 flex-1">
                    <p
                        className={cn(
                            "truncate font-semibold",
                            compact ? "text-sm" : "text-xl sm:text-2xl",
                        )}
                    >
                        {name}
                    </p>
                    <span className="sr-only">Nível {level}</span>
                    <ProgressBar
                        value={progressPct}
                        aria-label={`Progresso para o nível ${level + 1}`}
                        className={cn(
                            "bg-[#d9d9d9]",
                            compact ? "mt-1.5 h-1.5 sm:h-1.5" : "mt-2 h-2.5 sm:h-3",
                        )}
                    />
                    <p
                        className={cn(
                            "mt-1 text-slate-300",
                            compact ? "text-[10px]" : "text-sm",
                        )}
                    >
                        {numberFormat.format(xpCurrent)} /{" "}
                        {numberFormat.format(xpTarget)} XP
                    </p>
                </div>
            </div>

            <div
                className={cn(
                    "flex flex-wrap items-center justify-end",
                    compact ? "mt-3 gap-2" : "mt-4 gap-3",
                )}
            >
                <FireStreak
                    variant="badge"
                    count={streak.atual}
                    record={streak.recorde}
                    active={streak.concluiu_hoje}
                    className={cn(compact && "px-3 py-1 text-sm")}
                />
                {trophies !== undefined && (
                    <span
                        aria-label={`${trophies} ${trophiesLabel}`}
                        className={cn(
                            "inline-flex items-center gap-2 rounded-full bg-[#7a1010] font-bold",
                            compact ? "px-3 py-1 text-sm" : "px-4 py-1.5 text-base",
                        )}
                    >
                        <Trophy
                            aria-hidden="true"
                            className={cn(
                                "stroke-[2.25] text-amber-400",
                                compact ? "size-4" : "size-6",
                            )}
                        />
                        {trophies}
                    </span>
                )}
            </div>
        </section>
    )
}
