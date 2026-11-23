import {
    MemoryRouter,
    Route,
    Routes,
    useLocation,
    useParams,
} from "react-router-dom"

import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { type LearningDiagnostics, userService } from "@/services/userService"

import { LearningDiagnosticsCard } from "./LearningDiagnosticsCard"

jest.mock("@/services/userService", () => ({
    userService: { getLearningDiagnostics: jest.fn() },
}))

const mockGetDiagnostics = jest.mocked(userService.getLearningDiagnostics)

/** Payload de exemplo da VAR-126. */
const DIAGNOSTICO: LearningDiagnostics = {
    pontos_fortes: ["Estruturas Condicionais", "Operadores Lógicos"],
    topicos_dificuldade: ["List Comprehension", "Funções Lambda"],
    topicos_praticar: [
        {
            topico: "Funções Lambda",
            trilha_id: "trilha-1",
            atividade_id: "atividade-lambda",
        },
    ],
    taxa_acerto_geral: 78.5,
    total_atividades_avaliadas: 14,
    ultima_atualizacao: "2026-11-10T19:30:00Z",
}

const VAZIO: LearningDiagnostics = {
    pontos_fortes: [],
    topicos_dificuldade: [],
    topicos_praticar: [],
    taxa_acerto_geral: 0,
    total_atividades_avaliadas: 0,
    ultima_atualizacao: null,
}

function ChatStub() {
    const location = useLocation()
    const { prompt } = (location.state ?? {}) as { prompt?: string }
    return <p>Chat aberto: {prompt}</p>
}

function ActivityStub() {
    const { trilhaId, atividadeId } = useParams()
    const { state } = useLocation()
    const { praticaReforco } = (state ?? {}) as { praticaReforco?: boolean }
    return (
        <p>
            Atividade aberta: {trilhaId}/{atividadeId}
            {praticaReforco && " (prática)"}
        </p>
    )
}

function renderCard() {
    return render(
        <MemoryRouter initialEntries={["/perfil"]}>
            <Routes>
                <Route path="/perfil" element={<LearningDiagnosticsCard />} />
                <Route path="/chat" element={<ChatStub />} />
                <Route
                    path="/trilhas/:trilhaId/atividade/:atividadeId"
                    element={<ActivityStub />}
                />
                <Route path="/" element={<p>Home com trilhas</p>} />
            </Routes>
        </MemoryRouter>,
    )
}

beforeEach(() => {
    mockGetDiagnostics.mockReset()
})

describe("LearningDiagnosticsCard", () => {
    it("mostra o skeleton enquanto carrega", () => {
        mockGetDiagnostics.mockReturnValue(new Promise(() => {}))
        renderCard()

        expect(screen.getByTestId("raio-x-skeleton")).toBeInTheDocument()
        expect(
            screen.getByText("Analisando suas atividades..."),
        ).toBeInTheDocument()
    })

    it("exibe resumo, habilidades consolidadas e tópicos em foco", async () => {
        mockGetDiagnostics.mockResolvedValue(DIAGNOSTICO)
        renderCard()

        const fortes = await screen.findByRole("list", {
            name: "Habilidades Consolidadas",
        })
        expect(
            within(fortes)
                .getAllByRole("listitem")
                .map((item) => item.textContent),
        ).toEqual(["Estruturas Condicionais", "Operadores Lógicos"])

        const foco = screen.getByRole("list", { name: "Tópicos em Foco" })
        expect(within(foco).getByText("List Comprehension")).toBeInTheDocument()
        expect(within(foco).getByText("Funções Lambda")).toBeInTheDocument()

        const resumo = screen.getByRole("list", { name: "Resumo" })
        expect(resumo).toHaveTextContent("78,5% de acerto geral")
        expect(resumo).toHaveTextContent("14 atividades avaliadas")
        expect(screen.getByText("Atualizado em 10/11/2026")).toBeInTheDocument()
    })

    it("abre o chat com o prompt do tópico ao pedir dica ao Vari", async () => {
        mockGetDiagnostics.mockResolvedValue(DIAGNOSTICO)
        renderCard()

        await userEvent.click(
            await screen.findByRole("button", {
                name: "Pedir dica de estudo ao Vari sobre Funções Lambda",
            }),
        )

        expect(
            screen.getByText(
                "Chat aberto: Quero revisar Funções Lambda. Me dá uma dica de estudo?",
            ),
        ).toBeInTheDocument()
    })

    it("abre a atividade com menor acerto do tópico ao praticar de novo", async () => {
        mockGetDiagnostics.mockResolvedValue(DIAGNOSTICO)
        renderCard()

        await userEvent.click(
            await screen.findByRole("button", {
                name: "Praticar de novo Funções Lambda",
            }),
        )

        expect(
            screen.getByText(
                "Atividade aberta: trilha-1/atividade-lambda (prática)",
            ),
        ).toBeInTheDocument()
    })

    it("só oferece praticar de novo para tópicos com atividade indicada", async () => {
        mockGetDiagnostics.mockResolvedValue(DIAGNOSTICO)
        renderCard()

        const foco = await screen.findByRole("list", {
            name: "Tópicos em Foco",
        })
        expect(
            within(foco).getAllByRole("button", { name: /Praticar de novo/ }),
        ).toHaveLength(1)
    })

    it("orienta o aluno novo a fazer atividades quando não há dados", async () => {
        mockGetDiagnostics.mockResolvedValue(VAZIO)
        renderCard()

        expect(
            await screen.findByText("Seu raio-x ainda está em branco"),
        ).toBeInTheDocument()

        await userEvent.click(
            screen.getByRole("button", { name: "Ir para as trilhas" }),
        )
        expect(screen.getByText("Home com trilhas")).toBeInTheDocument()
    })

    it("pede para continuar praticando quem já fez atividades sem consolidar", async () => {
        mockGetDiagnostics.mockResolvedValue({
            ...VAZIO,
            total_atividades_avaliadas: 2,
        })
        renderCard()

        expect(
            await screen.findByText("Quase lá! Continue praticando"),
        ).toBeInTheDocument()
        expect(screen.getByText(/Você já fez 2 atividades/)).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: "Continuar estudando" }),
        ).toBeInTheDocument()
    })

    it("mostra uma frase na coluna vazia quando só há pontos fortes", async () => {
        mockGetDiagnostics.mockResolvedValue({
            ...DIAGNOSTICO,
            topicos_dificuldade: [],
        })
        renderCard()

        expect(
            await screen.findByText(
                "Nenhum tópico em foco no momento. Mandou bem!",
            ),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole("button", { name: /Pedir dica/ }),
        ).not.toBeInTheDocument()
    })

    it("aceita tópicos no formato de objeto da memória pedagógica", async () => {
        mockGetDiagnostics.mockResolvedValue({
            ...DIAGNOSTICO,
            pontos_fortes: [
                { topico: "Laços de Repetição", taxa_acerto: 92 },
            ] as unknown as string[],
        })
        renderCard()

        expect(
            await screen.findByText("Laços de Repetição"),
        ).toBeInTheDocument()
    })

    it("mostra erro e tenta de novo", async () => {
        mockGetDiagnostics
            .mockRejectedValueOnce(new Error("404"))
            .mockResolvedValueOnce(DIAGNOSTICO)
        renderCard()

        expect(
            await screen.findByText(
                "Não foi possível carregar seu raio-x agora.",
            ),
        ).toBeInTheDocument()

        await userEvent.click(
            screen.getByRole("button", { name: "Tentar de novo" }),
        )

        expect(
            await screen.findByRole("list", {
                name: "Habilidades Consolidadas",
            }),
        ).toBeInTheDocument()
        expect(mockGetDiagnostics).toHaveBeenCalledTimes(2)
    })
})
