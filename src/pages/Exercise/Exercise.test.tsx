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

function mockApi() {
    mockedApi.mockImplementation((path: string) => {
        if (path === "/atividades/ativ-1/") {
            return Promise.resolve(ATIVIDADE)
        }
        if (path === "/trilhas/trilha-1/roadmap/") {
            return Promise.resolve({ percentual_conclusao: 30 })
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
})
