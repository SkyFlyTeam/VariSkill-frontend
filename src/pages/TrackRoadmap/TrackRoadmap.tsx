import { Link } from "react-router-dom"

// Destino provisório até a implementação da tela de Roadmap da trilha.
export function TrackRoadmapPage() {
    return (
        <main className="min-h-screen bg-[#e8ebef] px-4 py-6 text-slate-900 sm:px-7 sm:py-8">
            <div className="mx-auto max-w-[1210px]">
                <Link
                    to="/"
                    className="rounded text-sm font-medium text-sky-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700"
                >
                    Voltar às trilhas
                </Link>
                <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
                    <h1 className="text-xl font-bold">Roadmap da trilha</h1>
                    <p className="mt-3 text-sm text-slate-600">
                        O conteúdo desta trilha estará disponível em breve.
                    </p>
                </section>
            </div>
        </main>
    )
}
