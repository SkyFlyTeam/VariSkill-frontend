import { useState } from "react"
import {
    ActivityResultModal,
    type ActivitySubmissionResult,
} from "@/components/shared/ActivityResultModal/ActivityResultModal"
import {
    MultipleChoiceQuestion,
    type MultipleChoiceOption,
} from "@/components/shared/MultipleChoiceQuestion/MultipleChoiceQuestion"
import { Button } from "@/components/ui/button"

export interface BackendQuestionOpcao {
    id: string
    texto_opcao: string
    ordem: number
}

export interface BackendQuestion {
    id: string
    tipo_exercicio: "MULTIPLA_ESCOLHA" | "COMPLETE_CODIGO" | "ORDENAR_BLOCOS"
    enunciado: string
    codigo_snippet?: string | null
    gabarito_esperado: string
    explicacao: string
    ordem_questao: number
    opcoes: BackendQuestionOpcao[]
}

export interface BackendAtividade {
    id: string
    titulo: string
    descricao: string
    contexto_avaliacao: string
    xp_recompensa: number
    ordem_atividade: number
    ativo: boolean
    questoes: BackendQuestion[]
}

const MOCK_BACKEND_ACTIVITY: BackendAtividade = {
    id: "act-47-uuid-example",
    titulo: "Variáveis e Funções em JavaScript",
    descricao: "Teste seus conhecimentos sobre escopo, hoisting e retorno de funções",
    contexto_avaliacao: "CODIGO",
    xp_recompensa: 50,
    ordem_atividade: 1,
    ativo: true,
    questoes: [
        {
            id: "q1-uuid-86-959",
            tipo_exercicio: "MULTIPLA_ESCOLHA",
            enunciado: "3 - Qual será a saída desse código?",
            codigo_snippet: `const SUM_VALUE = 2;\nfunction updateCount(value) {\n    let newValue = value;\n    newValue += SUM_VALUE;\n    return newValue;\n}\nconst result = updateCount(4);\nconsole.log("O resultado é: ", result);`,
            gabarito_esperado: "opt-86-1002", // "6"
            explicacao: "A função updateCount recebe 4 e soma com SUM_VALUE (2), resultando em 6.",
            ordem_questao: 1,
            opcoes: [
                { id: "opt-86-1001", texto_opcao: "4", ordem: 1 },
                { id: "opt-86-1002", texto_opcao: "6", ordem: 2 },
                { id: "opt-86-1003", texto_opcao: "8", ordem: 3 },
                { id: "opt-86-1004", texto_opcao: "2", ordem: 4 },
            ],
        },
    ],
}

export function MultipleChoicePreviewPage() {
    const activity = MOCK_BACKEND_ACTIVITY
    const currentQuestion = activity.questoes[0]

    const optionsForComponent: MultipleChoiceOption[] = currentQuestion.opcoes.map((op) => ({
        id: op.id,
        label: op.texto_opcao,
    }))

    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
    const [submissionResult, setSubmissionResult] = useState<ActivitySubmissionResult | null>(null)
    const [userXp, setUserXp] = useState<number>(4500)

    function handleVerify() {
        if (!selectedOptionId) return

        const isCorrect = selectedOptionId === currentQuestion.gabarito_esperado
        const taxaAcerto = isCorrect ? 100 : 0
        const xpConcedido = isCorrect ? activity.xp_recompensa : 0
        const novoXpTotal = userXp + xpConcedido

        if (isCorrect) {
            setUserXp(novoXpTotal)
        }

        // Monta o payload idêntico ao retornado por POST /api/atividades/{id}/submeter/
        const result: ActivitySubmissionResult = {
            execucao_id: "exec-" + Math.random().toString(36).substring(7),
            aprovado: isCorrect,
            taxa_acerto: taxaAcerto,
            pontuacao_obtida: isCorrect ? 100 : 0,
            xp_concedido: xpConcedido,
            novo_xp_total: novoXpTotal,
            executado_em: new Date().toISOString(),
            questoes_feedback: [
                {
                    questao_id: currentQuestion.id,
                    correta: isCorrect,
                    explicacao: currentQuestion.explicacao,
                },
            ],
        }

        setSubmissionResult(result)
    }

    function handleRetry() {
        setSubmissionResult(null)
        setSelectedOptionId(null)
    }

    function handleContinue() {
        setSubmissionResult(null)
        setSelectedOptionId(null)
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-muted p-4 sm:p-8">
            <div className="w-full max-w-2xl space-y-6 rounded-3xl bg-card p-6 shadow-lg sm:p-8">
                <div className="flex items-center justify-between border-b pb-4">
                    <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Atividade Múltipla Escolha (VAR-47)
                        </span>
                        <h1 className="text-xl font-bold text-foreground">{activity.titulo}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-600 dark:text-sky-400">
                            XP Atual: {userXp}
                        </span>
                        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                            +{activity.xp_recompensa} XP
                        </span>
                    </div>
                </div>

                {/* Snippet de Código */}
                {currentQuestion.codigo_snippet && (
                    <pre className="overflow-x-auto rounded-xl bg-[#001a3f] p-4 text-sm font-mono text-sky-200">
                        <code>{currentQuestion.codigo_snippet}</code>
                    </pre>
                )}

                {/* Componente <MultipleChoiceQuestion /> */}
                <MultipleChoiceQuestion
                    questionText={currentQuestion.enunciado}
                    options={optionsForComponent}
                    selectedOptionId={selectedOptionId}
                    onSelectOption={setSelectedOptionId}
                />

                <div className="flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row">
                    <p className="text-sm text-muted-foreground">
                        Opção selecionada:{" "}
                        <strong className="text-foreground">
                            {selectedOptionId
                                ? currentQuestion.opcoes.find((o) => o.id === selectedOptionId)?.texto_opcao
                                : "Nenhuma"}
                        </strong>
                    </p>

                    <Button
                        variant="vari"
                        size="lg"
                        disabled={!selectedOptionId}
                        onClick={handleVerify}
                        className="w-full sm:w-auto"
                    >
                        Verificar Resposta
                    </Button>
                </div>
            </div>

            {/* Integração com o ActivityResultModal (VAR-69) */}
            {submissionResult && (
                <ActivityResultModal
                    open
                    result={submissionResult}
                    onContinue={handleContinue}
                    onRetry={handleRetry}
                />
            )}
        </main>
    )
}
