import { fireEvent, render, screen, within } from "@testing-library/react"

import {
    AchievementUnlockedModal,
    type UnlockedAchievement,
} from "./AchievementUnlockedModal"

const EM_CHAMAS: UnlockedAchievement = {
    id: "conquista-streak",
    codigo: "EM_CHAMAS",
    titulo: "Em Chamas",
    descricao: "Você estudou 7 dias seguidos.",
    categoria: "STREAK",
    icone: "icone-em-chamas.svg",
    xp_recompensa: 50,
    recompensas: [
        {
            id: "borda-flamejante",
            nome: "Borda Flamejante",
            tipo: "BORDA",
            raridade: "RARO",
            asset_url: "",
        },
    ],
}

const PRIMEIRO_PASSO: UnlockedAchievement = {
    id: "conquista-progresso",
    codigo: "PRIMEIRO_PASSO",
    titulo: "Primeiro Passo",
    descricao: "Você concluiu sua primeira atividade.",
    categoria: "PROGRESSO",
    xp_recompensa: 0,
}

function renderModal(
    props: Partial<Parameters<typeof AchievementUnlockedModal>[0]> = {},
) {
    return render(
        <AchievementUnlockedModal
            open
            achievements={[EM_CHAMAS]}
            onClose={() => {}}
            {...props}
        />,
    )
}

describe("AchievementUnlockedModal", () => {
    it("anuncia a conquista com título, descrição, medalha, XP e recompensa", () => {
        renderModal()

        expect(screen.getByText("CONQUISTA DESBLOQUEADA")).toBeInTheDocument()
        expect(
            screen.getByRole("heading", { name: "Em Chamas" }),
        ).toBeInTheDocument()
        expect(
            screen.getByText("Você estudou 7 dias seguidos."),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("img", {
                name: "Medalha da conquista Em Chamas",
            }),
        ).toHaveAttribute("data-icon", "chama")
        expect(screen.getByText("+50 XP")).toBeInTheDocument()
        expect(screen.getByText("Borda Flamejante")).toBeInTheDocument()
        expect(screen.getByText("Raro")).toBeInTheDocument()
        expect(
            screen.getByText("Borda de Perfil · já está no seu inventário"),
        ).toBeInTheDocument()
    })

    it.each([
        ["STREAK", "chama"],
        ["PROGRESSO", "check"],
        ["PRECISAO", "estrela"],
        ["DESCONHECIDA", "estrela"],
    ])("usa a medalha da categoria %s", (categoria, icon) => {
        renderModal({ achievements: [{ ...PRIMEIRO_PASSO, categoria }] })

        expect(
            screen.getByRole("img", { name: /Medalha da conquista/ }),
        ).toHaveAttribute("data-icon", icon)
    })

    it("lista todos os cosméticos que a conquista libera", () => {
        renderModal({
            achievements: [
                {
                    ...EM_CHAMAS,
                    recompensas: [
                        {
                            id: "titulo",
                            nome: "Mestre da Precisão",
                            tipo: "TITULO",
                            raridade: "EPICO",
                        },
                        {
                            id: "borda",
                            nome: "Borda Dourada",
                            tipo: "BORDA",
                            raridade: "LENDARIO",
                        },
                    ],
                },
            ],
        })

        const rewards = within(
            screen.getByRole("list", { name: "Recompensas" }),
        ).getAllByTestId("achievement-reward")
        expect(rewards).toHaveLength(2)
        expect(screen.getByText("Épico")).toBeInTheDocument()
        expect(screen.getByText("Lendário")).toBeInTheDocument()
    })

    it("omite recompensas e XP quando a conquista não os concede", () => {
        renderModal({ achievements: [PRIMEIRO_PASSO] })

        expect(
            screen.queryByTestId("achievement-reward"),
        ).not.toBeInTheDocument()
        expect(screen.queryByText(/XP/)).not.toBeInTheDocument()
    })

    it("com uma conquista, não mostra contador e fecha em 'Continuar'", () => {
        const onClose = jest.fn()
        renderModal({ onClose })

        expect(screen.queryByText("1 de 1")).not.toBeInTheDocument()
        expect(
            screen.queryByTestId("achievement-steps"),
        ).not.toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Continuar" }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("mostra várias conquistas uma por vez antes de fechar", () => {
        const onClose = jest.fn()
        renderModal({ achievements: [PRIMEIRO_PASSO, EM_CHAMAS], onClose })

        expect(screen.getByText("1 de 2")).toBeInTheDocument()
        expect(
            screen.getByRole("heading", { name: "Primeiro Passo" }),
        ).toBeInTheDocument()

        fireEvent.click(
            screen.getByRole("button", { name: "Próxima conquista" }),
        )

        expect(screen.getByText("2 de 2")).toBeInTheDocument()
        expect(
            screen.getByRole("heading", { name: "Em Chamas" }),
        ).toBeInTheDocument()
        expect(onClose).not.toHaveBeenCalled()

        fireEvent.click(screen.getByRole("button", { name: "Continuar" }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("Esc avança como o botão de ação", () => {
        const onClose = jest.fn()
        renderModal({ achievements: [PRIMEIRO_PASSO, EM_CHAMAS], onClose })

        fireEvent.keyDown(document.body, { key: "Escape" })

        expect(
            screen.getByRole("heading", { name: "Em Chamas" }),
        ).toBeInTheDocument()
        expect(onClose).not.toHaveBeenCalled()

        fireEvent.keyDown(document.body, { key: "Escape" })

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("só exibe 'Ver minhas conquistas' quando há destino", () => {
        const { unmount } = renderModal()
        expect(
            screen.queryByRole("button", { name: "Ver minhas conquistas" }),
        ).not.toBeInTheDocument()
        unmount()

        const onViewAchievements = jest.fn()
        renderModal({ onViewAchievements })
        fireEvent.click(
            screen.getByRole("button", { name: "Ver minhas conquistas" }),
        )

        expect(onViewAchievements).toHaveBeenCalledTimes(1)
    })

    it("não renderiza nada sem conquistas ou quando fechado", () => {
        const { unmount } = renderModal({ achievements: [] })
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
        unmount()

        renderModal({ open: false })
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
})
