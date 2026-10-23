import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { ChatComposer } from "@/pages/Chat/components/ChatComposer"
import { ChatHeader } from "@/pages/Chat/components/ChatHeader"
import {
    type ChatAction,
    type ChatMessage,
    type ChatTrack,
    MessageBubble,
} from "@/pages/Chat/components/MessageBubble"
import { QuickChips } from "@/pages/Chat/components/QuickChips"
import {
    type ReforcoPedagogico,
    ReinforcementBanner,
} from "@/pages/Chat/components/ReinforcementBanner"
import { api } from "@/services/api"

type SessaoResponse = {
    sessao_id: string
    mensagem_inicial?: {
        id: string
        remetente: string
        conteudo: string
        sugestoes_rapidas?: string[]
        reforco_pedagogico?: ReforcoPedagogico | null
        criada_em: string
    }
}

type EnviarMensagemResponse = {
    resposta_assistente: {
        id: string
        remetente: string
        conteudo: string
        intencao_detectada: string | null
        opcoes_trilhas?: ChatTrack[]
        sugestoes_rapidas?: string[]
        acao?: string | null
        redirecionar_para?: string | null
        dados_acao?: {
            trilha_id?: string
            atividade_id?: string
            [chave: string]: unknown
        } | null
        reforco_pedagogico?: ReforcoPedagogico | null
        criada_em: string
    }
}

// Rótulo do botão para as ações de sistema que levam o estudante a outra tela.
const ROTULOS_ACAO: Record<string, string> = {
    INICIAR_TESTE_DIAGNOSTICO: "Iniciar teste de nivelamento",
    INICIAR_DO_INICIO: "Começar primeira atividade",
    MATRICULA_EXISTENTE: "Ir para a trilha",
    PROXIMA_ATIVIDADE: "Ir para a próxima atividade",
}

function rotaDaAcao(
    resposta: EnviarMensagemResponse["resposta_assistente"],
): string | undefined {
    if (resposta.redirecionar_para) return resposta.redirecionar_para

    // PROXIMA_ATIVIDADE pode vir só com os ids em dados_acao.
    const trilhaId = resposta.dados_acao?.trilha_id
    const atividadeId = resposta.dados_acao?.atividade_id
    if (resposta.acao === "PROXIMA_ATIVIDADE" && trilhaId && atividadeId) {
        return `/trilhas/${encodeURIComponent(trilhaId)}/atividade/${encodeURIComponent(atividadeId)}`
    }
    return undefined
}

function acaoDaResposta(
    resposta: EnviarMensagemResponse["resposta_assistente"],
): ChatAction | undefined {
    const href = rotaDaAcao(resposta)
    if (!href) return undefined
    return {
        label: ROTULOS_ACAO[resposta.acao ?? ""] ?? "Continuar",
        href,
    }
}

// Trilhas recomendadas viram chips "Iniciar trilha" que matriculam direto. Exceção: quando a Vari
// pede para escolher a trilha de um fluxo (nivelamento, começar do zero), os chips do backend
// carregam essa escolha e são mantidos.
function opcoesDaResposta(
    resposta: EnviarMensagemResponse["resposta_assistente"],
): Pick<ChatMessage, "tracks" | "suggestions"> {
    const tracks = resposta.opcoes_trilhas ?? []
    if (tracks.length === 0 || resposta.acao === "SELECIONAR_TRILHA") {
        return { suggestions: resposta.sugestoes_rapidas }
    }
    // Remove as sugestões que repetem uma trilha já oferecida como chip "Iniciar trilha".
    const suggestions = resposta.sugestoes_rapidas?.filter(
        (sugestao) => !tracks.some((t) => sugestao.includes(t.titulo)),
    )
    return {
        tracks: tracks.map(({ id, titulo }) => ({ id, titulo })),
        suggestions,
    }
}

export function ChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [sessaoId, setSessaoId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [reforco, setReforco] = useState<ReforcoPedagogico | null>(null)
    const [startingTrackId, setStartingTrackId] = useState<string | null>(null)
    const bottomRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const location = useLocation()

    // Volta para a tela anterior; se o chat foi aberto direto (sem histórico), vai para a home.
    function handleBack() {
        if (location.key === "default") {
            navigate("/", { replace: true })
        } else {
            navigate(-1)
        }
    }

    useEffect(() => {
        let active = true

        api<SessaoResponse>("/chat/sessao/iniciar/", { method: "POST" })
            .then((sessao) => {
                if (!active) return
                setSessaoId(sessao.sessao_id)
                setReforco(sessao.mensagem_inicial?.reforco_pedagogico ?? null)
                setMessages([
                    {
                        id: sessao.mensagem_inicial?.id ?? "assistant-initial",
                        content:
                            sessao.mensagem_inicial?.conteudo ||
                            "Olá! Sou a Vari, sua assistente virtual no VariSkill. Como posso te ajudar hoje?",
                        sender: "assistant",
                        suggestions: sessao.mensagem_inicial?.sugestoes_rapidas,
                    },
                ])
            })
            .catch(() => {
                if (!active) return
                setMessages([
                    {
                        id: "assistant-fallback",
                        content:
                            "Olá! Não foi possível conectar com o assistente no momento. Tente novamente mais tarde.",
                        sender: "assistant",
                    },
                ])
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [])

    useEffect(() => {
        bottomRef.current?.scrollIntoView?.({ behavior: "smooth" })
    }, [messages, sending])

    async function handleSend(content: string) {
        setMessages((curr) => [
            ...curr,
            { id: `user-${Date.now()}`, content, sender: "user" },
        ])

        if (!sessaoId) {
            setMessages((curr) => [
                ...curr,
                {
                    id: `assistant-err-${Date.now()}`,
                    content:
                        "Não consegui iniciar a conversa com o assistente. Recarregue a página e tente novamente.",
                    sender: "assistant",
                },
            ])
            return
        }

        setSending(true)
        try {
            const { resposta_assistente: resposta } =
                await api<EnviarMensagemResponse>(
                    `/chat/sessao/${encodeURIComponent(sessaoId)}/mensagem/`,
                    {
                        method: "POST",
                        body: JSON.stringify({ conteudo: content }),
                    },
                )

            // Cada resposta traz o estado atual do reforço; ausente = backend sem o campo.
            if (resposta.reforco_pedagogico !== undefined) {
                setReforco(resposta.reforco_pedagogico)
            }
            setMessages((curr) => [
                ...curr,
                {
                    id: resposta.id ?? `assistant-${Date.now()}`,
                    content:
                        resposta.conteudo ||
                        "Desculpe, não consegui entender. Pode reformular a pergunta?",
                    sender: "assistant",
                    ...opcoesDaResposta(resposta),
                    action: acaoDaResposta(resposta),
                },
            ])
        } catch {
            setMessages((curr) => [
                ...curr,
                {
                    id: `assistant-err-${Date.now()}`,
                    content: "Ops, ocorreu um erro ao processar sua mensagem.",
                    sender: "assistant",
                },
            ])
        } finally {
            setSending(false)
        }
    }

    // Mesmo comportamento do card de recomendação (VAR-99): matricula e abre a trilha;
    // se já houver matrícula ou a API falhar, abre a trilha do mesmo jeito.
    async function handleStartTrack(track: ChatTrack) {
        setStartingTrackId(track.id)
        try {
            await api("/matriculas/", {
                method: "POST",
                body: JSON.stringify({ trilha_id: track.id }),
            })
        } catch {
            // Já matriculado ou erro: segue para a trilha.
        } finally {
            setStartingTrackId(null)
            navigate(`/trilhas/${encodeURIComponent(track.id)}`)
        }
    }

    const busy = loading || sending
    // Só as opções da última resposta da Vari; somem enquanto a próxima não chega.
    const lastMessage = messages.at(-1)
    const lastAssistant =
        lastMessage?.sender === "assistant" ? lastMessage : undefined

    return (
        <main className="flex h-[calc(100svh-2.75rem)] min-h-0 flex-col overflow-hidden bg-[#e8ebef] px-3 py-5 text-slate-900 sm:h-svh sm:px-10 sm:py-6">
            <div className="mx-auto flex min-h-0 w-full flex-1 flex-col gap-5">
                <ChatHeader
                    assistantName="Vari"
                    onBack={handleBack}
                    status={
                        loading
                            ? "conectando..."
                            : sending
                              ? "digitando..."
                              : "online agora"
                    }
                />

                {reforco && <ReinforcementBanner reforco={reforco} />}

                <section
                    aria-label="Conversa com Vari"
                    className="min-h-0 flex-1 overflow-y-auto px-1 py-8 sm:px-3 sm:py-12"
                >
                    <div className="flex flex-col gap-8">
                        {messages.map((message) => (
                            <MessageBubble key={message.id} message={message} />
                        ))}
                        <div ref={bottomRef} />
                    </div>
                </section>

                <div className="flex shrink-0 flex-col gap-3">
                    <QuickChips
                        chips={lastAssistant?.suggestions ?? []}
                        action={lastAssistant?.action}
                        tracks={lastAssistant?.tracks}
                        onStartTrack={handleStartTrack}
                        startingTrackId={startingTrackId}
                        onSelect={handleSend}
                        disabled={busy}
                    />
                    <ChatComposer onSend={handleSend} disabled={busy} />
                </div>
            </div>
        </main>
    )
}
