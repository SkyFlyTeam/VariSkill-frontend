import { useCallback, useEffect, useMemo, useState } from "react"

import type { Questao, QuestionAnswer } from "./questionAnswer"

const STORAGE_PREFIX = "variskill:exercise-progress"

type ExerciseProgress = {
    currentIndex: number
    answers: Record<string, QuestionAnswer>
    retryQuestionIds: string[] | null
}

const INITIAL_PROGRESS: ExerciseProgress = {
    currentIndex: 0,
    answers: {},
    retryQuestionIds: null,
}

export function getExerciseStorageKey(atividadeId: string, userId?: string) {
    return `${STORAGE_PREFIX}:${userId ?? "anonimo"}:${atividadeId}`
}

function loadProgress(
    storageKey: string,
    questoes: Questao[],
): ExerciseProgress {
    try {
        const raw = localStorage.getItem(storageKey)
        if (!raw) return INITIAL_PROGRESS

        const parsed = JSON.parse(raw) as Partial<ExerciseProgress>
        const validIds = new Set(questoes.map((questao) => questao.id))
        const answers = Object.fromEntries(
            Object.entries(parsed.answers ?? {}).filter(([questaoId]) =>
                validIds.has(questaoId),
            ),
        )
        const retryIds = Array.isArray(parsed.retryQuestionIds)
            ? parsed.retryQuestionIds.filter((id) => validIds.has(id))
            : []
        const retryQuestionIds = retryIds.length > 0 ? retryIds : null

        const activeCount = retryQuestionIds?.length ?? questoes.length
        const lastIndex = Math.max(activeCount - 1, 0)
        const currentIndex = Number.isInteger(parsed.currentIndex)
            ? Math.min(Math.max(parsed.currentIndex as number, 0), lastIndex)
            : 0

        return { currentIndex, answers, retryQuestionIds }
    } catch {
        return INITIAL_PROGRESS
    }
}

export function useExerciseProgress(storageKey: string, questoes: Questao[]) {
    const [progress, setProgress] = useState<ExerciseProgress>(() =>
        loadProgress(storageKey, questoes),
    )

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(progress))
        } catch {
            console.error(
                `Falha ao salvar progresso da atividade no localStorage (key=${storageKey})`,
            )
        }
    }, [storageKey, progress])

    const activeQuestoes = useMemo(() => {
        if (!progress.retryQuestionIds) return questoes
        const retryIds = new Set(progress.retryQuestionIds)
        return questoes.filter((questao) => retryIds.has(questao.id))
    }, [questoes, progress.retryQuestionIds])

    const setAnswer = useCallback(
        (questaoId: string, answer: QuestionAnswer) =>
            setProgress((previous) => ({
                ...previous,
                answers: { ...previous.answers, [questaoId]: answer },
            })),
        [],
    )

    const goTo = useCallback(
        (index: number) =>
            setProgress((previous) => ({ ...previous, currentIndex: index })),
        [],
    )

    const startRetry = useCallback(
        (wrongQuestionIds: string[]) =>
            setProgress((previous) => {
                const wrongIds = new Set(wrongQuestionIds)
                const retryQuestionIds = questoes
                    .map((questao) => questao.id)
                    .filter((id) => wrongIds.has(id))
                if (retryQuestionIds.length === 0) return INITIAL_PROGRESS

                return {
                    currentIndex: 0,
                    answers: Object.fromEntries(
                        Object.entries(previous.answers).filter(
                            ([questaoId]) => !wrongIds.has(questaoId),
                        ),
                    ),
                    retryQuestionIds,
                }
            }),
        [questoes],
    )

    const clearStorage = useCallback(() => {
        try {
            localStorage.removeItem(storageKey)
        } catch {
            console.error(
                `Falha ao limpar progresso da atividade no localStorage (key=${storageKey})`,
            )
        }
    }, [storageKey])

    return {
        activeQuestoes,
        isRetry: progress.retryQuestionIds !== null,
        currentIndex: progress.currentIndex,
        answers: progress.answers,
        setAnswer,
        goTo,
        startRetry,
        clearStorage,
    }
}
