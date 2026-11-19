import { useState } from "react"

import {
    type AchievementReward,
    AchievementUnlockedModal,
    type UnlockedAchievement,
} from "@/components/shared/AchievementUnlockedModal/AchievementUnlockedModal"
import { Button } from "@/components/ui/button"

/**
 * Preview do modal de conquista (VAR-112), disponível só em `npm run dev`.
 * Os dados replicam o seed da VAR-107 no formato que o motor da VAR-108
 * devolve em `conquistas_desbloqueadas` (`serializar_conquista`).
 */
function achievement(
    data: Omit<UnlockedAchievement, "item_desbloqueado" | "itens_desbloqueados">,
    itens: AchievementReward[],
): UnlockedAchievement {
    return {
        ...data,
        item_desbloqueado: itens[0] ?? null,
        itens_desbloqueados: itens,
    }
}

const PRIMEIRO_PASSO = achievement(
    {
        id: "3f0c2a1e-0000-4000-8000-000000000001",
        codigo: "PRIMEIRO_PASSO",
        titulo: "Primeiro Passo",
        descricao: "Concluiu a primeira atividade.",
        icone: "conquistas/primeiro_passo.svg",
        xp_recompensa: 50,
    },
    [
        {
            id: "9a1b0000-0000-4000-8000-000000000001",
            nome: "Vari Estudioso",
            tipo: "AVATAR",
            asset_url: "",
        },
    ],
)

const TIRO_CERTEIRO = achievement(
    {
        id: "3f0c2a1e-0000-4000-8000-000000000002",
        codigo: "PRECISAO_MAXIMA",
        titulo: "Tiro Certeiro",
        descricao: "Acertou 100% de uma bateria de questões sem errar.",
        icone: "conquistas/tiro_certeiro.svg",
        xp_recompensa: 150,
    },
    [
        {
            id: "9a1b0000-0000-4000-8000-000000000002",
            nome: "Borda Neon",
            tipo: "BORDA",
            asset_url: "",
        },
        {
            id: "9a1b0000-0000-4000-8000-000000000003",
            nome: "Mestre da Lógica",
            tipo: "TITULO",
            asset_url: "",
        },
    ],
)

const FOGO_ACESO = achievement(
    {
        id: "3f0c2a1e-0000-4000-8000-000000000003",
        codigo: "DEDICACAO_INICIAL",
        titulo: "Fogo Aceso",
        descricao: "Estudou por 3 dias seguidos.",
        icone: "conquistas/fogo_aceso.svg",
        xp_recompensa: 100,
    },
    [
        {
            id: "9a1b0000-0000-4000-8000-000000000004",
            nome: "Iniciante Imparável",
            tipo: "TITULO",
            asset_url: "",
        },
    ],
)

const SCENARIOS: { label: string; achievements: UnlockedAchievement[] }[] = [
    { label: "1 conquista", achievements: [PRIMEIRO_PASSO] },
    {
        label: "3 conquistas",
        achievements: [PRIMEIRO_PASSO, TIRO_CERTEIRO, FOGO_ACESO],
    },
    {
        label: "Com raridade (futuro)",
        achievements: [
            {
                ...FOGO_ACESO,
                itens_desbloqueados: [
                    {
                        id: "9a1b0000-0000-4000-8000-000000000005",
                        nome: "Borda Flamejante",
                        tipo: "BORDA",
                        raridade: "EPICO",
                        asset_url: "",
                    },
                ],
            },
        ],
    },
    {
        label: "Sem item e código desconhecido",
        achievements: [
            achievement(
                {
                    id: "3f0c2a1e-0000-4000-8000-000000000004",
                    codigo: "OUTRA_CONQUISTA",
                    titulo: "Trilha Completa",
                    descricao: "Concluiu uma trilha de aprendizagem.",
                    xp_recompensa: 0,
                },
                [],
            ),
        ],
    },
]

export function AchievementPreviewPage() {
    const [scenario, setScenario] = useState<number | null>(null)

    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-page p-6">
            <h1 className="text-lg font-bold">
                Preview · Conquista Desbloqueada
            </h1>
            <div className="flex flex-wrap justify-center gap-3">
                {SCENARIOS.map((item, index) => (
                    <Button
                        key={item.label}
                        variant="vari"
                        onClick={() => setScenario(index)}
                    >
                        {item.label}
                    </Button>
                ))}
            </div>

            {scenario !== null && (
                <AchievementUnlockedModal
                    key={scenario}
                    open
                    achievements={SCENARIOS[scenario].achievements}
                    onClose={() => setScenario(null)}
                    onViewAchievements={() => setScenario(null)}
                />
            )}
        </main>
    )
}
