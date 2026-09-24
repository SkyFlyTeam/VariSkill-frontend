import { useState } from "react"

import { useNavigate } from "react-router-dom"

import {
    ActivityResultModal,
    type ActivitySubmissionResult,
} from "@/components/shared/ActivityResultModal/ActivityResultModal"
import { Button } from "@/components/ui/button"

// Placeholder até existir o Roadmap da trilha (a tela de atividade da VAR-48 vai apontar para ele).
const TRAIL_ROADMAP_ROUTE = "/"

const APPROVED_RESULT: ActivitySubmissionResult = {
    execucao_id: "6f1c1c4e-2f0e-4d43-9d55-0a2f4a6f9a11",
    aprovado: true,
    taxa_acerto: 80,
    pontuacao_obtida: 40,
    xp_concedido: 50,
    novo_xp_total: 4617,
    executado_em: "2026-09-23T18:42:10Z",
    questoes_feedback: [
        {
            questao_id: "q1",
            correta: true,
            explicacao:
                "const declara uma variável que não pode ser reatribuída.",
        },
        {
            questao_id: "q2",
            correta: true,
            explicacao:
                "O método map devolve um novo array sem alterar o original.",
        },
        {
            questao_id: "q3",
            correta: true,
            explicacao:
                "Arrow functions não criam o próprio this, herdando o do escopo externo.",
        },
        {
            questao_id: "q4",
            correta: true,
            explicacao:
                "=== compara valor e tipo, evitando coerções inesperadas.",
        },
        {
            questao_id: "q5",
            correta: false,
            explicacao:
                "Promises encadeadas com .then só executam depois que a anterior resolve.",
        },
    ],
}

const FAILED_RESULT: ActivitySubmissionResult = {
    execucao_id: "b7d9a2f0-8e1b-4a3c-b1c4-3f5e6a7b8c22",
    aprovado: false,
    taxa_acerto: 40,
    pontuacao_obtida: 20,
    xp_concedido: 0,
    novo_xp_total: 4567,
    executado_em: "2026-09-23T18:55:03Z",
    questoes_feedback: [
        {
            questao_id: "q1",
            correta: true,
            explicacao:
                "const declara uma variável que não pode ser reatribuída.",
        },
        {
            questao_id: "q2",
            correta: false,
            explicacao:
                "map não altera o array original: ele devolve um novo array com o resultado.",
        },
        {
            questao_id: "q3",
            correta: false,
            explicacao:
                "Arrow functions herdam o this do escopo onde foram criadas.",
        },
        {
            questao_id: "q4",
            correta: true,
            explicacao:
                "=== compara valor e tipo, evitando coerções inesperadas.",
        },
        {
            questao_id: "q5",
            correta: false,
            explicacao:
                "O .then só roda depois que a Promise anterior é resolvida.",
        },
    ],
}

/**
 * Página de revisão manual da VAR-69, sem login e sem backend.
 * Acesse com `npm run dev` em /preview/activity-result-modal.
 */
export function ActivityResultModalPreviewPage() {
    const navigate = useNavigate()
    const [result, setResult] = useState<ActivitySubmissionResult | null>(null)
    const [lastAction, setLastAction] = useState<string | null>(null)

    function handleContinue() {
        setResult(null)
        setLastAction(`Continuar → redireciona para ${TRAIL_ROADMAP_ROUTE}`)
        navigate(TRAIL_ROADMAP_ROUTE)
    }

    function handleRetry() {
        setResult(null)
        setLastAction("Tentar Novamente → reinicia a atividade")
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted p-4">
            <h1 className="text-xl font-bold">
                Modal de resultado da atividade (VAR-69)
            </h1>

            <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={() => setResult(APPROVED_RESULT)}>
                    Abrir: aprovado (80%)
                </Button>

                <Button
                    variant="outline"
                    onClick={() => setResult(FAILED_RESULT)}
                >
                    Abrir: reprovado (40%)
                </Button>
            </div>

            {lastAction && (
                <p className="text-sm text-muted-foreground">
                    Última ação: {lastAction}
                </p>
            )}

            {result && (
                <ActivityResultModal
                    open
                    result={result}
                    onContinue={handleContinue}
                    onRetry={handleRetry}
                />
            )}
        </main>
    )
}
