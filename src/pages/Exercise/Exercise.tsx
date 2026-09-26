import { useEffect, useState } from "react"

import { useNavigate, useParams } from "react-router-dom"

import { ExerciseView } from "@/components/shared/ExerciseView/ExerciseView"

type Questao = {
    id: string
    tipo_exercicio: string
    enunciado: string
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

// Fetch simples (esta branch está na develop antiga, sem @/services/api).
async function getJson<T>(path: string): Promise<T> {
    const response = await fetch(path, { credentials: "include" })
    if (!response.ok) {
        throw new Error("Não foi possível carregar a atividade.")
    }
    return (await response.json()) as T
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

    useEffect(() => {
        if (!atividadeId) return
        let active = true

        Promise.all([
            getJson<Atividade>(`/api/atividades/${atividadeId}/`),
            trilhaId
                ? getJson<Roadmap>(`/api/trilhas/${trilhaId}/roadmap/`)
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
                if (active) {
                    setError(
                        requestError instanceof Error
                            ? requestError.message
                            : "Não foi possível carregar a atividade.",
                    )
                }
            })
            .finally(() => {
                if (active) setLoading(false)
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

    const questao = atividade.questoes[0]

    return (
        <ExerciseView
            enunciado={questao?.enunciado ?? atividade.titulo}
            progress={progress}
            onClose={handleClose}
            onSubmit={handleClose}
        />
    )
}
