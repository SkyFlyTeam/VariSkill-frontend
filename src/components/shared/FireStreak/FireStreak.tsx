import { Flame } from "lucide-react"

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type FireStreakProps = {
    /** Dias consecutivos atuais. */
    count: number
    /** Maior sequência já alcançada — exibida no tooltip. */
    record: number
    /** `true` quando o usuário já praticou hoje (streak.concluiu_hoje). */
    active: boolean
    /**
     * - `icon`: apenas a chama (ex.: dentro de cards).
     * - `badge`: pílula com chama + contador (ex.: UserStatistics).
     */
    variant?: "icon" | "badge"
    className?: string
}

function pluralDias(n: number) {
    return `${n} ${n === 1 ? "dia" : "dias"}`
}

function FlameIcon({ active, className }: { active: boolean; className?: string }) {
    return (
        <span
            data-slot="fire-streak-flame"
            data-state={active ? "lit" : "inactive"}
            aria-hidden="true"
            className={cn(
                "relative inline-flex shrink-0 origin-bottom",
                active &&
                    "motion-safe:animate-flame-flicker drop-shadow-[0_0_6px_rgba(251,146,60,0.65)]",
                className,
            )}
        >
            <Flame
                className={cn(
                    "size-full stroke-[2]",
                    active
                        ? "fill-orange-500 text-orange-500"
                        : "fill-transparent text-slate-400",
                )}
            />
            {active && (
                // Núcleo amarelo da chama
                <Flame className="absolute bottom-[8%] left-1/2 size-[50%] -translate-x-1/2 fill-amber-300 stroke-amber-300 stroke-[2]" />
            )}
        </span>
    )
}

export function FireStreak({
    count,
    record,
    active,
    variant = "icon",
    className,
}: FireStreakProps) {
    const status = active
        ? "Você já praticou hoje"
        : "Pratique hoje para manter sua sequência"
    const label = `Sequência de ${pluralDias(count)}. ${status}. Recorde: ${pluralDias(record)}.`

    const isBadge = variant === "badge"

    return (
        <Tooltip>
            <TooltipTrigger
                render={<span />}
                tabIndex={0}
                aria-label={label}
                data-state={active ? "lit" : "inactive"}
                className={cn(
                    "inline-flex cursor-default items-center outline-none focus-visible:ring-2 focus-visible:ring-main-blue focus-visible:ring-offset-2",
                    isBadge &&
                        "gap-2 rounded-full px-4 py-1.5 text-base font-bold text-white transition-colors",
                    isBadge && (active ? "bg-[#7a1010]" : "bg-white/10"),
                    !isBadge && "rounded-md",
                    className,
                )}
            >
                <FlameIcon
                    active={active}
                    className={isBadge ? "size-6" : "size-7 sm:size-9"}
                />
                {isBadge && <span>{count}</span>}
            </TooltipTrigger>
            <TooltipContent>
                <span>
                    Recorde: <strong>{pluralDias(record)}</strong>
                </span>
            </TooltipContent>
        </Tooltip>
    )
}
