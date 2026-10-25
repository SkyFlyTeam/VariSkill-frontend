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
import { TrackRecommendationCard } from "@/components/shared/TrackRecommendationCard"
import { UserLevelBar } from "@/components/shared/UserLevelBar/UserLevelBar"
import { useAuth } from "@/contexts/authContext"
import { InfoCard } from "@/pages/Home/components/InfoCard"
import { TrackSearch } from "@/pages/Home/components/TrackSearch"
import { api } from "@/services/api"
import { matchesTrackSearch } from "@/utils/trackSearch"

type TrilhaItem = {
    id: string
    titulo: string
    descricao: string
    habilidade: string
    total_modulos: number
    total_atividades: number
}

type TrilhaRecomendada = TrilhaItem & {
    criterio: "PERFIL_SIMILAR" | "POPULARIDADE" | "CATALOGO"
    motivo: string
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
    const [recomendadas, setRecomendadas] = useState<TrilhaRecomendada[]>([])
    const [trilhaProgresso, setTrilhaProgresso] = useState<Record<string, number>>({})
    const [modulosConcluidos, setModulosConcluidos] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)
    const [enrollingTrackId, setEnrollingTrackId] = useState<string | null>(null)
    const [busca, setBusca] = useState("")

    useEffect(() => {
        // Atualiza perfil (XP e streak) ao entrar na Home
        api<typeof user>("/users/me/").then((me) => {
            if (me) updateUser(me)
        }).catch(() => {})

        Promise.all([
            api<TrilhaItem[]>("/trilhas/").catch(() => []),
            api<MatriculaItem[]>("/matriculas/").catch(() => []),
            api<TrilhaRecomendada[]>("/trilhas/recomendadas/?limite=3").catch(
                () => [],
            ),
        ])
            .then(async ([trilhasData, matriculasData, recomendadasData]) => {
                setTrilhas(trilhasData)
                setRecomendadas(recomendadasData)
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
        setEnrollingTrackId(trilhaId)
        try {
            await api("/matriculas/", {
                method: "POST",
                body: JSON.stringify({ trilha_id: trilhaId }),
            })
        } catch {
            // Se já matriculado ou erro, continua navegação
        } finally {
            setEnrollingTrackId(null)
            navigate(`/trilhas/${encodeURIComponent(trilhaId)}`)
        }
    }

    const matriculadasIds = new Set(matriculas.map((m) => m.trilha_id))
    const trilhasDisponiveis = trilhas.filter((t) => !matriculadasIds.has(t.id))
    const buscando = busca.trim().length > 0
    const trilhasPorId = new Map(trilhas.map((t) => [t.id, t]))
    const matriculasFiltradas = matriculas.filter((m) => {
        const trilha = trilhasPorId.get(m.trilha_id)
        return matchesTrackSearch(
            busca,
            m.trilha_titulo,
            trilha?.habilidade,
            trilha?.descricao,
        )
    })
    const disponiveisFiltradas = trilhasDisponiveis.filter((t) =>
        matchesTrackSearch(busca, t.titulo, t.habilidade, t.descricao),
    )
    const semResultados =
        buscando &&
        matriculasFiltradas.length === 0 &&
        disponiveisFiltradas.length === 0
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
            <div className="mx-auto flex max-w-[1210px] flex-col gap-8">
                <header className="flex flex-col gap-4">
                    <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                        Olá, {user?.nome || user?.apelido || "Estudante"}!
                    </h1>

                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                        <UserLevelBar className="flex flex-col justify-center" />

                        <section
                            aria-label="Resumo do seu progresso"
                            className="flex gap-3 overflow-x-auto px-0.5 pb-2 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-2 xl:grid-cols-4"
                        >
                            {infoCards.map((card) => (
                                <div
                                    key={card.label}
                                    className="grid min-w-[92px] flex-1 sm:min-w-0"
                                >
                                    <InfoCard {...card} />
                                </div>
                            ))}
                        </section>
                    </div>
                </header>

                {!buscando && recomendadas.length > 0 && (
                    <section aria-label="Recomendação de trilha">
                        <h2 className="mb-4 text-lg font-bold">Recomendado para você</h2>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {recomendadas.map((trilha) => (
                                <TrackRecommendationCard
                                    key={trilha.id}
                                    id={trilha.id}
                                    title={trilha.titulo}
                                    skill={trilha.habilidade}
                                    reason={trilha.motivo}
                                    totalModules={trilha.total_modulos}
                                    loading={enrollingTrackId === trilha.id}
                                    onStartTrack={handleStartTrack}
                                />
                            ))}
                        </div>
                    </section>
                )}

                <section
                    aria-labelledby="trilhas-titulo"
                    className="mb-4 rounded-3xl border border-slate-200 bg-[#f4f6f8] p-4 sm:p-6"
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 id="trilhas-titulo" className="text-lg font-bold">
                            Trilhas
                        </h2>
                        <div role="search" aria-label="Busca de trilhas" className="w-full sm:max-w-sm">
                            <TrackSearch value={busca} onChange={setBusca} />
                        </div>
                    </div>

                    {semResultados && (
                        <p
                            role="status"
                            className="mt-5 rounded-xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm"
                        >
                            Nenhuma trilha encontrada para "{busca.trim()}".
                        </p>
                    )}

                    <div className="mt-5 flex flex-col gap-6 [&>section+section]:border-t [&>section+section]:border-slate-200 [&>section+section]:pt-6">
                        {!(buscando && matriculasFiltradas.length === 0) && (
                            <section>
                                <h3 className="mb-3 text-base font-bold">Minhas trilhas</h3>
                                {matriculas.length === 0 ? (
                                    <div className="rounded-xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
                                        {loading
                                            ? "Carregando suas trilhas..."
                                            : "Você ainda não iniciou nenhuma trilha. Escolha uma abaixo para começar!"}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {matriculasFiltradas.map((mat) => {
                                            const trilhaInfo = trilhasPorId.get(
                                                mat.trilha_id,
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
                        )}

                        {!(buscando && disponiveisFiltradas.length === 0) && (
                            <section>
                                <h3 className="mb-3 text-base font-bold">
                                    Trilhas disponíveis
                                </h3>
                                {disponiveisFiltradas.length === 0 ? (
                                    <div className="rounded-xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
                                        {loading
                                            ? "Carregando trilhas..."
                                            : "Você já está matriculado em todas as trilhas disponíveis!"}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {disponiveisFiltradas.map((track) => (
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
                        )}
                    </div>
                </section>
            </div>
        </main>
    )
}
