import { MemoryRouter, Route, Routes } from "react-router-dom"

import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { ChatPage } from "@/pages/Chat/Chat"
import { api } from "@/services/api"

jest.mock("@/services/api", () => ({
    api: jest.fn(),
}))

const mockedApi = api as jest.MockedFunction<typeof api>

const SESSAO = {
    sessao_id: "sessao-1",
    mensagem_inicial: {
        id: "msg-1",
        remetente: "ASSISTENTE",
        conteudo: "Olá, Eric! Seja muito bem-vindo ao VariSkill!",
        sugestoes_rapidas: ["Ver trilhas disponíveis"],
        criada_em: "2026-09-27T12:00:00Z",
    },
}

const RESPOSTA = {
    resposta_assistente: {
        id: "msg-2",
        remetente: "ASSISTENTE",
        conteudo: "Estas são as trilhas disponíveis:",
        intencao_detectada: "LISTAR_TRILHAS",
        opcoes_trilhas: [
            { id: "trilha-1", titulo: "Javascript", habilidade: "Frontend" },
        ],
        sugestoes_rapidas: ["Quero me matricular na trilha Javascript"],
        criada_em: "2026-09-27T12:00:01Z",
    },
}

function renderPage() {
    return render(
        <MemoryRouter>
            <ChatPage />
        </MemoryRouter>,
    )
}

describe("ChatPage", () => {
    beforeEach(() => {
        mockedApi.mockReset()
    })

    it("deve voltar para a tela anterior ao clicar em voltar", async () => {
        mockedApi.mockResolvedValueOnce(SESSAO)
        render(
            <MemoryRouter initialEntries={["/trilhas", "/chat"]} initialIndex={1}>
                <Routes>
                    <Route path="/trilhas" element={<p>Tela de trilhas</p>} />
                    <Route path="/chat" element={<ChatPage />} />
                </Routes>
            </MemoryRouter>,
        )

        await screen.findByText(SESSAO.mensagem_inicial.conteudo)

        const backButton = screen.getByRole("button", {
            name: "Voltar",
        })
        await userEvent.click(backButton)

        expect(screen.getByText("Tela de trilhas")).toBeInTheDocument()
    })

    it("deve renderizar a mensagem inicial e as sugestões rápidas", async () => {
        mockedApi.mockResolvedValueOnce(SESSAO)
        renderPage()

        expect(
            await screen.findByText(SESSAO.mensagem_inicial.conteudo),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: "Ver trilhas disponíveis" }),
        ).toBeInTheDocument()
    })

    it("deve exibir fallback quando a API de iniciar sessão falhar", async () => {
        mockedApi.mockRejectedValueOnce(new Error("rede fora"))
        renderPage()

        expect(
            await screen.findByText(
                "Olá! Não foi possível conectar com o assistente no momento. Tente novamente mais tarde.",
            ),
        ).toBeInTheDocument()
    })

    it("não deve enviar mensagem com campo vazio", async () => {
        const user = userEvent.setup()
        mockedApi.mockResolvedValueOnce(SESSAO)
        renderPage()

        await screen.findByText(SESSAO.mensagem_inicial.conteudo)

        await user.click(
            screen.getByRole("button", { name: "Enviar mensagem" }),
        )

        expect(mockedApi).toHaveBeenCalledTimes(1) // Apenas a sessão inicial
    })

    it("deve enviar a mensagem e exibir as opções da resposta apenas no rodapé", async () => {
        const user = userEvent.setup()
        mockedApi.mockResolvedValueOnce(SESSAO).mockResolvedValueOnce(RESPOSTA)
        renderPage()

        await screen.findByText(SESSAO.mensagem_inicial.conteudo)

        const messageInput = screen.getByPlaceholderText("Digite sua dúvida...")
        await user.type(messageInput, "Quais trilhas existem?")
        await user.click(
            screen.getByRole("button", { name: "Enviar mensagem" }),
        )

        expect(screen.getByText("Quais trilhas existem?")).toBeInTheDocument()
        expect(messageInput).toHaveValue("")
        expect(
            await screen.findByText(RESPOSTA.resposta_assistente.conteudo),
        ).toBeInTheDocument()
        // A trilha vira chip "Iniciar trilha" no rodapé; a sugestão repetida da mesma trilha sai.
        const rodape = screen.getByRole("group", { name: "Sugestões rápidas" })
        expect(
            within(rodape).getByRole("button", {
                name: "Iniciar trilha Javascript",
            }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole("button", {
                name: "Quero me matricular na trilha Javascript",
            }),
        ).not.toBeInTheDocument()
        expect(mockedApi).toHaveBeenLastCalledWith(
            "/chat/sessao/sessao-1/mensagem/",
            {
                method: "POST",
                body: JSON.stringify({ conteudo: "Quais trilhas existem?" }),
            },
        )
    })

    it("deve enviar a sugestão rápida como mensagem ao clicar", async () => {
        const user = userEvent.setup()
        mockedApi.mockResolvedValueOnce(SESSAO).mockResolvedValueOnce(RESPOSTA)
        renderPage()

        await user.click(
            await screen.findByRole("button", {
                name: "Ver trilhas disponíveis",
            }),
        )

        expect(
            await screen.findByText(RESPOSTA.resposta_assistente.conteudo),
        ).toBeInTheDocument()
        expect(mockedApi).toHaveBeenLastCalledWith(
            "/chat/sessao/sessao-1/mensagem/",
            {
                method: "POST",
                body: JSON.stringify({ conteudo: "Ver trilhas disponíveis" }),
            },
        )
    })

    it("deve exibir sugestões e botão de ação retornados pelo assistente", async () => {
        const user = userEvent.setup()
        mockedApi.mockResolvedValueOnce(SESSAO).mockResolvedValueOnce({
            resposta_assistente: {
                id: "msg-3",
                remetente: "ASSISTENTE",
                conteudo: "Vamos começar pelo nível básico.",
                intencao_detectada: "INICIAR_DO_ZERO",
                sugestoes_rapidas: ["Pode me dar uma dica?"],
                acao: "INICIAR_DO_INICIO",
                redirecionar_para: "/trilhas/t-1/atividade/a-1",
                criada_em: "2026-09-27T12:00:02Z",
            },
        })
        renderPage()

        await screen.findByText(SESSAO.mensagem_inicial.conteudo)
        await user.type(
            screen.getByPlaceholderText("Digite sua dúvida..."),
            "Quero começar do zero",
        )
        await user.click(
            screen.getByRole("button", { name: "Enviar mensagem" }),
        )

        const acao = await screen.findByRole("button", {
            name: "Começar primeira atividade",
        })
        const rodape = screen.getByRole("group", { name: "Sugestões rápidas" })
        // Ação e sugestões ficam juntas no rodapé, com a ação em primeiro.
        expect(within(rodape).getAllByRole("button")[0]).toBe(acao)
        expect(
            within(rodape).getByRole("button", {
                name: "Pode me dar uma dica?",
            }),
        ).toBeInTheDocument()
    })

    describe("quick chips", () => {
        it("deve exibir no rodapé apenas as sugestões da última resposta", async () => {
            const user = userEvent.setup()
            mockedApi.mockResolvedValueOnce(SESSAO).mockResolvedValueOnce({
                resposta_assistente: {
                    ...RESPOSTA.resposta_assistente,
                    sugestoes_rapidas: ["Quero me matricular"],
                },
            })
            renderPage()

            const chips = await screen.findByRole("group", {
                name: "Sugestões rápidas",
            })
            await user.click(
                within(chips).getByRole("button", {
                    name: "Ver trilhas disponíveis",
                }),
            )

            const novosChips = await screen.findByRole("button", {
                name: "Quero me matricular",
            })
            expect(
                screen.getByRole("group", { name: "Sugestões rápidas" }),
            ).toContainElement(novosChips)
            expect(
                screen.queryByRole("button", {
                    name: "Ver trilhas disponíveis",
                }),
            ).not.toBeInTheDocument()
        })

        it("deve esconder os chips enquanto aguarda a resposta", async () => {
            const user = userEvent.setup()
            mockedApi
                .mockResolvedValueOnce(SESSAO)
                .mockReturnValueOnce(new Promise(() => {}))
            renderPage()

            await user.click(
                await screen.findByRole("button", {
                    name: "Ver trilhas disponíveis",
                }),
            )

            expect(
                screen.queryByRole("group", { name: "Sugestões rápidas" }),
            ).not.toBeInTheDocument()
            expect(screen.getByText("digitando...")).toBeInTheDocument()
        })
    })

    describe("banner de reforço pedagógico", () => {
        const REFORCO = {
            modulo_id: "modulo-1",
            titulo: "Funções e Escopo",
            taxa_acerto: 33.3,
        }

        it("deve exibir o banner quando a sessão indicar reforço", async () => {
            mockedApi.mockResolvedValueOnce({
                ...SESSAO,
                mensagem_inicial: {
                    ...SESSAO.mensagem_inicial,
                    reforco_pedagogico: REFORCO,
                },
            })
            renderPage()

            const banner = await screen.findByRole("status")
            expect(banner).toHaveTextContent("Momento de reforço:")
            expect(banner).toHaveTextContent("Funções e Escopo")
            expect(banner).toHaveTextContent("33% de acertos")
        })

        it("não deve exibir o banner sem reforço", async () => {
            mockedApi.mockResolvedValueOnce({
                ...SESSAO,
                mensagem_inicial: {
                    ...SESSAO.mensagem_inicial,
                    reforco_pedagogico: null,
                },
            })
            renderPage()

            await screen.findByText(SESSAO.mensagem_inicial.conteudo)
            expect(screen.queryByRole("status")).not.toBeInTheDocument()
        })

        it("deve atualizar o banner conforme a resposta do assistente", async () => {
            const user = userEvent.setup()
            mockedApi
                .mockResolvedValueOnce(SESSAO)
                .mockResolvedValueOnce({
                    resposta_assistente: {
                        ...RESPOSTA.resposta_assistente,
                        reforco_pedagogico: REFORCO,
                    },
                })
                .mockResolvedValueOnce({
                    resposta_assistente: {
                        ...RESPOSTA.resposta_assistente,
                        id: "msg-5",
                        reforco_pedagogico: null,
                    },
                })
            renderPage()

            await screen.findByText(SESSAO.mensagem_inicial.conteudo)
            expect(screen.queryByRole("status")).not.toBeInTheDocument()

            const input = screen.getByPlaceholderText("Digite sua dúvida...")
            await user.type(input, "Oi{Enter}")
            expect(await screen.findByRole("status")).toHaveTextContent(
                "Funções e Escopo",
            )

            await user.type(input, "Tudo certo{Enter}")
            await screen.findByText("Tudo certo")
            await waitFor(() =>
                expect(screen.queryByRole("status")).not.toBeInTheDocument(),
            )
        })
    })

    describe("ação PROXIMA_ATIVIDADE", () => {
        function respostaProximaAtividade(
            extras: Record<string, unknown>,
        ) {
            return {
                resposta_assistente: {
                    id: "msg-4",
                    remetente: "ASSISTENTE",
                    conteudo: "Sua próxima atividade é Variáveis em JS.",
                    intencao_detectada: "PROXIMA_ATIVIDADE",
                    acao: "PROXIMA_ATIVIDADE",
                    criada_em: "2026-09-27T12:00:03Z",
                    ...extras,
                },
            }
        }

        async function enviarEClicarNoBotao(resposta: object) {
            const user = userEvent.setup()
            mockedApi
                .mockResolvedValueOnce(SESSAO)
                .mockResolvedValueOnce(resposta)
            render(
                <MemoryRouter initialEntries={["/chat"]}>
                    <Routes>
                        <Route path="/chat" element={<ChatPage />} />
                        <Route
                            path="/trilhas/:trilhaId/atividade/:atividadeId"
                            element={<p>Tela da atividade</p>}
                        />
                    </Routes>
                </MemoryRouter>,
            )

            await screen.findByText(SESSAO.mensagem_inicial.conteudo)
            await user.type(
                screen.getByPlaceholderText("Digite sua dúvida..."),
                "Qual minha próxima atividade?",
            )
            await user.click(
                screen.getByRole("button", { name: "Enviar mensagem" }),
            )
            await user.click(
                await screen.findByRole("button", {
                    name: "Ir para a próxima atividade",
                }),
            )
        }

        it("deve navegar para a rota enviada em redirecionar_para", async () => {
            await enviarEClicarNoBotao(
                respostaProximaAtividade({
                    redirecionar_para: "/trilhas/t-1/atividade/a-2",
                    dados_acao: { trilha_id: "t-1", atividade_id: "a-2" },
                }),
            )

            expect(
                await screen.findByText("Tela da atividade"),
            ).toBeInTheDocument()
        })

        it("deve montar a rota a partir de dados_acao quando não houver redirecionar_para", async () => {
            await enviarEClicarNoBotao(
                respostaProximaAtividade({
                    redirecionar_para: null,
                    dados_acao: { trilha_id: "t-1", atividade_id: "a-2" },
                }),
            )

            expect(
                await screen.findByText("Tela da atividade"),
            ).toBeInTheDocument()
        })

        it("não deve exibir o botão sem rota nem ids da atividade", async () => {
            const user = userEvent.setup()
            mockedApi
                .mockResolvedValueOnce(SESSAO)
                .mockResolvedValueOnce(
                    respostaProximaAtividade({ dados_acao: {} }),
                )
            renderPage()

            await screen.findByText(SESSAO.mensagem_inicial.conteudo)
            await user.type(
                screen.getByPlaceholderText("Digite sua dúvida..."),
                "Qual minha próxima atividade?",
            )
            await user.click(
                screen.getByRole("button", { name: "Enviar mensagem" }),
            )

            await screen.findByText("Sua próxima atividade é Variáveis em JS.")
            expect(
                screen.queryByRole("button", {
                    name: "Ir para a próxima atividade",
                }),
            ).not.toBeInTheDocument()
        })
    })

    describe("trilhas recomendadas", () => {
        it("deve matricular e abrir a trilha ao clicar em Iniciar trilha", async () => {
            const user = userEvent.setup()
            mockedApi
                .mockResolvedValueOnce(SESSAO)
                .mockResolvedValueOnce(RESPOSTA)
                .mockResolvedValueOnce({})
            render(
                <MemoryRouter initialEntries={["/chat"]}>
                    <Routes>
                        <Route path="/chat" element={<ChatPage />} />
                        <Route
                            path="/trilhas/:id"
                            element={<p>Tela da trilha</p>}
                        />
                    </Routes>
                </MemoryRouter>,
            )

            await user.click(
                await screen.findByRole("button", {
                    name: "Ver trilhas disponíveis",
                }),
            )
            await user.click(
                await screen.findByRole("button", {
                    name: "Iniciar trilha Javascript",
                }),
            )

            expect(await screen.findByText("Tela da trilha")).toBeInTheDocument()
            expect(mockedApi).toHaveBeenLastCalledWith("/matriculas/", {
                method: "POST",
                body: JSON.stringify({ trilha_id: "trilha-1" }),
            })
        })

        it("deve manter os chips do backend quando a Vari pede para escolher a trilha de um fluxo", async () => {
            const user = userEvent.setup()
            mockedApi.mockResolvedValueOnce(SESSAO).mockResolvedValueOnce({
                resposta_assistente: {
                    ...RESPOSTA.resposta_assistente,
                    acao: "SELECIONAR_TRILHA",
                    sugestoes_rapidas: [
                        "Quero fazer o teste de nivelamento da trilha Javascript",
                    ],
                },
            })
            renderPage()

            await user.click(
                await screen.findByRole("button", {
                    name: "Ver trilhas disponíveis",
                }),
            )

            expect(
                await screen.findByRole("button", {
                    name: "Quero fazer o teste de nivelamento da trilha Javascript",
                }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole("button", {
                    name: "Iniciar trilha Javascript",
                }),
            ).not.toBeInTheDocument()
        })
    })

    it("deve exibir mensagem de erro quando o envio falhar", async () => {
        const user = userEvent.setup()
        mockedApi
            .mockResolvedValueOnce(SESSAO)
            .mockRejectedValueOnce(new Error("falhou"))
        renderPage()

        await screen.findByText(SESSAO.mensagem_inicial.conteudo)
        await user.type(
            screen.getByPlaceholderText("Digite sua dúvida..."),
            "Oi",
        )
        await user.click(
            screen.getByRole("button", { name: "Enviar mensagem" }),
        )

        expect(
            await screen.findByText(
                "Ops, ocorreu um erro ao processar sua mensagem.",
            ),
        ).toBeInTheDocument()
    })
})
