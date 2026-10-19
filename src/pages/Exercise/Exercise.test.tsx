import { MemoryRouter, Route, Routes } from "react-router-dom"

import { fireEvent, render, screen, waitFor } from "@testing-library/react"

import { api } from "@/services/api"

import { ExercisePage } from "./Exercise"

jest.mock("@/services/api", () => ({
    api: jest.fn(),
    ApiError: class ApiError extends Error {
        status: number
        constructor(message: string, status: number) {
            super(message)
            this.status = status
        }
    },
}))

jest.mock("@/contexts/authContext", () => ({
    useAuth: () => ({ user: null, updateUser: jest.fn() }),
}))

const mockedApi = api as jest.MockedFunction<typeof api>

const ATIVIDADE = {
    id: "ativ-1",
    titulo: "Completando o código",
    contexto_avaliacao: "Fundamentos de variáveis",
    questoes: [
        {
            id: "q-1",
            tipo_exercicio: "ORDENAR_BLOCOS",
            enunciado: "1 - Arraste os blocos para completar o código:",
            codigo_snippet: "__SLOT_0__ contador = 0;",
            opcoes: [
                { id: "bloco-1", texto_opcao: "let", ordem: 1 },
                { id: "bloco-2", texto_opcao: "const", ordem: 2 },
            ],
        },
    ],
}

const RESULTADO = {
    execucao_id: "exec-1",
    aprovado: true,
    taxa_acerto: 100,
    pontuacao_obtida: 10,
    xp_concedido: 20,
    novo_xp_total: 20,
    executado_em: "2026-01-01T12:00:00-03:00",
    questoes_feedback: [
        { questao_id: "q-1", correta: true, explicacao: "Muito bem!" },
    ],
}

const ATIVIDADE_MULTIPLA = {
    ...ATIVIDADE,
    questoes: [
        ...ATIVIDADE.questoes,
        {
            id: "q-2",
            tipo_exercicio: "MULTIPLA_ESCOLHA",
            enunciado: "2 - Qual função converte '42' em inteiro?",
            codigo_snippet: "",
            opcoes: [
                { id: "opcao-1", texto_opcao: "int('42')", ordem: 1 },
                { id: "opcao-2", texto_opcao: "str('42')", ordem: 2 },
            ],
        },
    ],
}

function mockApi(atividade = ATIVIDADE) {
    mockedApi.mockImplementation((path: string) => {
        if (path === "/atividades/ativ-1/") {
            return Promise.resolve(atividade)
        }
        if (path === "/trilhas/trilha-1/roadmap/") {
            return Promise.resolve({ percentual_conclusao: 30, modulos: [] })
        }
        if (path === "/atividades/ativ-1/submeter/") {
            return Promise.resolve(RESULTADO)
        }
        return Promise.reject(new Error(`Rota inesperada: ${path}`))
    })
}

function renderExercise() {
    return render(
        <MemoryRouter initialEntries={["/trilhas/trilha-1/atividade/ativ-1"]}>
            <Routes>
                <Route
                    path="/trilhas/:trilhaId/atividade/:atividadeId"
                    element={<ExercisePage />}
                />
                <Route path="/trilhas/:trilhaId" element={<div>Roadmap</div>} />
            </Routes>
        </MemoryRouter>,
    )
}

beforeEach(() => {
    localStorage.clear()
    mockedApi.mockReset()
    mockApi()
})

describe("ExercisePage", () => {
    it("carrega a atividade e renderiza a questão com o botão desabilitado", async () => {
        renderExercise()

        expect(
            await screen.findByText(
                "1 - Arraste os blocos para completar o código:",
            ),
        ).toBeInTheDocument()

        expect(screen.getByRole("button", { name: "Verificar" })).toBeDisabled()
    })

    it("habilita o botão ao completar o exercício e envia a resposta", async () => {
        renderExercise()

        await screen.findByText(
            "1 - Arraste os blocos para completar o código:",
        )

        fireEvent.click(screen.getByText("let"))

        const verifyButton = screen.getByRole("button", { name: "Verificar" })
        await waitFor(() => expect(verifyButton).toBeEnabled())

        fireEvent.click(verifyButton)

        await waitFor(() =>
            expect(mockedApi).toHaveBeenCalledWith(
                "/atividades/ativ-1/submeter/",
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify({
                        respostas: { "q-1": ["bloco-1"] },
                    }),
                }),
            ),
        )

        expect(
            await screen.findByText("Parabéns, você foi aprovado!"),
        ).toBeInTheDocument()
    })

    it("exibe uma questão por vez e só submete todas as respostas ao final", async () => {
        mockApi(ATIVIDADE_MULTIPLA)
        renderExercise()

        expect(await screen.findByText("Questão 1 de 2")).toBeInTheDocument()
        const nextButton = screen.getByRole("button", { name: "Próxima" })
        expect(nextButton).toBeDisabled()

        fireEvent.click(screen.getByText("let"))
        await waitFor(() => expect(nextButton).toBeEnabled())
        fireEvent.click(nextButton)

        expect(await screen.findByText("Questão 2 de 2")).toBeInTheDocument()
        expect(
            screen.getByText("2 - Qual função converte '42' em inteiro?"),
        ).toBeInTheDocument()
        expect(screen.getByRole("progressbar")).toHaveAttribute(
            "aria-valuenow",
            "50",
        )
        expect(mockedApi).not.toHaveBeenCalledWith(
            "/atividades/ativ-1/submeter/",
            expect.anything(),
        )

        fireEvent.click(screen.getByText("int('42')"))
        const verifyButton = screen.getByRole("button", { name: "Verificar" })
        await waitFor(() => expect(verifyButton).toBeEnabled())
        fireEvent.click(verifyButton)

        await waitFor(() =>
            expect(mockedApi).toHaveBeenCalledWith(
                "/atividades/ativ-1/submeter/",
                expect.objectContaining({
                    body: JSON.stringify({
                        respostas: {
                            "q-1": ["bloco-1"],
                            "q-2": ["opcao-1"],
                        },
                    }),
                }),
            ),
        )
        expect(
            await screen.findByText("Parabéns, você foi aprovado!"),
        ).toBeInTheDocument()
        expect(localStorage.length).toBe(0)
    })

    it("ao tentar novamente, refaz apenas as questões erradas", async () => {
        mockApi(ATIVIDADE_MULTIPLA)
        const submitResponses = [
            {
                ...RESULTADO,
                aprovado: false,
                taxa_acerto: 50,
                questoes_feedback: [
                    { questao_id: "q-1", correta: true, explicacao: "" },
                    { questao_id: "q-2", correta: false, explicacao: "" },
                ],
            },
            RESULTADO,
        ]
        const defaultImpl = mockedApi.getMockImplementation()!
        mockedApi.mockImplementation((path: string, ...rest) =>
            path === "/atividades/ativ-1/submeter/"
                ? Promise.resolve(submitResponses.shift())
                : defaultImpl(path, ...rest),
        )
        renderExercise()

        await screen.findByText("Questão 1 de 2")
        fireEvent.click(screen.getByText("let"))
        fireEvent.click(screen.getByRole("button", { name: "Próxima" }))
        await screen.findByText("Questão 2 de 2")
        fireEvent.click(screen.getByText("str('42')"))
        fireEvent.click(screen.getByRole("button", { name: "Verificar" }))

        fireEvent.click(
            await screen.findByRole("button", { name: /Tentar Novamente/i }),
        )

        expect(
            await screen.findByText("Revisão: questão 1 de 1"),
        ).toBeInTheDocument()
        expect(
            screen.getByText("2 - Qual função converte '42' em inteiro?"),
        ).toBeInTheDocument()
        expect(screen.getByRole("progressbar")).toHaveAttribute(
            "aria-valuenow",
            "0",
        )
        expect(
            screen.queryByRole("button", { name: "Anterior" }),
        ).not.toBeInTheDocument()
        const verifyButton = screen.getByRole("button", { name: "Verificar" })
        expect(verifyButton).toBeDisabled()

        fireEvent.click(screen.getByText("int('42')"))
        expect(screen.getByRole("progressbar")).toHaveAttribute(
            "aria-valuenow",
            "100",
        )
        await waitFor(() => expect(verifyButton).toBeEnabled())
        fireEvent.click(verifyButton)

        await waitFor(() =>
            expect(mockedApi).toHaveBeenLastCalledWith(
                "/atividades/ativ-1/submeter/",
                expect.objectContaining({
                    body: JSON.stringify({
                        respostas: {
                            "q-1": ["bloco-1"],
                            "q-2": ["opcao-1"],
                        },
                    }),
                }),
            ),
        )
        expect(
            await screen.findByText("Parabéns, você foi aprovado!"),
        ).toBeInTheDocument()
    })

    it("restaura a questão atual e as respostas salvas no localStorage", async () => {
        mockApi(ATIVIDADE_MULTIPLA)
        const { unmount } = renderExercise()

        await screen.findByText("Questão 1 de 2")
        fireEvent.click(screen.getByText("let"))
        fireEvent.click(screen.getByRole("button", { name: "Próxima" }))
        await screen.findByText("Questão 2 de 2")
        unmount()

        renderExercise()

        expect(await screen.findByText("Questão 2 de 2")).toBeInTheDocument()
        expect(screen.getByRole("progressbar")).toHaveAttribute(
            "aria-valuenow",
            "50",
        )

        fireEvent.click(screen.getByRole("button", { name: "Anterior" }))
        expect(await screen.findByText("Questão 1 de 2")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Próxima" })).toBeEnabled()
    })
})
