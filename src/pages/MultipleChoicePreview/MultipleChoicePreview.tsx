import { useState } from "react"
import {
    MultipleChoiceQuestion,
    type MultipleChoiceOption,
} from "@/components/shared/MultipleChoiceQuestion/MultipleChoiceQuestion"
import { Button } from "@/components/ui/button"

/**
 * Contrato de Tipos idêntico à modelagem do Backend Django
 */
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
    gabarito_esperado: string // Ex: "opt-86-1002" ou o identificador/texto da opcao esperada no backend
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

// Mock da Atividade com Gabarito Esperado ("opt-86-1002" que corresponde ao valor "6")
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
            gabarito_esperado: "opt-86-1002", // ID da opção "6"
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

/**
 * Validador client-side reproduzindo a mesma estratégia de validação do Backend:
 * `MultipleChoiceValidator` em `grading/validators.py`
 */
function validateMultipleChoiceAnswer(questao: BackendQuestion, optionId: string): boolean {
    return optionId === questao.gabarito_esperado
}

export function MultipleChoicePreviewPage() {
    const activity = MOCK_BACKEND_ACTIVITY
    const currentQuestion = activity.questoes[0]

    // Mapeamento das opções para o componente <MultipleChoiceQuestion />
    const optionsForComponent: MultipleChoiceOption[] = currentQuestion.opcoes.map((op) => ({
        id: op.id,
        label: op.texto_opcao,
    }))

    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
    const [evaluationResult, setEvaluationResult] = useState<{
        correta: boolean
        payload: object
        explicacao: string
    } | null>(null)

    function handleVerify() {
        if (!selectedOptionId) return

        // 1. Monta o payload exatamente como o frontend envia no POST /api/atividades/{id}/submeter/
        const payload = {
            respostas: {
                [currentQuestion.id]: [selectedOptionId],
            },
        }

        // 2. Executa a lógica de checagem contra o gabarito_esperado
        const isCorrect = validateMultipleChoiceAnswer(currentQuestion, selectedOptionId)

        setEvaluationResult({
            correta: isCorrect,
            payload: payload,
            explicacao: currentQuestion.explicacao,
        })
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
                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                        +{activity.xp_recompensa} XP
                    </span>
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
                    onSelectOption={(id) => {
                        setSelectedOptionId(id)
                        setEvaluationResult(null) // limpa avaliacao ao mudar opcao
                    }}
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
                        Verificar
                    </Button>
                </div>

                {/* Feedback da Avaliação com base no gabarito_esperado */}
                {evaluationResult && (
                    <div
                        className={`space-y-3 rounded-2xl p-4 text-sm font-medium transition-all ${
                            evaluationResult.correta
                                ? "bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                                : "bg-destructive/10 border-2 border-destructive/40 text-destructive"
                        }`}
                    >
                        <div className="flex items-center gap-2 font-bold text-base">
                            {evaluationResult.correta ? "✅ Resposta Correta!" : "❌ Resposta Incorreta"}
                        </div>
                        <p className="text-xs text-muted-foreground">{evaluationResult.explicacao}</p>

                        <div className="border-t border-current/20 pt-2 text-xs font-mono">
                            <p className="font-sans font-semibold mb-1">Payload enviado:</p>
                            <pre className="rounded bg-background/60 p-2 text-foreground overflow-x-auto">
                                {JSON.stringify(evaluationResult.payload, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
