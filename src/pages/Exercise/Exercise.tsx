import { useEffect, useMemo, useState } from "react"

import { useNavigate, useParams } from "react-router-dom"

import {
    ActivityResultModal,
    type ActivitySubmissionResult,
} from "@/components/shared/ActivityResultModal/ActivityResultModal"
import { ExerciseView } from "@/components/shared/ExerciseView/ExerciseView"
import { LevelUpModal } from "@/components/shared/LevelUpModal/LevelUpModal"
import { Question } from "@/components/shared/Question/Question"
import { useAuth } from "@/contexts/authContext"
import { ApiError, api } from "@/services/api"

import {
    EMPTY_ANSWER,
    type Questao,
    buildQuestionProps,
    isAnswerComplete,
    serializeAnswer,
} from "./questionAnswer"
import {
    getExerciseStorageKey,
    useExerciseProgress,
} from "./useExerciseProgress"

type Atividade = {
    id: string
    titulo: string
    contexto_avaliacao: string
    questoes: Questao[]
}

type RoadmapActivity = {
    id: string
    titulo: string
    status: string
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

    const [loadResult, setLoadResult] = useState<
        | { atividadeId: string; atividade: Atividade; roadmap: Roadmap | null }
        | { atividadeId: string; error: string }
        | null
    >(null)

    const currentResult =
        loadResult?.atividadeId === atividadeId ? loadResult : null
    const loading = !currentResult
    const atividade =
        currentResult && "atividade" in currentResult
            ? currentResult.atividade
            : null
    const roadmap =
        currentResult && "roadmap" in currentResult
            ? currentResult.roadmap
            : null
    const error =
        currentResult && "error" in currentResult ? currentResult.error : null

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
                setLoadResult({
                    atividadeId,
                    atividade: loadedAtividade,
                    roadmap: loadedRoadmap,
                })
            })
            .catch((requestError: unknown) => {
                if (!active) return
                setLoadResult({
                    atividadeId,
                    error:
                        requestError instanceof ApiError
                            ? requestError.message
                            : "Não foi possível carregar a atividade.",
                })
            })

        return () => {
            active = false
        }
    }, [atividadeId, trilhaId])

    function handleClose() {
        if (trilhaId) {
            navigate(`/trilhas/${trilhaId}`, { replace: true })
        } else {
            navigate(-1)
        }
    }

    function handleNextActivity() {
        if (!trilhaId || !roadmap) {
            handleClose()
            return
        }

        const todasAtividades = roadmap.modulos.flatMap((m) => m.atividades)
        const currentIndex = todasAtividades.findIndex(
            (a) => a.id === atividadeId,
        )

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
        <ExerciseSession
            key={atividade.id}
            atividade={atividade}
            onClose={handleClose}
            onContinue={handleNextActivity}
        />
    )
}

type ExerciseSessionProps = {
    atividade: Atividade
    onClose: () => void
    onContinue: () => void
}

function ExerciseSession({
    atividade,
    onClose,
    onContinue,
}: ExerciseSessionProps) {
    const { user, updateUser } = useAuth()
    const { questoes } = atividade

    const {
        activeQuestoes,
        isRetry,
        currentIndex,
        answers,
        setAnswer,
        goTo,
        startRetry,
        clearStorage,
    } = useExerciseProgress(
        getExerciseStorageKey(atividade.id, user?.id),
        questoes,
    )

    const [result, setResult] = useState<ActivitySubmissionResult | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [levelUpOpen, setLevelUpOpen] = useState(false)

    const [hintLoading, setHintLoading] = useState(false)
    const [hintModalOpen, setHintModalOpen] = useState(false)
    const [hints, setHints] = useState<Record<string, string>>({})
    const [sessaoId, setSessaoId] = useState<string | null>(null)

    const totalQuestions = activeQuestoes.length
    const questao = activeQuestoes[currentIndex]
    const currentAnswer = (questao && answers[questao.id]) ?? EMPTY_ANSWER
    const isLastQuestion = currentIndex === totalQuestions - 1
    const hintText = questao ? hints[questao.id] : undefined

    const question = useMemo(
        () =>
            questao
                ? buildQuestionProps(questao, currentAnswer, (answer) =>
                      setAnswer(questao.id, answer),
                  )
                : null,
        [questao, currentAnswer, setAnswer],
    )

    const answeredCount = useMemo(
        () =>
            activeQuestoes.filter((q) =>
                isAnswerComplete(q, answers[q.id] ?? EMPTY_ANSWER),
            ).length,
        [activeQuestoes, answers],
    )
    const progress =
        totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0

    const isCurrentComplete = questao
        ? isAnswerComplete(questao, currentAnswer)
        : false
    const allComplete = useMemo(
        () =>
            questoes.length > 0 &&
            questoes.every((q) =>
                isAnswerComplete(q, answers[q.id] ?? EMPTY_ANSWER),
            ),
        [questoes, answers],
    )

    function changeQuestion(index: number) {
        setHintModalOpen(false)
        setSubmitError(null)
        goTo(index)
    }

    function handlePrimaryAction() {
        if (isLastQuestion) {
            void handleSubmit()
        } else {
            changeQuestion(currentIndex + 1)
        }
    }

    async function handleSubmit() {
        if (!allComplete) return
        setSubmitting(true)
        setSubmitError(null)
        try {
            const respostas = Object.fromEntries(
                questoes.map((q) => [
                    q.id,
                    serializeAnswer(q, answers[q.id] ?? EMPTY_ANSWER),
                ]),
            )
            const submission = await api<ActivitySubmissionResult>(
                `/atividades/${atividade.id}/submeter/`,
                {
                    method: "POST",
                    body: JSON.stringify({ respostas }),
                },
            )
            clearStorage()
            setResult(submission)
            setLevelUpOpen(
                submission.level_up === true &&
                    typeof submission.novo_nivel === "number",
            )
            if (user && typeof submission.novo_xp_total === "number") {
                updateUser({ ...user, xp_total: submission.novo_xp_total })
            }
        } catch (requestError: unknown) {
            setSubmitError(
                requestError instanceof ApiError
                    ? requestError.message
                    : "Não foi possível enviar as respostas. Tente novamente.",
            )
        } finally {
            setSubmitting(false)
        }
    }

    function handleContinue() {
        setResult(null)
        onContinue()
    }

    function handleRetry() {
        const wrongQuestionIds =
            result?.questoes_feedback
                .filter((feedback) => !feedback.correta)
                .map((feedback) => feedback.questao_id) ?? []
        setResult(null)
        setLevelUpOpen(false)
        setHintModalOpen(false)
        setSubmitError(null)
        startRetry(wrongQuestionIds)
    }

    async function handleRequestHint() {
        if (!questao) return
        const questaoId = questao.id
        setHintLoading(true)
        try {
            let currentSessaoId = sessaoId
            if (!currentSessaoId) {
                const sessao = await api<{ sessao_id: string }>(
                    "/chat/sessao/iniciar/",
                    { method: "POST" },
                )
                currentSessaoId = sessao.sessao_id
                setSessaoId(sessao.sessao_id)
            }

            const resp = await api<{ resposta_coach: string }>(
                `/atividades/${encodeURIComponent(atividade.id)}/pedir-dica/`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        sessao_id: currentSessaoId,
                        questao_id: questaoId,
                        pergunta: "Como resolver este exercício?",
                    }),
                },
            )
            setHints((previous) => ({
                ...previous,
                [questaoId]: resp.resposta_coach,
            }))
        } catch (error) {
            console.error("Hint request error:", error)
            setHints((previous) => ({
                ...previous,
                [questaoId]:
                    "Não foi possível obter a dica no momento. Tente analisar as opções atentamente!",
            }))
        } finally {
            setHintLoading(false)
        }
    }

    return (
        <>
            <ExerciseView
                enunciado={questao?.enunciado ?? atividade.titulo}
                stepLabel={
                    isRetry
                        ? `Revisão: questão ${currentIndex + 1} de ${totalQuestions}`
                        : totalQuestions > 1
                          ? `Questão ${currentIndex + 1} de ${totalQuestions}`
                          : undefined
                }
                progress={progress}
                submitLabel={isLastQuestion ? "Verificar" : "Próxima"}
                submitDisabled={
                    isLastQuestion ? !allComplete : !isCurrentComplete
                }
                submitting={submitting}
                onClose={onClose}
                onSubmit={handlePrimaryAction}
                onBack={
                    currentIndex > 0
                        ? () => changeQuestion(currentIndex - 1)
                        : undefined
                }
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

                {questao && (
                    <div className="mt-6 flex flex-col items-center gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setHintModalOpen(true)
                                if (!hintText && !hintLoading)
                                    void handleRequestHint()
                            }}
                            className="flex items-center gap-1.5 text-xs font-semibold text-main-blue hover:underline"
                        >
                            💡 Precisa de uma dica da Vari?
                        </button>

                        {hintModalOpen && (
                            <div className="w-full max-w-md rounded-xl border border-sky-100 bg-sky-50/80 p-4 text-left shadow-sm">
                                <div className="flex items-center justify-between pb-2">
                                    <span className="text-xs font-bold text-sky-900">
                                        Vari (Dica pedagógica):
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setHintModalOpen(false)}
                                        aria-label="Fechar dica"
                                        className="text-xs text-slate-400 hover:text-slate-600"
                                    >
                                        ✕
                                    </button>
                                </div>
                                {hintLoading && !hintText ? (
                                    <p className="animate-pulse text-xs text-slate-500">
                                        Vari está pensando na dica...
                                    </p>
                                ) : (
                                    <p className="text-xs leading-relaxed whitespace-pre-wrap text-slate-700">
                                        {hintText}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </ExerciseView>

            {result && levelUpOpen && result.novo_nivel !== undefined && (
                <LevelUpModal
                    open
                    level={result.novo_nivel}
                    previousLevel={result.nivel_anterior}
                    onClose={() => setLevelUpOpen(false)}
                />
            )}

            {result && !levelUpOpen && (
                <ActivityResultModal
                    open
                    result={result}
                    onContinue={handleContinue}
                    onRetry={handleRetry}
                />
            )}
        </>
    )
}
