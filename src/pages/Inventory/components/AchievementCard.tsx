import { AchievementBadge } from "@/components/shared/AchievementBadge/AchievementBadge"
import type { Conquista } from "@/services/achievementsService"

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
})

export type AchievementCardProps = {
    achievement: Conquista
}

export function AchievementCard({ achievement }: AchievementCardProps) {
    const {
        codigo,
        categoria,
        titulo,
        descricao,
        desbloqueada,
        desbloqueada_em,
    } = achievement

    return (
        <article className="flex flex-col items-center gap-3">
            <AchievementBadge
                code={codigo}
                category={categoria}
                title={titulo}
                description={descricao}
                locked={!desbloqueada}
            />
            <p className="w-full text-[11px] font-medium text-slate-700">
                {desbloqueada && desbloqueada_em
                    ? `Conquistado em ${dateFormat.format(new Date(desbloqueada_em))}`
                    : "Ainda não conquistada"}
            </p>
        </article>
    )
}
