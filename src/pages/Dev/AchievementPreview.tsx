import { useState } from "react"

import {
    AchievementUnlockedModal,
    type UnlockedAchievement,
} from "@/components/shared/AchievementUnlockedModal/AchievementUnlockedModal"
import { Button } from "@/components/ui/button"

/**
 * Preview do modal de conquista (VAR-112), disponível só em `npm run dev`
 * enquanto o backend (VAR-108/109) não envia `conquistas_desbloqueadas`.
 * Os campos seguem os models `Conquista` e `ItemCosmetico` (VAR-106).
 */
const EM_CHAMAS: UnlockedAchievement = {
    id: "3f0c2a1e-0000-4000-8000-000000000003",
    codigo: "EM_CHAMAS",
    titulo: "Em Chamas",
    descricao: "Você estudou 7 dias seguidos. Que constância!",
    categoria: "STREAK",
    icone: "icone-em-chamas.svg",
    xp_recompensa: 50,
    recompensas: [
        {
            id: "9a1b0000-0000-4000-8000-000000000001",
            nome: "Borda Flamejante",
            tipo: "BORDA",
            raridade: "RARO",
            asset_url: "",
        },
    ],
}

const SCENARIOS: { label: string; achievements: UnlockedAchievement[] }[] = [
    { label: "1 conquista", achievements: [EM_CHAMAS] },
    {
        label: "3 conquistas",
        achievements: [
            {
                id: "3f0c2a1e-0000-4000-8000-000000000001",
                codigo: "PRIMEIRO_PASSO",
                titulo: "Primeiro Passo",
                descricao:
                    "Você concluiu sua primeira atividade. A jornada começou!",
                categoria: "PROGRESSO",
                icone: "icone-primeiro-passo.svg",
                xp_recompensa: 50,
                recompensas: [
                    {
                        id: "9a1b0000-0000-4000-8000-000000000002",
                        nome: "Avatar Explorador",
                        tipo: "AVATAR",
                        raridade: "COMUM",
                    },
                ],
            },
            {
                id: "3f0c2a1e-0000-4000-8000-000000000002",
                codigo: "NOTA_MAXIMA",
                titulo: "Nota Máxima",
                descricao: "Você acertou 100% das questões de uma atividade.",
                categoria: "PRECISAO",
                icone: "icone-nota-maxima.svg",
                xp_recompensa: 100,
                recompensas: [
                    {
                        id: "9a1b0000-0000-4000-8000-000000000003",
                        nome: "Mestre da Precisão",
                        tipo: "TITULO",
                        raridade: "EPICO",
                    },
                    {
                        id: "9a1b0000-0000-4000-8000-000000000004",
                        nome: "Borda Dourada",
                        tipo: "BORDA",
                        raridade: "LENDARIO",
                    },
                ],
            },
            EM_CHAMAS,
        ],
    },
    {
        label: "Sem recompensa e categoria desconhecida",
        achievements: [
            {
                id: "3f0c2a1e-0000-4000-8000-000000000004",
                codigo: "TRILHA_CONCLUIDA",
                titulo: "Trilha Concluída",
                descricao: "Você terminou todos os módulos de uma trilha.",
                categoria: "OUTRA",
                xp_recompensa: 0,
            },
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
