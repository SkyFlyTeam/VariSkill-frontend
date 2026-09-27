import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    CodeXml,
    Flame,
    FlaskConical,
    ListChecks,
    RefreshCw,
} from "lucide-react"

import { TrackCard } from "@/components/shared/TrackCard/TrackCard"
import { useAuth } from "@/contexts/authContext"
import { InfoCard } from "@/pages/Home/components/InfoCard"
import { api } from "@/services/api"

type TrilhaItem = {
    id: string
    titulo: string
    descricao: string
    habilidade: string
    total_modulos: number
    total_atividades: number
}

type MatriculaItem = {
    id: string
    trilha_id: string
    trilha_titulo: string
    status: string
    modulo_atual: {
        id: string
        titulo: string
        status: string
    } | null
}

export function HomePage() {
    const { user, updateUser } = useAuth()
    const navigate = useNavigate()
    const [trilhas, setTrilhas] = useState<TrilhaItem[]>([])
    const [matriculas, setMatriculas] = useState<MatriculaItem[]>([])
    const [trilhaProgresso, setTrilhaProgresso] = useState<Record<string, number>>({})
    const [modulosConcluidos, setModulosConcluidos] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Atualiza perfil (XP e streak) ao entrar na Home
        api<typeof user>("/users/me/").then((me) => {
            if (me) updateUser(me)
        }).catch(() => {})

        Promise.all([
            api<TrilhaItem[]>("/trilhas/").catch(() => []),
            api<MatriculaItem[]>("/matriculas/").catch(() => []),
        ])
            .then(async ([trilhasData, matriculasData]) => {
                setTrilhas(trilhasData)
                setMatriculas(matriculasData)

                // Busca o roadmap de cada trilha matriculada para obter a % real e módulos concluídos
                const progressMap: Record<string, number> = {}
                const modulosMap: Record<string, number> = {}
                await Promise.all(
                    matriculasData.map(async (m) => {
                        try {
                            const roadmap = await api<{
                                percentual_conclusao: number
                                modulos: Array<{ status: string }>
                            }>(`/trilhas/${m.trilha_id}/roadmap/`)
                            progressMap[m.trilha_id] = roadmap.percentual_conclusao ?? 0
                            modulosMap[m.trilha_id] = (roadmap.modulos ?? []).filter(
                                (mod) => mod.status === "CONCLUIDO",
                            ).length
                        } catch {
                            progressMap[m.trilha_id] = 0
                            modulosMap[m.trilha_id] = 0
                        }
                    }),
                )
                setTrilhaProgresso(progressMap)
                setModulosConcluidos(modulosMap)
            })
            .finally(() => setLoading(false))
    }, [])

    async function handleStartTrack(trilhaId: string) {
        try {
            await api("/matriculas/", {
                method: "POST",
                body: JSON.stringify({ trilha_id: trilhaId }),
            })
        } catch {
            // Se já matriculado ou erro, continua navegação
        }
        navigate(`/trilhas/${encodeURIComponent(trilhaId)}`)
    }

    const matriculadasIds = new Set(matriculas.map((m) => m.trilha_id))
    const trilhasDisponiveis = trilhas.filter((t) => !matriculadasIds.has(t.id))
    const concluidasCount = matriculas.filter(
        (m) => m.status === "CONCLUIDO" || (trilhaProgresso[m.trilha_id] ?? 0) >= 100,
    ).length
    const emAndamentoCount = matriculas.filter(
        (m) => m.status === "EM_ANDAMENTO" && (trilhaProgresso[m.trilha_id] ?? 0) < 100,
    ).length

    const infoCards = [
        {
            label: "Streak",
            value: String(user?.streak_dias ?? 0),
            description: "dias consecutivos",
            icon: Flame,
            color: "text-orange-500",
        },
        {
            label: "XP",
            value: Number(user?.xp_total ?? 0).toLocaleString("pt-BR"),
            description: "total",
            icon: FlaskConical,
            color: "text-violet-700",
        },
        {
            label: "Em andamento",
            value: String(emAndamentoCount),
            description: "trilhas",
            icon: RefreshCw,
            color: "text-sky-600",
        },
        {
            label: "Concluídas",
            value: String(concluidasCount),
            description: "trilhas",
            icon: ListChecks,
            color: "text-emerald-600",
        },
    ]

    return (
        <main className="min-h-screen bg-[#e8ebef] px-4 py-6 text-slate-900 sm:px-7 sm:py-8">
            <div className="mx-auto max-w-[1210px]">
                <header className="mb-6">
                    <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                        Olá, {user?.nome || user?.apelido || "Estudante"}!
                    </h1>
                </header>

                <section
                    aria-label="Resumo do seu progresso"
                    className="flex gap-3 overflow-x-auto px-0.5 pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4"
                >
                    {infoCards.map((card) => (
                        <div
                            key={card.label}
                            className="min-w-[92px] flex-1 sm:min-w-0"
                        >
                            <InfoCard {...card} />
                        </div>
                    ))}
                </section>

                <section className="mt-7">
                    <div className="mb-4 flex items-center gap-2">
                        <h2 className="text-lg font-bold">Minhas trilhas</h2>
                    </div>
                    {matriculas.length === 0 ? (
                        <div className="rounded-xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
                            {loading
                                ? "Carregando suas trilhas..."
                                : "Você ainda não iniciou nenhuma trilha. Escolha uma abaixo para começar!"}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {matriculas.map((mat) => {
                                const trilhaInfo = trilhas.find(
                                    (t) => t.id === mat.trilha_id,
                                )
                                return (
                                    <TrackCard
                                        key={mat.id}
                                        id={mat.trilha_id}
                                        title={mat.trilha_titulo}
                                        variant="in-progress"
                                        category={
                                            trilhaInfo?.habilidade || "Geral"
                                        }
                                        totalModules={
                                            trilhaInfo?.total_modulos || 1
                                        }
                                        completedModules={
                                            modulosConcluidos[mat.trilha_id] ?? 0
                                        }
                                        progressPercent={
                                            trilhaProgresso[mat.trilha_id] ?? 0
                                        }
                                        image={
                                            <CodeXml
                                                aria-hidden="true"
                                                className="size-8 stroke-[2.5]"
                                            />
                                        }
                                    />
                                )
                            })}
                        </div>
                    )}
                </section>

                <section className="mt-8 pb-4">
                    <h2 className="mb-4 text-lg font-bold">
                        Trilhas disponíveis
                    </h2>
                    {trilhasDisponiveis.length === 0 ? (
                        <div className="rounded-xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
                            {loading
                                ? "Carregando trilhas..."
                                : "Você já está matriculado em todas as trilhas disponíveis!"}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {trilhasDisponiveis.map((track) => (
                                <TrackCard
                                    key={track.id}
                                    id={track.id}
                                    title={track.titulo}
                                    variant="available"
                                    category={track.habilidade}
                                    totalModules={track.total_modulos}
                                    onStart={() => handleStartTrack(track.id)}
                                    image={
                                        <CodeXml
                                            aria-hidden="true"
                                            className="size-8 stroke-[2.5]"
                                        />
                                    }
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    )
}
