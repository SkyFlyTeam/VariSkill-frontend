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
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
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
                    setRoadmap(loadedRoadmap)
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

    async function handleNext() {
        if (!trilhaId || !roadmap) {
            handleClose()
            return
        }

        // Marca a lição teórica atual como concluída no backend
        if (atividadeId) {
            try {
                await api(`/atividades/${encodeURIComponent(atividadeId)}/concluir/`, {
                    method: "POST",
                })
            } catch {
                // Se der erro de rede, continua a navegação
            }
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
