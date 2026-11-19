import { fireEvent, render, screen, within } from "@testing-library/react"

import {
    AchievementUnlockedModal,
    type UnlockedAchievement,
} from "./AchievementUnlockedModal"

/** Mesmo formato de `serializar_conquista` (motor da VAR-108). */
const TIRO_CERTEIRO: UnlockedAchievement = {
    id: "conquista-precisao",
    codigo: "PRECISAO_MAXIMA",
    titulo: "Tiro Certeiro",
    descricao: "Acertou 100% de uma bateria de questões sem errar.",
    icone: "conquistas/tiro_certeiro.svg",
    xp_recompensa: 150,
    item_desbloqueado: {
        id: "borda-neon",
        nome: "Borda Neon",
        tipo: "BORDA",
        asset_url: "",
    },
    itens_desbloqueados: [
        { id: "borda-neon", nome: "Borda Neon", tipo: "BORDA", asset_url: "" },
        {
            id: "mestre-logica",
            nome: "Mestre da Lógica",
            tipo: "TITULO",
            asset_url: "",
        },
    ],
}

const PRIMEIRO_PASSO: UnlockedAchievement = {
    id: "conquista-progresso",
    codigo: "PRIMEIRO_PASSO",
    titulo: "Primeiro Passo",
    descricao: "Concluiu a primeira atividade.",
    icone: "conquistas/primeiro_passo.svg",
    xp_recompensa: 0,
    item_desbloqueado: null,
    itens_desbloqueados: [],
}

function renderModal(
    props: Partial<Parameters<typeof AchievementUnlockedModal>[0]> = {},
) {
    return render(
        <AchievementUnlockedModal
            open
            achievements={[TIRO_CERTEIRO]}
            onClose={() => {}}
            {...props}
        />,
    )
}

describe("AchievementUnlockedModal", () => {
    it("anuncia a conquista com título, descrição, medalha, XP e itens", () => {
        renderModal()

        expect(screen.getByText("CONQUISTA DESBLOQUEADA")).toBeInTheDocument()
        expect(
            screen.getByRole("heading", { name: "Tiro Certeiro" }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                "Acertou 100% de uma bateria de questões sem errar.",
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("img", {
                name: "Medalha da conquista Tiro Certeiro",
            }),
        ).toHaveAttribute("data-icon", "estrela")
        expect(screen.getByText("+150 XP")).toBeInTheDocument()

        const rewards = within(
            screen.getByRole("list", { name: "Recompensas" }),
        ).getAllByTestId("achievement-reward")
        expect(rewards).toHaveLength(2)
        expect(
            screen.getByText("Borda de Perfil · já está no seu inventário"),
        ).toBeInTheDocument()
        expect(
            screen.getByText("Título de Honra · já está no seu inventário"),
        ).toBeInTheDocument()
    })

    it.each([
        ["PRIMEIRO_PASSO", "check"],
        ["EXPLORADOR_MODULO", "check"],
        ["DEDICACAO_INICIAL", "chama"],
        ["HABITO_DE_FERRO", "chama"],
        ["PRECISAO_MAXIMA", "estrela"],
        ["DESCONHECIDO", "estrela"],
    ])("escolhe a medalha pelo código %s", (codigo, icon) => {
        renderModal({ achievements: [{ ...PRIMEIRO_PASSO, codigo }] })

        expect(
            screen.getByRole("img", { name: /Medalha da conquista/ }),
        ).toHaveAttribute("data-icon", icon)
    })

    it("prioriza a categoria sobre o código quando ela vier", () => {
        renderModal({
            achievements: [{ ...PRIMEIRO_PASSO, categoria: "STREAK" }],
        })

        expect(
            screen.getByRole("img", { name: /Medalha da conquista/ }),
        ).toHaveAttribute("data-icon", "chama")
    })

    it("usa item_desbloqueado quando a lista de itens não vem", () => {
        renderModal({
            achievements: [
                {
                    ...PRIMEIRO_PASSO,
                    itens_desbloqueados: undefined,
                    item_desbloqueado: {
                        id: "vari-estudioso",
                        nome: "Vari Estudioso",
                        tipo: "AVATAR",
                        asset_url: "",
                    },
                },
            ],
        })

        expect(screen.getByText("Vari Estudioso")).toBeInTheDocument()
        expect(
            screen.getByText("Avatar · já está no seu inventário"),
        ).toBeInTheDocument()
    })

    it("mostra a raridade só quando o backend envia", () => {
        const { unmount } = renderModal()
        expect(screen.queryByText("Épico")).not.toBeInTheDocument()
        unmount()

        renderModal({
            achievements: [
                {
                    ...TIRO_CERTEIRO,
                    itens_desbloqueados: [
                        {
                            id: "borda-flamejante",
                            nome: "Borda Flamejante",
                            tipo: "BORDA",
                            raridade: "EPICO",
                            asset_url: "",
                        },
                    ],
                },
            ],
        })
        expect(screen.getByText("Épico")).toBeInTheDocument()
    })

    it("omite itens e XP quando a conquista não os concede", () => {
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
        renderModal({ achievements: [PRIMEIRO_PASSO, TIRO_CERTEIRO], onClose })

        expect(screen.getByText("1 de 2")).toBeInTheDocument()
        expect(
            screen.getByRole("heading", { name: "Primeiro Passo" }),
        ).toBeInTheDocument()

        fireEvent.click(
            screen.getByRole("button", { name: "Próxima conquista" }),
        )

        expect(screen.getByText("2 de 2")).toBeInTheDocument()
        expect(
            screen.getByRole("heading", { name: "Tiro Certeiro" }),
        ).toBeInTheDocument()
        expect(onClose).not.toHaveBeenCalled()

        fireEvent.click(screen.getByRole("button", { name: "Continuar" }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("Esc avança como o botão de ação", () => {
        const onClose = jest.fn()
        renderModal({ achievements: [PRIMEIRO_PASSO, TIRO_CERTEIRO], onClose })

        fireEvent.keyDown(document.body, { key: "Escape" })

        expect(
            screen.getByRole("heading", { name: "Tiro Certeiro" }),
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
