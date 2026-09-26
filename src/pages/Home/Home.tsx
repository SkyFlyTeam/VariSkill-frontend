import {
    CodeXml,
    Flame,
    FlaskConical,
    ListChecks,
    RefreshCw,
    Trophy,
} from "lucide-react"

import { TrackCard } from "@/components/shared/TrackCard/TrackCard"
import { InfoCard } from "@/pages/Home/components/InfoCard"

const infoCards = [
    {
        label: "Streak",
        value: "123",
        description: "dias consecutivos",
        icon: Flame,
        color: "text-orange-500",
    },
    {
        label: "XP",
        value: "4.567",
        description: "total",
        icon: FlaskConical,
        color: "text-violet-700",
    },
    {
        label: "Conquistas",
        value: "56",
        description: "ganhas",
        icon: Trophy,
        color: "text-amber-400",
    },
    {
        label: "Em andamento",
        value: "40",
        description: "trilhas",
        icon: RefreshCw,
        color: "text-sky-600",
    },
    {
        label: "Concluídas",
        value: "12",
        description: "trilhas",
        icon: ListChecks,
        color: "text-emerald-600",
    },
] as const

// Dados de demonstração até a integração com a API de trilhas.
const enrolledTracks = Array.from({ length: 6 }, (_, index) => ({
    id: `javascript-${index + 1}`,
    title: "Javascript",
    totalModules: 12,
    completedModules: 10,
}))
const availableTracks = Array.from({ length: 6 }, (_, index) => ({
    id: `react-${index + 1}`,
    title: "React",
    totalModules: 52,
}))

export function HomePage() {
    return (
        <main className="min-h-screen bg-[#e8ebef] px-4 py-6 text-slate-900 sm:px-7 sm:py-8">
            <div className="mx-auto max-w-[1210px]">
                <header className="mb-6">
                    <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                        Olá, Joe Doe!
                    </h1>
                </header>

                <section
                    aria-label="Resumo do seu progresso"
                    className="flex gap-3 overflow-x-auto px-0.5 pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-5"
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
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {enrolledTracks.map((track) => (
                            <TrackCard
                                key={track.id}
                                {...track}
                                variant="in-progress"
                                category="Tecnologia"
                                image={
                                    <CodeXml
                                        aria-hidden="true"
                                        className="size-8 stroke-[2.5]"
                                    />
                                }
                            />
                        ))}
                    </div>
                </section>

                <section className="mt-8 pb-4">
                    <h2 className="mb-4 text-lg font-bold">
                        Trilhas disponíveis
                    </h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {availableTracks.map((track) => (
                            <TrackCard
                                key={track.id}
                                {...track}
                                variant="available"
                                category="Tecnologia"
                                image={
                                    <img
                                        src="https://thumb.wikimedia.org/wikipedia/commons/thumb/3/30/React_Logo_SVG.svg/1280px-React_Logo_SVG.svg.png?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=thumbnail"
                                        alt=""
                                        className="size-8"
                                    />
                                }
                            />
                        ))}
                    </div>
                </section>
            </div>
        </main>
    )
}
