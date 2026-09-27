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
import { useAuth } from "@/contexts/authContext"
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

type RoadmapActivity = {
    id: string
    titulo: string
    conteudo_teorico: { id: string; titulo: string } | null
}

type RoadmapModule = {
    id: string
    titulo: string
    atividades: RoadmapActivity[]
}

type Roadmap = {
    percentual_conclusao: number
    modulos: RoadmapModule[]
}

export function ExercisePage() {
    const { trilhaId, atividadeId } = useParams<{
        trilhaId: string
        atividadeId: string
    }>()
    const navigate = useNavigate()
    const { user, updateUser } = useAuth()

    const [atividade, setAtividade] = useState<Atividade | null>(null)
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
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

    const [hintLoading, setHintLoading] = useState(false)
    const [hintModalOpen, setHintModalOpen] = useState(false)
    const [hintText, setHintText] = useState<string | null>(null)

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
                    setRoadmap(loadedRoadmap)
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
            if (user && typeof submission.novo_xp_total === "number") {
                updateUser({ ...user, xp_total: submission.novo_xp_total })
            }
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

    function handleNext() {
        if (!trilhaId || !roadmap) {
            handleClose()
            return
        }

        // Procura a próxima atividade na sequência do roadmap
        const todasAtividades = roadmap.modulos.flatMap((m) => m.atividades)
        const currentIndex = todasAtividades.findIndex((a) => a.id === atividadeId)

        if (currentIndex !== -1 && currentIndex + 1 < todasAtividades.length) {
            const nextAtiv = todasAtividades[currentIndex + 1]
            const rota = nextAtiv.conteudo_teorico ? "licao" : "atividade"
            navigate(
                `/trilhas/${encodeURIComponent(trilhaId)}/${rota}/${encodeURIComponent(nextAtiv.id)}`,
                { replace: true },
            )
        } else {
            navigate(`/trilhas/${encodeURIComponent(trilhaId)}`, {
                replace: true,
            })
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

    async function handleRequestHint() {
        if (!atividade || !questao) return
        setHintLoading(true)
        try {
            const sessao = await api<{ id: string }>("/chat/sessao/iniciar/", {
                method: "POST",
            })
            const resp = await api<{ resposta: string }>(
                `/atividades/${encodeURIComponent(atividade.id)}/pedir-dica/`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        sessao_id: sessao.id,
                        questao_id: questao.id,
                        pergunta: "Como resolver este exercício?",
                    }),
                },
            )
            setHintText(resp.resposta)
        } catch {
            setHintText("Não foi possível obter a dica no momento. Tente analisar as opções atentamente!")
        } finally {
            setHintLoading(false)
        }
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

                <div className="mt-6 flex flex-col items-center gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            setHintModalOpen(true)
                            if (!hintText) handleRequestHint()
                        }}
                        className="flex items-center gap-1.5 text-xs font-semibold text-main-blue hover:underline"
                    >
                        💡 Precisa de uma dica da Vari?
                    </button>

                    {hintModalOpen && (
                        <div className="w-full max-w-md rounded-xl border border-sky-100 bg-sky-50/80 p-4 text-left shadow-sm">
                            <div className="flex items-center justify-between pb-2">
                                <span className="text-xs font-bold text-sky-900">Vari (Dica pedagógica):</span>
                                <button
                                    type="button"
                                    onClick={() => setHintModalOpen(false)}
                                    className="text-xs text-slate-400 hover:text-slate-600"
                                >
                                    ✕
                                </button>
                            </div>
                            {hintLoading ? (
                                <p className="text-xs text-slate-500 animate-pulse">Vari está pensando na dica...</p>
                            ) : (
                                <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">{hintText}</p>
                            )}
                        </div>
                    )}
                </div>
            </ExerciseView>

            {result && (
                <ActivityResultModal
                    open
                    result={result}
                    onContinue={handleNext}
                    onRetry={handleRetry}
                />
            )}
        </>
    )
}
