import { useState } from "react"
import {
    MultipleChoiceQuestion,
    type MultipleChoiceOption,
} from "@/components/shared/MultipleChoiceQuestion/MultipleChoiceQuestion"
import { Button } from "@/components/ui/button"

/**
 * Contrato exato retornado pelo endpoint GET /api/atividades/{id}/ do backend.
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
    conteudo_teorico?: {
        id: string
        titulo: string
        texto_explicativo: string
        tempo_estimado_minutos: number
    } | null
    questoes: BackendQuestion[]
}

// Mock da Atividade retornado exatamente conforme a API do Django
const MOCK_BACKEND_ACTIVITY: BackendAtividade = {
    id: "act-47-uuid-example",
    titulo: "Variáveis e Funções em JavaScript",
    descricao: "Teste seus conhecimentos sobre escopo, hoisting e retorno de funções",
    contexto_avaliacao: "CODIGO",
    xp_recompensa: 50,
    ordem_atividade: 1,
    ativo: true,
    conteudo_teorico: null,
    questoes: [
        {
            id: "q1-uuid-86-959",
            tipo_exercicio: "MULTIPLA_ESCOLHA",
            enunciado: "3 - Qual será a saída desse código?",
            codigo_snippet: `const SUM_VALUE = 2;
function updateCount(value) {
    let newValue = value;
    newValue += SUM_VALUE;
    return newValue;
}
const result = updateCount(4);
console.log("O resultado é: ", result);`,
            ordem_questao: 1,
            opcoes: [
                { id: "opt-86-1001", texto_opcao: "45", ordem: 1 },
                { id: "opt-86-1002", texto_opcao: "56", ordem: 2 },
                { id: "opt-86-1003", texto_opcao: "23", ordem: 3 },
                { id: "opt-86-1004", texto_opcao: "12", ordem: 4 },
            ],
        },
    ],
}

export function MultipleChoicePreviewPage() {
    const activity = MOCK_BACKEND_ACTIVITY
    const currentQuestion = activity.questoes[0]

    // Mapeia os dados do contrato do Backend para as Props do Componente <MultipleChoiceQuestion />
    const optionsForComponent: MultipleChoiceOption[] = currentQuestion.opcoes.map((op) => ({
        id: op.id,
        label: op.texto_opcao,
    }))

    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
    const [submissionPayload, setSubmissionPayload] = useState<string | null>(null)

    function handleVerify() {
        if (selectedOptionId) {
            // Monta o payload exato esperado pelo backend: { respostas: { [questao_id]: [opcao_id] } }
            const payload = {
                respostas: {
                    [currentQuestion.id]: [selectedOptionId],
                },
            }
            setSubmissionPayload(JSON.stringify(payload, null, 2))
        }
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

                {/* Snippet de Código da Questão */}
                {currentQuestion.codigo_snippet && (
                    <pre className="overflow-x-auto rounded-xl bg-[#001a3f] p-4 text-sm font-mono text-sky-200">
                        <code>{currentQuestion.codigo_snippet}</code>
                    </pre>
                )}

                {/* Componente de Múltipla Escolha Integrado com o Payload do Backend */}
                <MultipleChoiceQuestion
                    questionText={currentQuestion.enunciado}
                    options={optionsForComponent}
                    selectedOptionId={selectedOptionId}
                    onSelectOption={setSelectedOptionId}
                />

                <div className="flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row">
                    <p className="text-sm text-muted-foreground">
                        Opção Selecionada:{" "}
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

                {/* Simulação do Payload enviado para o Backend (POST /api/atividades/{id}/submeter/) */}
                {submissionPayload && (
                    <div className="space-y-2 rounded-xl bg-emerald-500/10 p-4 text-xs font-mono text-emerald-800 dark:text-emerald-300">
                        <p className="font-sans font-bold">Payload formatado para o backend (POST /submeter/):</p>
                        <pre className="overflow-x-auto rounded bg-background/50 p-2 text-foreground">
                            {submissionPayload}
                        </pre>
                    </div>
                )}
            </div>
        </main>
    )
}
