import { useEffect, useState } from "react"

import { useNavigate, useParams } from "react-router-dom"

import {
    ActivityNode,
    type ActivityPurpose,
    type ActivityStatus,
} from "@/components/shared/ActivityNode/ActivityNode"
import { RadialProgress } from "@/components/shared/RadialProgress"
import { cn } from "@/lib/utils"
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

// Padrão de alinhamento horizontal dos nós (zigue-zague "estilo Duolingo").
const ZIGZAG = [
    "justify-center",
    "justify-end",
    "justify-center",
    "justify-start",
    "justify-center",
    "justify-end",
] as const

function toActivityStatus(status: string): ActivityStatus {
    if (status === "CONCLUIDO") return "completed"
    if (status === "EM_ANDAMENTO") return "in_progress"
    return "locked"
}

function toActivityPurpose(contexto: string): ActivityPurpose {
    if (contexto.includes("DIAGNOSTICO")) return "exam"
    if (contexto.includes("CODIGO") || contexto.includes("COMPLETE")) {
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

    function handleActivityClick(activityId: string) {
        navigate(
            `/trilhas/${encodeURIComponent(id ?? "")}/atividade/${activityId}`,
        )
    }

    return (
        <main className="min-h-screen bg-[#e8ebef] px-4 py-6 text-slate-900 sm:px-7 sm:py-8">
            <div className="mx-auto max-w-[1210px]">
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
                                {roadmap.modulos[0]?.titulo ?? ""}
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
                                        <span className="h-px flex-1 bg-main-blue-dark/30" />
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
                                                    className={cn(
                                                        "flex w-full",
                                                        ZIGZAG[
                                                            index %
                                                                ZIGZAG.length
                                                        ],
                                                    )}
                                                >
                                                    <ActivityNode
                                                        title={atividade.titulo}
                                                        purpose={toActivityPurpose(
                                                            atividade.contexto_avaliacao,
                                                        )}
                                                        status={toActivityStatus(
                                                            atividade.status,
                                                        )}
                                                        onClick={() =>
                                                            handleActivityClick(
                                                                atividade.id,
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
