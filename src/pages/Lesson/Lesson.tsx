import { useEffect, useState } from "react"

import { useNavigate, useParams } from "react-router-dom"

import { LessonView } from "@/components/shared/LessonView/LessonView"
import { ApiError, api } from "@/services/api"

type ConteudoTeorico = {
    id: string
    titulo: string
    texto_explicativo: string
    tempo_estimado_minutos: number
}

type Atividade = {
    id: string
    titulo: string
    conteudo_teorico: ConteudoTeorico | null
}

type Roadmap = {
    percentual_conclusao: number
}

function extractCodeExamples(texto: string): {
    body: string
    examples: string[][]
} {
    const examples: string[][] = []
    const body = texto
        .replace(/```[^\n]*\n([\s\S]*?)```/g, (_, code: string) => {
            examples.push(code.replace(/\n$/, "").split("\n"))
            return ""
        })
        .trim()

    return { body, examples }
}

export function LessonPage() {
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
            api<Atividade>(`/atividades/${encodeURIComponent(atividadeId)}/`),
            trilhaId
                ? api<Roadmap>(
                      `/trilhas/${encodeURIComponent(trilhaId)}/roadmap/`,
                  )
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
                        requestError instanceof ApiError
                            ? requestError.message
                            : "Não foi possível carregar a lição.",
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
            navigate(`/trilhas/${encodeURIComponent(trilhaId)}`, {
                replace: true,
            })
        } else {
            navigate(-1)
        }
    }

    function handleNext() {
        navigate(`/trilhas/${encodeURIComponent(trilhaId ?? "")}`, {
            replace: true,
        })
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#e8ebef]">
                <p className="text-sm text-slate-600">Carregando lição...</p>
            </main>
        )
    }

    if (error || !atividade) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#e8ebef]">
                <p role="alert" className="text-sm text-destructive">
                    {error ?? "Lição não encontrada."}
                </p>
            </main>
        )
    }

    const { body, examples } = extractCodeExamples(
        atividade.conteudo_teorico?.texto_explicativo ?? "",
    )

    return (
        <LessonView
            title={atividade.conteudo_teorico?.titulo ?? atividade.titulo}
            body={body}
            examples={examples}
            progress={progress}
            onClose={handleClose}
            onNext={handleNext}
        />
    )
}
