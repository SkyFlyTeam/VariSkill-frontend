import { render, screen } from "@testing-library/react"

import type { User } from "@/services/authService"

import { toUserStatisticsProps } from "./toUserStatisticsProps"
import { UserStatistics, type UserStatisticsProps } from "./UserStatistics"

const baseProps: UserStatisticsProps = {
    name: "Joe",
    level: 12,
    xpCurrent: 40,
    xpTarget: 100,
    progressPct: 40,
    streak: { atual: 12, recorde: 15, concluiu_hoje: true },
    trophies: 3,
}

function getFill(container: HTMLElement) {
    return container.querySelector("[data-slot='progress-fill']")
}

describe("UserStatistics", () => {
    it("exibe nome, nível, XP e progresso recebidos por props", () => {
        const { container } = render(<UserStatistics {...baseProps} />)

        expect(screen.getByText("Joe")).toBeInTheDocument()
        expect(screen.getByText("Nível 12")).toBeInTheDocument()
        expect(screen.getByText("40 / 100 XP")).toBeInTheDocument()
        expect(
            screen.getByRole("progressbar", { name: "Progresso para o nível 13" }),
        ).toHaveAttribute("aria-valuenow", "40")
        expect(getFill(container)).toHaveStyle({ width: "40%" })
    })

    it("renderiza o FireStreak com o estado do dia e o troféu", () => {
        render(<UserStatistics {...baseProps} />)

        expect(screen.getByLabelText(/Sequência de 12 dias/)).toHaveAttribute(
            "data-state",
            "lit",
        )
        expect(screen.getByLabelText("3 trilhas concluídas")).toBeInTheDocument()
    })

    it("oculta o troféu quando não informado", () => {
        render(<UserStatistics {...baseProps} trophies={undefined} />)

        expect(screen.queryByLabelText(/trilhas concluídas/)).not.toBeInTheDocument()
    })
})

describe("toUserStatisticsProps", () => {
    const user: User = {
        id: "1",
        apelido: "ana",
        nome: "Ana",
        email: "ana@example.com",
        xp_total: 240,
        streak: { atual: 2, recorde: 7, concluiu_hoje: false, ultimo_dia: "2026-11-17" },
        progresso_nivel: {
            nivel: 2,
            xp_atual: 240,
            xp_min_faixa: 100,
            xp_proximo_nivel: 300,
            xp_restante: 60,
            progresso_pct: 70,
        },
    }

    it("calcula o XP relativo à faixa do nível e mapeia o streak", () => {
        expect(toUserStatisticsProps(user)).toEqual({
            name: "ana",
            level: 2,
            xpCurrent: 140,
            xpTarget: 200,
            progressPct: 70,
            streak: { atual: 2, recorde: 7, concluiu_hoje: false },
        })
    })
})
