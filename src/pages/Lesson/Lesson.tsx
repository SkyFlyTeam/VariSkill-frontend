import { useEffect, useState } from "react"

import { useNavigate, useParams } from "react-router-dom"

import {
    AchievementUnlockedModal,
    type UnlockedAchievement,
} from "@/components/shared/AchievementUnlockedModal/AchievementUnlockedModal"
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

type LessonCompletionResult = {
    status: string
    atividade_id: string
    conquistas_desbloqueadas?: UnlockedAchievement[]
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
    const [unlockedAchievements, setUnlockedAchievements] = useState<
        UnlockedAchievement[]
    >([])
    /** Destino após o modal de conquistas; preenchido só quando ele está aberto. */
    const [nextPath, setNextPath] = useState<string | null>(null)

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
                    const currentModule = loadedRoadmap.modulos.find((m) =>
                        m.atividades.some((a) => a.id === atividadeId),
                    )
                    if (currentModule && currentModule.atividades.length > 0) {
                        const total = currentModule.atividades.length
                        const currentIndex = currentModule.atividades.findIndex(
                            (a) => a.id === atividadeId,
                        )
                        const step = currentIndex >= 0 ? currentIndex + 1 : 1
                        setProgress(Math.round((step / total) * 100))
                    } else {
                        setProgress(loadedRoadmap.percentual_conclusao)
                    }
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

    function getNextPath(trilha: string, currentRoadmap: Roadmap) {
        // Procura a próxima atividade na sequência do roadmap
        const todasAtividades = currentRoadmap.modulos.flatMap(
            (m) => m.atividades,
        )
        const currentIndex = todasAtividades.findIndex(
            (a) => a.id === atividadeId,
        )

        if (currentIndex !== -1 && currentIndex + 1 < todasAtividades.length) {
            const nextAtiv = todasAtividades[currentIndex + 1]
            const rota = nextAtiv.conteudo_teorico ? "licao" : "atividade"
            return `/trilhas/${encodeURIComponent(trilha)}/${rota}/${encodeURIComponent(nextAtiv.id)}`
        }
        return `/trilhas/${encodeURIComponent(trilha)}`
    }

    async function handleNext() {
        if (!trilhaId || !roadmap) {
            handleClose()
            return
        }

        // Marca a lição teórica atual como concluída no backend
        let conquistas: UnlockedAchievement[] = []
        if (atividadeId) {
            try {
                const completion = await api<LessonCompletionResult>(
                    `/atividades/${encodeURIComponent(atividadeId)}/concluir/`,
                    { method: "POST" },
                )
                conquistas = completion?.conquistas_desbloqueadas ?? []
            } catch {
                // Se der erro de rede, continua a navegação
            }
        }

        const path = getNextPath(trilhaId, roadmap)
        if (conquistas.length > 0) {
            // Comemora antes de seguir para a próxima atividade.
            setUnlockedAchievements(conquistas)
            setNextPath(path)
            return
        }
        navigate(path, { replace: true })
    }

    function handleAchievementsClose() {
        const path = nextPath
        // A próxima lição reutiliza este componente: limpa antes de navegar.
        setUnlockedAchievements([])
        setNextPath(null)
        if (path) navigate(path, { replace: true })
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
        <>
            <LessonView
                title={atividade.conteudo_teorico?.titulo ?? atividade.titulo}
                body={body}
                examples={examples}
                progress={progress}
                onClose={handleClose}
                onNext={handleNext}
            />

            {nextPath && unlockedAchievements.length > 0 && (
                <AchievementUnlockedModal
                    open
                    achievements={unlockedAchievements}
                    onClose={handleAchievementsClose}
                    onViewAchievements={() => navigate("/inventario")}
                />
            )}
        </>
    )
}
