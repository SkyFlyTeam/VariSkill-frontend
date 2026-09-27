import { useEffect, useState } from "react"

import { useNavigate, useParams } from "react-router-dom"

import {
    ActivityNode,
    type ActivityPurpose,
    type ActivityStatus,
} from "@/components/shared/ActivityNode/ActivityNode"
import { RadialProgress } from "@/components/shared/RadialProgress"
import { ApiError, api } from "@/services/api"

type RoadmapActivity = {
    id: string
    titulo: string
    contexto_avaliacao: string
    status: string
    xp_recompensa: number
    conteudo_teorico: { id: string; titulo: string } | null
}

type RoadmapModule = {
    id: string
    titulo: string
    nivel: string
    status: string
    atividades: RoadmapActivity[]
}

type Roadmap = {
    trilha: { id: string; titulo: string; habilidade: string }
    percentual_conclusao: number
    modulos: RoadmapModule[]
    proxima_atividade_recomendada: {
        id: string
        titulo: string
        modulo_id: string
    } | null
}

// Deslocamento horizontal sutil dos nós (zigue-zague "estilo Duolingo").
const ZIGZAG = [
    "translate-x-0",
    "translate-x-12",
    "translate-x-0",
    "-translate-x-12",
] as const

function toActivityStatus(status: string): ActivityStatus {
    if (status === "CONCLUIDO") return "completed"
    if (status === "EM_ANDAMENTO") return "in_progress"
    return "locked"
}

function toActivityPurpose(activity: RoadmapActivity): ActivityPurpose {
    const title = activity.titulo.toLowerCase()
    if (activity.contexto_avaliacao.includes("DIAGNOSTICO") || title.includes("desafio")) {
        return "exam"
    }
    if (!activity.conteudo_teorico || title.includes("exercicio") || activity.contexto_avaliacao.includes("CODIGO")) {
        return "practical"
    }
    return "theoretical"
}

export function TrackRoadmapPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return
        let active = true

        api<Roadmap>(`/trilhas/${encodeURIComponent(id)}/roadmap/`)
            .then((data) => {
                if (active) setRoadmap(data)
            })
            .catch((requestError: unknown) => {
                if (active) {
                    setError(
                        requestError instanceof ApiError
                            ? requestError.message
                            : "Não foi possível carregar a trilha.",
                    )
                }
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [id])

    function handleActivityClick(activity: RoadmapActivity) {
        if (activity.status === "BLOQUEADO") return
        const trilhaId = encodeURIComponent(id ?? "")
        const rota = activity.conteudo_teorico ? "licao" : "atividade"
        navigate(`/trilhas/${trilhaId}/${rota}/${activity.id}`)
    }

    return (
        <main className="min-h-screen bg-[#e8ebef] px-4 py-6 text-slate-900 sm:px-7 sm:py-8">
            <div className="mx-auto max-w-[720px]">
                {loading && (
                    <p className="py-20 text-center text-sm text-slate-600">
                        Carregando trilha...
                    </p>
                )}

                {!loading && error && (
                    <p
                        role="alert"
                        className="py-20 text-center text-sm text-destructive"
                    >
                        {error}
                    </p>
                )}

                {!loading && !error && roadmap && (
                    <div className="flex flex-col gap-7">
                        <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-xl bg-main-blue px-5 py-3.5 shadow-sm sm:px-6">
                            <h1 className="truncate text-base font-bold text-white sm:text-lg">
                                {roadmap.trilha.titulo}
                            </h1>
                            <p className="truncate text-center text-[11px] font-medium text-white/90 sm:text-sm">
                                {roadmap.modulos.find((m) => m.status === "EM_ANDAMENTO")?.titulo ??
                                    roadmap.modulos[0]?.titulo ??
                                    ""}
                            </p>
                            <div className="justify-self-end">
                                <RadialProgress
                                    value={roadmap.percentual_conclusao}
                                />
                            </div>
                        </header>

                        <div className="flex flex-col gap-8">
                            {roadmap.modulos.map((modulo) => (
                                <section
                                    key={modulo.id}
                                    className="flex flex-col gap-6"
                                    aria-label={modulo.titulo}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="h-px w-8 shrink-0 bg-main-blue-dark/30" />
                                        <span className="whitespace-nowrap text-xs font-semibold text-main-blue-dark sm:text-sm">
                                            {modulo.titulo}
                                        </span>
                                        <span className="h-px flex-1 bg-main-blue-dark/30" />
                                    </div>

                                    <div className="flex flex-col gap-6 px-1 sm:px-10">
                                        {modulo.atividades.map(
                                            (atividade, index) => (
                                                <div
                                                    key={atividade.id}
                                                    className="flex w-full justify-center"
                                                >
                                                    <ActivityNode
                                                        className={
                                                            ZIGZAG[
                                                                index %
                                                                    ZIGZAG.length
                                                            ]
                                                        }
                                                        title={atividade.titulo}
                                                        purpose={toActivityPurpose(
                                                            atividade,
                                                        )}
                                                        status={toActivityStatus(
                                                            atividade.status,
                                                        )}
                                                        onClick={() =>
                                                            handleActivityClick(
                                                                atividade,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </section>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
