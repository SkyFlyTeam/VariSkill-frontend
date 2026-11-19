import type { ReactElement } from "react"

import {
    Award,
    BookCheck,
    Flame,
    Footprints,
    type LucideProps,
    Route,
    Target,
    TrendingUp,
    Trophy,
} from "lucide-react"

import { LockOverlay } from "@/components/shared/LockOverlay/LockOverlay"
import { cn } from "@/lib/utils"
import type { ConquistaCategoria } from "@/services/achievementsService"

const OCTAGON =
    "polygon(29% 0, 71% 0, 100% 29%, 100% 71%, 71% 100%, 29% 100%, 0 71%, 0 29%)"

type IconRenderer = (props: LucideProps) => ReactElement

/** Ícone por código da conquista (seed do backend). */
const ICON_BY_CODE: Record<string, IconRenderer> = {
    PRIMEIRO_PASSO: (props) => <Footprints {...props} />,
    DEDICACAO_INICIAL: (props) => <Flame {...props} />,
    HABITO_DE_FERRO: (props) => <Trophy {...props} />,
    PRECISAO_MAXIMA: (props) => <Target {...props} />,
    EXPLORADOR_MODULO: (props) => <BookCheck {...props} />,
    MESTRE_TRILHA: (props) => <Route {...props} />,
}

/** Fallback para conquistas novas que ainda não tenham ícone dedicado. */
const ICON_BY_CATEGORY: Record<ConquistaCategoria, IconRenderer> = {
    PROGRESSO: (props) => <TrendingUp {...props} />,
    STREAK: (props) => <Flame {...props} />,
    PRECISAO: (props) => <Target {...props} />,
}

const renderFallbackIcon: IconRenderer = (props) => <Award {...props} />

export type AchievementBadgeProps = {
    code: string
    category: ConquistaCategoria
    title: string
    description: string
    locked?: boolean
    className?: string
}

/** Medalha octogonal dourada da conquista. */
export function AchievementBadge({
    code,
    category,
    title,
    description,
    locked = false,
    className,
}: AchievementBadgeProps) {
    const renderIcon =
        ICON_BY_CODE[code] ?? ICON_BY_CATEGORY[category] ?? renderFallbackIcon

    return (
        <div
            className={cn(
                "relative grid size-36 place-items-center overflow-hidden rounded-md",
                className,
            )}
        >
            <div
                className="grid size-full place-items-center bg-[#ff9d00]"
                style={{ clipPath: OCTAGON }}
            >
                <div
                    className="flex size-[90%] flex-col items-center justify-center gap-1 bg-[#ffb800] px-4 text-center text-[#7a4300]"
                    style={{ clipPath: OCTAGON }}
                >
                    {renderIcon({
                        "aria-hidden": true,
                        className: "size-8 stroke-[1.5]",
                    })}
                    <p className="text-sm leading-tight font-medium">{title}</p>
                    <p className="text-[8px] leading-tight text-[#9c5a00]">
                        {description}
                    </p>
                </div>
            </div>
            {locked && <LockOverlay label={`${title} bloqueada`} />}
        </div>
    )
}
