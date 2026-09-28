import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { ChatComposer } from "@/pages/Chat/components/ChatComposer"
import { ChatHeader } from "@/pages/Chat/components/ChatHeader"
import {
    type ChatAction,
    type ChatMessage,
    type ChatOption,
    MessageBubble,
} from "@/pages/Chat/components/MessageBubble"
import { api } from "@/services/api"

type SessaoResponse = {
    sessao_id: string
    mensagem_inicial?: {
        id: string
        remetente: string
        conteudo: string
        sugestoes_rapidas?: string[]
        criada_em: string
    }
}

type EnviarMensagemResponse = {
    resposta_assistente: {
        id: string
        remetente: string
        conteudo: string
        intencao_detectada: string | null
        opcoes_trilhas?: (ChatOption & { habilidade: string })[]
        sugestoes_rapidas?: string[]
        acao?: string | null
        redirecionar_para?: string | null
        criada_em: string
    }
}

// Rótulo do botão para as ações de sistema que levam o estudante a outra tela.
const ROTULOS_ACAO: Record<string, string> = {
    INICIAR_TESTE_DIAGNOSTICO: "Iniciar teste de nivelamento",
    INICIAR_DO_INICIO: "Começar primeira atividade",
    MATRICULA_EXISTENTE: "Ir para a trilha",
}

function acaoDaResposta(
    resposta: EnviarMensagemResponse["resposta_assistente"],
): ChatAction | undefined {
    if (!resposta.redirecionar_para) return undefined
    return {
        label: ROTULOS_ACAO[resposta.acao ?? ""] ?? "Continuar",
        href: resposta.redirecionar_para,
    }
}

export function ChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [sessaoId, setSessaoId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
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

            setMessages((curr) => [
                ...curr,
                {
                    id: resposta.id ?? `assistant-${Date.now()}`,
                    content:
                        resposta.conteudo ||
                        "Desculpe, não consegui entender. Pode reformular a pergunta?",
                    sender: "assistant",
                    options: resposta.opcoes_trilhas,
                    suggestions: resposta.sugestoes_rapidas,
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

    const busy = loading || sending

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

                <section
                    aria-label="Conversa com Vari"
                    className="min-h-0 flex-1 overflow-y-auto px-1 py-8 sm:px-3 sm:py-12"
                >
                    <div className="flex flex-col gap-8">
                        {messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                onSuggestionClick={
                                    busy ? undefined : handleSend
                                }
                            />
                        ))}
                        <div ref={bottomRef} />
                    </div>
                </section>

                <div className="shrink-0">
                    <ChatComposer onSend={handleSend} disabled={busy} />
                </div>
            </div>
        </main>
    )
}
