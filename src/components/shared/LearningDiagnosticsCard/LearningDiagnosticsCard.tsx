import { useCallback, useEffect, useState } from "react"

import { useNavigate } from "react-router-dom"

import {
    ArrowRight,
    Check,
    CircleCheck,
    Dumbbell,
    MessageCircle,
    RotateCcw,
    ScanSearch,
    Target,
} from "lucide-react"

import neutralVari from "@/assets/vari/neutralVari.svg"
import { cn } from "@/lib/utils"
import {
    type LearningDiagnostics,
    type PracticeTopic,
    userService,
} from "@/services/userService"

type LoadState =
    | { status: "loading" }
    | { status: "error" }
    | { status: "ready"; data: LearningDiagnostics }

const percentFormat = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
})

const cardClass =
    "w-full max-w-4xl rounded-3xl bg-white px-6 py-8 sm:px-10 sm:py-9"

/**
 * A memória pedagógica (VAR-118) guarda os tópicos como `{ topico, ... }`;
 * o contrato da VAR-126 promete strings. Aceita os dois formatos.
 */
function topicNames(items: unknown): string[] {
    if (!Array.isArray(items)) return []
    return items
        .map((item) =>
            typeof item === "string"
                ? item
                : item && typeof item === "object" && "topico" in item
                  ? String((item as { topico: unknown }).topico)
                  : "",
        )
        .filter((name) => name.trim().length > 0)
}

function formatDate(isoDate: string | null) {
    if (!isoDate) return null
    const date = new Date(isoDate)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
}

/**
 * Começa com "Quero revisar <tópico>": é como o corpus do chat indexa a revisão
 * de cada módulo, então o Vari reconhece a pergunta mesmo sem IA externa.
 */
function studyTipPrompt(topic: string) {
    return `Quero revisar ${topic}. Me dá uma dica de estudo?`
}

function CardHeader({
    subtitle,
    updatedAt,
}: {
    subtitle: string
    updatedAt?: string | null
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex items-center gap-3 sm:gap-3.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 sm:size-11">
                    <ScanSearch
                        aria-hidden="true"
                        className="size-5 text-brand-navy"
                    />
                </div>
                <div className="flex flex-col gap-0.5">
                    <h2
                        id="raio-x-title"
                        className="text-[15px] font-bold sm:text-base"
                    >
                        Meu Raio-X de Aprendizado
                    </h2>
                    <p className="text-xs text-gray-600">{subtitle}</p>
                </div>
            </div>
            {updatedAt && (
                <span className="text-[11px] font-medium text-gray-600">
                    Atualizado em {updatedAt}
                </span>
            )}
        </div>
    )
}

function LoadingState() {
    const skeleton = "animate-pulse bg-slate-200 motion-reduce:animate-none"

    return (
        <section
            aria-labelledby="raio-x-title"
            aria-busy="true"
            className={cn(cardClass, "flex flex-col gap-6")}
        >
            <CardHeader subtitle="Analisando suas atividades..." />
            <div
                data-testid="raio-x-skeleton"
                className="grid gap-8 sm:grid-cols-2"
            >
                <div className="flex flex-col gap-3">
                    <div className={cn(skeleton, "h-4 w-44 rounded-md")} />
                    <div className="flex gap-2">
                        <div
                            className={cn(skeleton, "h-8.5 w-36 rounded-full")}
                        />
                        <div
                            className={cn(skeleton, "h-8.5 w-28 rounded-full")}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <div className={cn(skeleton, "h-4 w-48 rounded-md")} />
                    <div className={cn(skeleton, "h-12 rounded-xl")} />
                </div>
            </div>
        </section>
    )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <section
            aria-labelledby="raio-x-title"
            className={cn(
                cardClass,
                "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
            )}
        >
            <div className="flex flex-col gap-1.5">
                <h2 id="raio-x-title" className="text-base font-bold">
                    Meu Raio-X de Aprendizado
                </h2>
                <p className="text-[13px] text-gray-600">
                    Não foi possível carregar seu raio-x agora.
                </p>
            </div>
            <button
                type="button"
                onClick={onRetry}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 self-start rounded-[10px] border border-brand-navy bg-white px-4 text-xs font-bold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white sm:self-auto"
            >
                <RotateCcw aria-hidden="true" className="size-3.5" />
                Tentar de novo
            </button>
        </section>
    )
}

function EmptyState({ totalActivities }: { totalActivities: number }) {
    const navigate = useNavigate()
    const isNewStudent = totalActivities === 0

    return (
        <section
            aria-labelledby="raio-x-title"
            className={cn(
                cardClass,
                "flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:gap-7 sm:text-left",
            )}
        >
            <img
                src={neutralVari}
                alt=""
                aria-hidden="true"
                className="w-20 shrink-0 sm:w-24"
            />
            <div className="flex flex-col items-center gap-2.5 sm:items-start">
                <h2 id="raio-x-title" className="text-base font-bold">
                    Meu Raio-X de Aprendizado
                </h2>
                <p className="text-sm font-semibold text-brand-navy">
                    {isNewStudent
                        ? "Seu raio-x ainda está em branco"
                        : "Quase lá! Continue praticando"}
                </p>
                <p className="text-[13px] leading-normal text-gray-600">
                    {isNewStudent
                        ? "Faça algumas atividades nas trilhas para o Vari descobrir seus pontos fortes e o que vale a pena praticar."
                        : `Você já fez ${totalActivities} ${totalActivities === 1 ? "atividade" : "atividades"}. Com mais algumas, o Vari consegue montar seu raio-x com segurança.`}
                </p>
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="mt-1 inline-flex min-h-10 items-center gap-1.5 rounded-[10px] bg-brand-red px-4.5 text-xs font-bold text-white transition-colors hover:bg-brand-red/90"
                >
                    {isNewStudent
                        ? "Ir para as trilhas"
                        : "Continuar estudando"}
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                </button>
            </div>
        </section>
    )
}

function ReadyState({ data }: { data: LearningDiagnostics }) {
    const navigate = useNavigate()
    const strengths = topicNames(data.pontos_fortes)
    const focusTopics = topicNames(data.topicos_dificuldade)
    const practiceByTopic = new Map(
        data.topicos_praticar.map((practice) => [practice.topico, practice]),
    )
    const total = data.total_atividades_avaliadas

    if (strengths.length === 0 && focusTopics.length === 0) {
        return <EmptyState totalActivities={total} />
    }

    function askForTip(topic: string) {
        navigate("/chat", { state: { prompt: studyTipPrompt(topic) } })
    }

    function practiceAgain({ trilha_id, atividade_id }: PracticeTopic) {
        navigate(`/trilhas/${trilha_id}/atividade/${atividade_id}`, {
            state: { praticaReforco: true },
        })
    }

    return (
        <section
            aria-labelledby="raio-x-title"
            className={cn(cardClass, "flex flex-col gap-5 sm:gap-6")}
        >
            <CardHeader
                subtitle="O que o Vari percebeu nas suas atividades até agora."
                updatedAt={formatDate(data.ultima_atualizacao)}
            />

            <ul aria-label="Resumo" className="flex flex-wrap gap-2">
                <li className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700">
                    <strong className="text-brand-navy">
                        {percentFormat.format(data.taxa_acerto_geral)}%
                    </strong>{" "}
                    de acerto geral
                </li>
                <li className="rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-700">
                    <strong className="text-brand-navy">{total}</strong>{" "}
                    {total === 1
                        ? "atividade avaliada"
                        : "atividades avaliadas"}
                </li>
            </ul>

            <div className="grid gap-7 sm:grid-cols-2 sm:gap-8">
                <div className="flex flex-col gap-3">
                    <h3 className="flex items-center gap-2 text-sm font-bold">
                        <CircleCheck
                            aria-hidden="true"
                            className="size-4.5 text-emerald-700"
                        />
                        Habilidades Consolidadas
                    </h3>
                    {strengths.length > 0 ? (
                        <ul
                            aria-label="Habilidades Consolidadas"
                            className="flex flex-wrap gap-2"
                        >
                            {strengths.map((topic) => (
                                <li
                                    key={topic}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800"
                                >
                                    <Check
                                        aria-hidden="true"
                                        className="size-3.5"
                                        strokeWidth={2.6}
                                    />
                                    {topic}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-[13px] text-gray-600">
                            Continue praticando: seus pontos fortes aparecem
                            aqui.
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <h3 className="flex items-center gap-2 text-sm font-bold">
                        <Target
                            aria-hidden="true"
                            className="size-4.5 text-amber-700"
                        />
                        Tópicos em Foco · A Praticar
                    </h3>
                    {focusTopics.length > 0 ? (
                        <ul
                            aria-label="Tópicos em Foco"
                            className="flex flex-col gap-2"
                        >
                            {focusTopics.map((topic) => {
                                const practice = practiceByTopic.get(topic)
                                return (
                                    <li
                                        key={topic}
                                        className="flex flex-col gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3"
                                    >
                                        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-amber-900">
                                            <Target
                                                aria-hidden="true"
                                                className="size-3.5 shrink-0"
                                            />
                                            {topic}
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {practice && (
                                                <button
                                                    type="button"
                                                    aria-label={`Praticar de novo ${topic}`}
                                                    onClick={() =>
                                                        practiceAgain(practice)
                                                    }
                                                    className="inline-flex min-h-10 flex-1 basis-32 items-center justify-center gap-1.5 rounded-[10px] border border-brand-navy bg-brand-navy px-3 text-xs font-bold text-white transition-colors hover:bg-brand-navy/90"
                                                >
                                                    <Dumbbell
                                                        aria-hidden="true"
                                                        className="size-3.5 shrink-0"
                                                    />
                                                    Praticar de novo
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                aria-label={`Pedir dica de estudo ao Vari sobre ${topic}`}
                                                onClick={() => askForTip(topic)}
                                                className="inline-flex min-h-10 flex-1 basis-48 items-center justify-center gap-1.5 rounded-[10px] border border-brand-navy bg-white px-3 text-xs font-bold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
                                            >
                                                <MessageCircle
                                                    aria-hidden="true"
                                                    className="size-3.5 shrink-0"
                                                />
                                                Pedir dica de estudo ao Vari
                                            </button>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    ) : (
                        <p className="text-[13px] text-gray-600">
                            Nenhum tópico em foco no momento. Mandou bem!
                        </p>
                    )}
                </div>
            </div>
        </section>
    )
}

/** Card "Meu Raio-X de Aprendizado" (VAR-120), exibido na tela de Perfil. */
export function LearningDiagnosticsCard() {
    const [state, setState] = useState<LoadState>({ status: "loading" })
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        let active = true
        userService
            .getLearningDiagnostics()
            .then((data) => {
                if (active) setState({ status: "ready", data })
            })
            .catch(() => {
                if (active) setState({ status: "error" })
            })
        return () => {
            active = false
        }
    }, [attempt])

    const retry = useCallback(() => {
        setState({ status: "loading" })
        setAttempt((current) => current + 1)
    }, [])

    if (state.status === "loading") return <LoadingState />
    if (state.status === "error") return <ErrorState onRetry={retry} />
    return <ReadyState data={state.data} />
}
