import { render, screen } from "@testing-library/react"

import type { User } from "@/services/authService"

import { UserLevelBar } from "./UserLevelBar"

const mockAuth: { user: User | null } = { user: null }

jest.mock("@/contexts/authContext", () => ({
    useAuth: () => ({ user: mockAuth.user }),
}))

const baseUser: User = {
    id: "user-1",
    apelido: "ana",
    nome: "Ana",
    email: "ana@example.com",
    xp_total: 240,
    streak_dias: 2,
    nivel: 2,
    progresso_nivel: {
        nivel: 2,
        xp_atual: 240,
        xp_min_faixa: 100,
        xp_proximo_nivel: 300,
        xp_restante: 60,
        progresso_pct: 70,
    },
}

function getFill(container: HTMLElement) {
    return container.querySelector("[data-slot='progress-fill']")
}

beforeEach(() => {
    mockAuth.user = baseUser
})

describe("UserLevelBar", () => {
    it("exibe nível, legenda formatada e progresso proporcional", () => {
        const { container } = render(<UserLevelBar />)

        expect(screen.getByText("Nível 2")).toBeInTheDocument()
        expect(
            screen.getByText("240 / 300 XP (Faltam 60 XP para o Nível 3)"),
        ).toBeInTheDocument()

        const progressbar = screen.getByRole("progressbar", {
            name: "Progresso para o nível 3",
        })
        expect(progressbar).toHaveAttribute("aria-valuenow", "70")
        expect(getFill(container)).toHaveStyle({ width: "70%" })
    })

    it("atualiza quando o usuário do AuthContext muda", () => {
        const { rerender } = render(<UserLevelBar />)

        expect(screen.getByText("Nível 2")).toBeInTheDocument()

        mockAuth.user = {
            ...baseUser,
            xp_total: 300,
            nivel: 3,
            progresso_nivel: {
                nivel: 3,
                xp_atual: 300,
                xp_min_faixa: 300,
                xp_proximo_nivel: 600,
                xp_restante: 300,
                progresso_pct: 0,
            },
        }

        rerender(<UserLevelBar />)

        expect(screen.getByText("Nível 3")).toBeInTheDocument()
        expect(
            screen.getByText("300 / 600 XP (Faltam 300 XP para o Nível 4)"),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("progressbar", {
                name: "Progresso para o nível 4",
            }),
        ).toHaveAttribute("aria-valuenow", "0")
    })

    it("aplica a variante compacta e escura para o Header", () => {
        render(<UserLevelBar compact tone="dark" className="minha-classe" />)

        expect(screen.getByLabelText("Progresso do nível 2")).toHaveClass(
            "p-3",
            "minha-classe",
        )
    })

    it("não renderiza sem usuário no AuthContext", () => {
        mockAuth.user = null

        const { container } = render(<UserLevelBar />)

        expect(container).toBeEmptyDOMElement()
    })
})
