import { MemoryRouter, Route, Routes } from "react-router-dom"

import { fireEvent, render, screen } from "@testing-library/react"

import { api } from "@/services/api"

import { LessonPage } from "./Lesson"

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

const LICAO = {
    id: "licao-1",
    titulo: "Variáveis",
    conteudo_teorico: {
        id: "conteudo-1",
        titulo: "O que são variáveis",
        texto_explicativo: "Variáveis guardam valores.",
        tempo_estimado_minutos: 5,
    },
}

const ROADMAP = {
    percentual_conclusao: 0,
    modulos: [
        {
            id: "modulo-1",
            titulo: "Fundamentos",
            atividades: [
                {
                    id: "licao-1",
                    titulo: "Variáveis",
                    status: "DISPONIVEL",
                    conteudo_teorico: {
                        id: "conteudo-1",
                        titulo: "O que são variáveis",
                    },
                },
                {
                    id: "ativ-2",
                    titulo: "Praticando",
                    status: "BLOQUEADA",
                    conteudo_teorico: null,
                },
            ],
        },
    ],
}

const CONQUISTA = {
    id: "conquista-1",
    codigo: "PRIMEIRO_PASSO",
    titulo: "Primeiro Passo",
    descricao: "Você concluiu sua primeira atividade.",
    icone: "conquistas/primeiro_passo.svg",
    xp_recompensa: 50,
    item_desbloqueado: null,
    itens_desbloqueados: [],
}

function mockApi(conquistas: unknown[]) {
    mockedApi.mockImplementation((path: string) => {
        if (path === "/atividades/licao-1/") return Promise.resolve(LICAO)
        if (path === "/trilhas/trilha-1/roadmap/")
            return Promise.resolve(ROADMAP)
        if (path === "/atividades/licao-1/concluir/")
            return Promise.resolve({
                status: "CONCLUIDO",
                atividade_id: "licao-1",
                conquistas_desbloqueadas: conquistas,
            })
        return Promise.reject(new Error(`Rota inesperada: ${path}`))
    })
}

function renderLesson() {
    return render(
        <MemoryRouter initialEntries={["/trilhas/trilha-1/licao/licao-1"]}>
            <Routes>
                <Route
                    path="/trilhas/:trilhaId/licao/:atividadeId"
                    element={<LessonPage />}
                />
                <Route
                    path="/trilhas/:trilhaId/atividade/:atividadeId"
                    element={<div>Próxima atividade</div>}
                />
                <Route path="/inventario" element={<div>Inventário</div>} />
            </Routes>
        </MemoryRouter>,
    )
}

describe("LessonPage", () => {
    beforeEach(() => {
        mockedApi.mockReset()
    })

    it("segue para a próxima atividade quando não há conquistas", async () => {
        mockApi([])
        renderLesson()

        fireEvent.click(await screen.findByRole("button", { name: "Próximo" }))

        expect(await screen.findByText("Próxima atividade")).toBeInTheDocument()
        expect(
            screen.queryByRole("heading", { name: "Primeiro Passo" }),
        ).not.toBeInTheDocument()
    })

    it("comemora a conquista antes de seguir para a próxima atividade", async () => {
        mockApi([CONQUISTA])
        renderLesson()

        fireEvent.click(await screen.findByRole("button", { name: "Próximo" }))

        expect(
            await screen.findByRole("heading", { name: "Primeiro Passo" }),
        ).toBeInTheDocument()
        expect(screen.queryByText("Próxima atividade")).not.toBeInTheDocument()

        fireEvent.click(
            screen.getByRole("button", { name: "Continuar Estudando" }),
        )

        expect(await screen.findByText("Próxima atividade")).toBeInTheDocument()
    })

    it("abre o inventário pelo modal de conquista", async () => {
        mockApi([CONQUISTA])
        renderLesson()

        fireEvent.click(await screen.findByRole("button", { name: "Próximo" }))
        fireEvent.click(
            await screen.findByRole("button", { name: "Ver no Inventário" }),
        )

        expect(await screen.findByText("Inventário")).toBeInTheDocument()
    })
})
