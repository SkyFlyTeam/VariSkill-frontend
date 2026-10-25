import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { HomePage } from "@/pages/Home/Home"
import { renderWithProviders } from "@/tests/utils"
import { matchesTrackSearch } from "@/utils/trackSearch"

const originalFetch = globalThis.fetch

const TRILHAS = [
    {
        id: "t-python",
        titulo: "Python: Fundamentos",
        descricao: "Sintaxe basica e estruturas de controle.",
        habilidade: "Python",
        total_modulos: 5,
        total_atividades: 25,
    },
    {
        id: "t-dados",
        titulo: "Python: Analise de Dados",
        descricao: "NumPy e Pandas.",
        habilidade: "Ciência de Dados",
        total_modulos: 5,
        total_atividades: 25,
    },
    {
        id: "t-devops",
        titulo: "DevOps e Cloud: Docker e CI/CD",
        descricao: "Containers e pipelines.",
        habilidade: "DevOps/Cloud",
        total_modulos: 2,
        total_atividades: 10,
    },
]

const RESPOSTAS: Record<string, unknown> = {
    "/api/users/me/": {
        id: "1",
        apelido: "ana",
        nome: "Ana",
        email: "ana@example.com",
        xp_total: 0,
        streak_dias: 0,
    },
    "/api/trilhas/": TRILHAS,
    "/api/matriculas/": [
        {
            id: "m-1",
            trilha_id: "t-python",
            trilha_titulo: "Python: Fundamentos",
            status: "EM_ANDAMENTO",
            modulo_atual: null,
        },
    ],
    "/api/trilhas/recomendadas/?limite=3": [
        { ...TRILHAS[2], criterio: "POPULARIDADE", motivo: "Muito procurada." },
    ],
    "/api/trilhas/t-python/roadmap/": { percentual_conclusao: 20, modulos: [] },
}

beforeEach(() => {
    globalThis.fetch = jest.fn().mockImplementation((url: string) =>
        Promise.resolve({
            ok: true,
            status: 200,
            json: async () => RESPOSTAS[url] ?? {},
        }),
    ) as unknown as typeof fetch
})

afterEach(() => {
    globalThis.fetch = originalFetch
    jest.restoreAllMocks()
})

function trilhasVisiveis() {
    return screen
        .queryAllByRole("link", { name: /trilha / })
        .map((link) => link.getAttribute("aria-label"))
}

describe("matchesTrackSearch", () => {
    it("ignora acentos, caixa e exige todos os termos", () => {
        expect(matchesTrackSearch("ANÁLISE", "Python: Analise de Dados")).toBe(
            true,
        )
        expect(matchesTrackSearch("ciencia", "Ciência de Dados")).toBe(true)
        expect(
            matchesTrackSearch("python dados", "Python: Analise de Dados"),
        ).toBe(true)
        expect(
            matchesTrackSearch("python docker", "Python: Analise de Dados"),
        ).toBe(false)
        expect(matchesTrackSearch("   ", "Qualquer")).toBe(true)
    })
})

describe("HomePage - busca de trilhas", () => {
    async function renderHome() {
        renderWithProviders(<HomePage />)
        await waitFor(() => expect(trilhasVisiveis()).toHaveLength(3))
    }

    it("filtra minhas trilhas e as disponíveis pelo texto digitado", async () => {
        const user = userEvent.setup()
        await renderHome()

        await user.type(
            screen.getByRole("searchbox", { name: "Buscar trilhas" }),
            "python",
        )

        expect(trilhasVisiveis()).toEqual([
            "Continuar trilha Python: Fundamentos",
            "Visualizar trilha Python: Analise de Dados",
        ])
        expect(
            screen.queryByText("Recomendado para você"),
        ).not.toBeInTheDocument()
    })

    it("busca pela habilidade e oculta seções sem resultados", async () => {
        const user = userEvent.setup()
        await renderHome()

        await user.type(
            screen.getByRole("searchbox", { name: "Buscar trilhas" }),
            "ciencia",
        )

        expect(trilhasVisiveis()).toEqual([
            "Visualizar trilha Python: Analise de Dados",
        ])
        expect(screen.queryByText("Minhas trilhas")).not.toBeInTheDocument()
    })

    it("mostra aviso quando nada é encontrado e permite limpar a busca", async () => {
        const user = userEvent.setup()
        await renderHome()

        await user.type(
            screen.getByRole("searchbox", { name: "Buscar trilhas" }),
            "rust",
        )

        expect(screen.getByRole("status")).toHaveTextContent(
            'Nenhuma trilha encontrada para "rust".',
        )
        expect(trilhasVisiveis()).toEqual([])

        await user.click(screen.getByRole("button", { name: "Limpar busca" }))

        expect(trilhasVisiveis()).toHaveLength(3)
        expect(screen.getByText("Recomendado para você")).toBeInTheDocument()
    })
})
