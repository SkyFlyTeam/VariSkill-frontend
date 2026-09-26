import { useEffect, useMemo, useState } from "react"

import { useNavigate, useParams } from "react-router-dom"

import {
    ActivityResultModal,
    type ActivitySubmissionResult,
} from "@/components/shared/ActivityResultModal/ActivityResultModal"
import { ExerciseView } from "@/components/shared/ExerciseView/ExerciseView"
import {
    Question,
    type QuestionProps,
} from "@/components/shared/Question/Question"
import { ApiError, api } from "@/services/api"

type QuestaoOpcao = {
    id: string
    texto_opcao: string
    ordem: number
}

type Questao = {
    id: string
    tipo_exercicio: string
    enunciado: string
    codigo_snippet: string
    opcoes: QuestaoOpcao[]
}

type Atividade = {
    id: string
    titulo: string
    contexto_avaliacao: string
    questoes: Questao[]
}

type Roadmap = {
    percentual_conclusao: number
}

export function ExercisePage() {
    const { trilhaId, atividadeId } = useParams<{
        trilhaId: string
        atividadeId: string
    }>()
    const navigate = useNavigate()

    const [atividade, setAtividade] = useState<Atividade | null>(null)
    const [progress, setProgress] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Resposta do aluno, por tipo de questão.
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
        null,
    )
    const [slotAssignments, setSlotAssignments] = useState<
        Record<number, string>
    >({})
    const [blankValues, setBlankValues] = useState<Record<number, string>>({})

    const [result, setResult] = useState<ActivitySubmissionResult | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    useEffect(() => {
        if (!atividadeId) return
        let active = true

        Promise.all([
            api<Atividade>(`/atividades/${atividadeId}/`),
            trilhaId
                ? api<Roadmap>(`/trilhas/${trilhaId}/roadmap/`)
                : Promise.resolve(null),
        ])
            .then(([loadedAtividade, loadedRoadmap]) => {
                if (!active) return
                setAtividade(loadedAtividade)
                if (loadedRoadmap) {
                    setProgress(loadedRoadmap.percentual_conclusao)
                }
            })
            .catch((requestError: unknown) => {
                if (!active) return
                setError(
                    requestError instanceof ApiError
                        ? requestError.message
                        : "Não foi possível carregar a atividade.",
                )
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [atividadeId, trilhaId])

    const questao = atividade?.questoes[0]

    const question = useMemo<QuestionProps | null>(() => {
        if (!questao) return null

        const blocks = questao.opcoes
            .slice()
            .sort((a, b) => a.ordem - b.ordem)
            .map((opcao) => ({ id: opcao.id, label: opcao.texto_opcao }))
        const codeTemplate = questao.codigo_snippet
            ? questao.codigo_snippet.split("\n")
            : []

        switch (questao.tipo_exercicio) {
            case "MULTIPLA_ESCOLHA":
                return {
                    tipo: "MULTIPLA_ESCOLHA",
                    question: {
                        questionText: "",
                        options: blocks,
                        selectedOptionId,
                        onSelectOption: setSelectedOptionId,
                    },
                }
            case "ORDENAR_BLOCOS":
                return {
                    tipo: "ORDENAR_BLOCOS",
                    question: {
                        questionText: "",
                        codeTemplate,
                        availableBlocks: blocks,
                        slotAssignments,
                        onChangeSlotAssignments: setSlotAssignments,
                    },
                }
            case "COMPLETE_CODIGO":
                return {
                    tipo: "COMPLETE_CODIGO",
                    question: {
                        questionText: "",
                        codeTemplate,
                        blankValues,
                        onChangeBlankValues: setBlankValues,
                        hideSubmitButton: true,
                    },
                }
            default:
                return null
        }
    }, [questao, selectedOptionId, slotAssignments, blankValues])

    const isComplete = useMemo(() => {
        if (!questao) return false
        switch (questao.tipo_exercicio) {
            case "MULTIPLA_ESCOLHA":
                return selectedOptionId !== null
            case "ORDENAR_BLOCOS": {
                const slotCount = questao.codigo_snippet
                    .split("\n")
                    .reduce(
                        (total, line) =>
                            total + (line.match(/__SLOT_\d+__/g)?.length ?? 0),
                        0,
                    )
                return (
                    slotCount > 0 &&
                    Object.keys(slotAssignments).length === slotCount
                )
            }
            case "COMPLETE_CODIGO":
                return Object.values(blankValues).some(
                    (value) => value.trim() !== "",
                )
            default:
                return false
        }
    }, [questao, selectedOptionId, slotAssignments, blankValues])

    function buildAnswer(): string[] {
        if (!questao) return []
        switch (questao.tipo_exercicio) {
            case "MULTIPLA_ESCOLHA":
                return selectedOptionId ? [selectedOptionId] : []
            case "ORDENAR_BLOCOS":
                return Object.keys(slotAssignments)
                    .map(Number)
                    .sort((a, b) => a - b)
                    .map((slot) => slotAssignments[slot])
            case "COMPLETE_CODIGO":
                return Object.keys(blankValues)
                    .map(Number)
                    .sort((a, b) => a - b)
                    .map((blank) => blankValues[blank])
            default:
                return []
        }
    }

    async function handleSubmit() {
        if (!atividade || !questao) return
        setSubmitting(true)
        setSubmitError(null)
        try {
            const submission = await api<ActivitySubmissionResult>(
                `/atividades/${atividade.id}/submeter/`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        respostas: { [questao.id]: buildAnswer() },
                    }),
                },
            )
            setResult(submission)
        } catch (requestError: unknown) {
            setSubmitError(
                requestError instanceof ApiError
                    ? requestError.message
                    : "Não foi possível enviar a resposta. Tente novamente.",
            )
        } finally {
            setSubmitting(false)
        }
    }

    function handleClose() {
        if (trilhaId) {
            navigate(`/trilhas/${trilhaId}`, { replace: true })
        } else {
            navigate(-1)
        }
    }

    function handleRetry() {
        setResult(null)
        setSelectedOptionId(null)
        setSlotAssignments({})
        setBlankValues({})
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#e8ebef]">
                <p className="text-sm text-slate-600">
                    Carregando atividade...
                </p>
            </main>
        )
    }

    if (error || !atividade) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#e8ebef]">
                <p role="alert" className="text-sm text-destructive">
                    {error ?? "Atividade não encontrada."}
                </p>
            </main>
        )
    }

    return (
        <>
            <ExerciseView
                enunciado={questao?.enunciado ?? atividade.titulo}
                progress={progress}
                submitDisabled={!isComplete}
                submitting={submitting}
                onClose={handleClose}
                onSubmit={handleSubmit}
            >
                {submitError && (
                    <p
                        role="alert"
                        className="mb-4 text-center text-sm text-destructive"
                    >
                        {submitError}
                    </p>
                )}
                {question ? (
                    <Question {...question} />
                ) : (
                    <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center text-sm text-slate-400">
                        {questao
                            ? "Tipo de exercício ainda não suportado."
                            : "Esta atividade não possui exercícios."}
                    </p>
                )}
            </ExerciseView>

            {result && (
                <ActivityResultModal
                    open
                    result={result}
                    onContinue={handleClose}
                    onRetry={handleRetry}
                />
            )}
        </>
    )
}
