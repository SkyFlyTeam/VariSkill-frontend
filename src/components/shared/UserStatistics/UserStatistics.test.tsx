import { render, screen } from "@testing-library/react"

import type { User } from "@/services/authService"

import { UserStatistics, type UserStatisticsProps } from "./UserStatistics"
import { toUserStatisticsProps } from "./toUserStatisticsProps"

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
            screen.getByRole("progressbar", {
                name: "Progresso para o nível 13",
            }),
        ).toHaveAttribute("aria-valuenow", "40")
        expect(getFill(container)).toHaveStyle({ width: "40%" })
    })

    it("renderiza o FireStreak com o estado do dia e o troféu", () => {
        render(<UserStatistics {...baseProps} />)

        expect(screen.getByLabelText(/Sequência de 12 dias/)).toHaveAttribute(
            "data-state",
            "lit",
        )
        expect(
            screen.getByLabelText("3 trilhas concluídas"),
        ).toBeInTheDocument()
    })

    it("oculta o troféu quando não informado", () => {
        render(<UserStatistics {...baseProps} trophies={undefined} />)

        expect(
            screen.queryByLabelText(/trilhas concluídas/),
        ).not.toBeInTheDocument()
    })
})

describe("toUserStatisticsProps", () => {
    const user: User = {
        id: "1",
        apelido: "ana",
        nome: "Ana",
        email: "ana@example.com",
        xp_total: 240,
        conquistas_desbloqueadas: 0,
        streak: {
            atual: 2,
            recorde: 7,
            concluiu_hoje: false,
            ultimo_dia: "2026-11-17",
        },
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

describe("UserStatistics com itens equipados", () => {
    it("exibe avatar, borda e título equipados", () => {
        const { container } = render(
            <UserStatistics
                {...baseProps}
                avatarUrl="/avatares/vari_sensei.png"
                borderUrl="/bordas/flamejante.png"
                title="Iniciante Imparável"
            />,
        )

        const avatar = container.querySelector("[data-slot='profile-avatar']")
        expect(avatar?.querySelector("img")).toHaveAttribute(
            "src",
            "/avatares/vari_sensei.png",
        )
        expect(
            container.querySelector("[data-slot='profile-border']"),
        ).toHaveAttribute("src", "/bordas/flamejante.png")
        expect(screen.getByText("Iniciante Imparável")).toBeInTheDocument()
    })

    it("não renderiza borda nem título quando não equipados", () => {
        const { container } = render(<UserStatistics {...baseProps} />)

        expect(
            container.querySelector("[data-slot='profile-border']"),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText("Iniciante Imparável"),
        ).not.toBeInTheDocument()
    })

    it("mapeia os itens equipados de /users/me/ para caminhos de /public", () => {
        const cosmetico = {
            descricao: "",
            raridade: "COMUM" as const,
            asset_url: "",
        }
        const props = toUserStatisticsProps({
            id: "1",
            apelido: "ana",
            nome: "Ana",
            email: "ana@example.com",
            xp_total: 0,
            streak: {
                atual: 0,
                recorde: 0,
                concluiu_hoje: false,
                ultimo_dia: null,
            },
            conquistas_desbloqueadas: 0,
            avatar_equipado: {
                ...cosmetico,
                id: "a",
                nome: "Vari Clássico",
                tipo: "AVATAR",
                recurso_visual: "avatares/vari_classico.png",
            },
            borda_equipada: {
                ...cosmetico,
                id: "b",
                nome: "Borda Básica",
                tipo: "BORDA",
                recurso_visual: "bordas/basica.png",
            },
            titulo_equipado: {
                ...cosmetico,
                id: "t",
                nome: "Estudante VariSkill",
                tipo: "TITULO",
                recurso_visual: "titulos/estudante_variskill",
            },
        })

        expect(props).toMatchObject({
            avatarUrl: "/avatares/vari_classico.png",
            borderUrl: "/bordas/basica.png",
            title: "Estudante VariSkill",
        })
    })
})
