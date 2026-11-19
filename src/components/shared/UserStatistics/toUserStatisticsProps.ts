import type { User } from "@/services/authService"
import { resolveCosmeticAsset } from "@/utils/cosmeticAsset"

import type { UserStatisticsProps } from "./UserStatistics"

/**
 * Converte o usuário da API nas props do UserStatistics.
 * O XP exibido é relativo à faixa do nível atual (ex.: "40 / 100 XP"),
 * coerente com `progresso_pct`.
 */
export function toUserStatisticsProps(
    user: User,
): Omit<
    UserStatisticsProps,
    "trophies" | "trophiesLabel" | "compact" | "className"
> {
    const progresso = user.progresso_nivel
    const xpTotal = progresso?.xp_atual ?? user.xp_total ?? 0
    const xpMin = progresso?.xp_min_faixa ?? 0
    const xpNext = progresso?.xp_proximo_nivel ?? xpTotal

    return {
        name: user.apelido || user.nome || "Estudante",
        level: progresso?.nivel ?? user.nivel ?? 1,
        xpCurrent: Math.max(0, xpTotal - xpMin),
        xpTarget: Math.max(0, xpNext - xpMin),
        progressPct: progresso?.progresso_pct ?? 0,
        streak: {
            atual: user.streak.atual,
            recorde: user.streak.recorde,
            concluiu_hoje: user.streak.concluiu_hoje,
        },
        avatarUrl: user.avatar_equipado
            ? resolveCosmeticAsset(user.avatar_equipado.recurso_visual)
            : undefined,
        borderUrl: user.borda_equipada
            ? resolveCosmeticAsset(user.borda_equipada.recurso_visual)
            : undefined,
        title: user.titulo_equipado?.nome,
    }
}
