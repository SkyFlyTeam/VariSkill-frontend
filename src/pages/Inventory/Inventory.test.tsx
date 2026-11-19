import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { InventoryPage } from "@/pages/Inventory/Inventory"
import {
    type Conquista,
    achievementsService,
} from "@/services/achievementsService"
import {
    type Inventario,
    type ItemInventario,
    inventoryService,
} from "@/services/inventoryService"

const mockToast = { success: jest.fn(), error: jest.fn() }
const mockRefreshUser = jest.fn().mockResolvedValue(undefined)

jest.mock("@/components/shared/toast", () => ({
    useToast: () => mockToast,
}))

jest.mock("@/contexts/authContext", () => ({
    useAuth: () => ({ refreshUser: mockRefreshUser }),
}))

jest.mock("@/services/inventoryService", () => ({
    inventoryService: { getInventory: jest.fn(), equipItem: jest.fn() },
}))

jest.mock("@/services/achievementsService", () => ({
    achievementsService: { getAchievements: jest.fn() },
}))

const mockGetInventory = jest.mocked(inventoryService.getInventory)
const mockEquipItem = jest.mocked(inventoryService.equipItem)
const mockGetAchievements = jest.mocked(achievementsService.getAchievements)

function item(overrides: Partial<ItemInventario>): ItemInventario {
    return {
        id: "inv",
        item_id: "item",
        nome: "Item",
        descricao: "",
        tipo: "AVATAR",
        raridade: "COMUM",
        recurso_visual: "avatares/vari_classico.png",
        asset_url: "",
        desbloqueado: true,
        equipado: false,
        desbloqueado_em: "2025-05-14T10:00:00Z",
        ...overrides,
    }
}

const inventario: Inventario = {
    avatares: [
        item({
            id: "a1",
            item_id: "item-a1",
            nome: "Vari Clássico",
            equipado: true,
        }),
        item({
            id: "a2",
            item_id: "item-a2",
            nome: "Vari Sensei",
            raridade: "LENDARIO",
            recurso_visual: "avatares/vari_sensei.png",
        }),
        item({
            id: null,
            item_id: "item-cyber",
            nome: "Vari Cyberpunk",
            raridade: "EPICO",
            descricao:
                "Desbloqueado ao finalizar todos os tópicos de um módulo.",
            recurso_visual: "avatares/vari_cyberpunk.png",
            desbloqueado: false,
            desbloqueado_em: null,
        }),
    ],
    bordas: [
        item({
            id: "b1",
            item_id: "item-b1",
            nome: "Borda Básica",
            tipo: "BORDA",
            recurso_visual: "bordas/basica.png",
            equipado: true,
        }),
    ],
    titulos: [
        item({
            id: "t1",
            item_id: "item-t1",
            nome: "Estudante VariSkill",
            tipo: "TITULO",
            recurso_visual: "titulos/estudante_variskill",
            equipado: true,
        }),
    ],
}

const conquistas: Conquista[] = [
    {
        id: "c1",
        codigo: "PRIMEIRO_PASSO",
        titulo: "Primeiro Passo",
        descricao: "Concluiu a primeira atividade.",
        categoria: "PROGRESSO",
        icone: "conquistas/primeiro_passo.svg",
        xp_recompensa: 50,
        ordem: 1,
        desbloqueada: true,
        desbloqueada_em: "2025-05-14T12:00:00-03:00",
    },
    {
        id: "c2",
        codigo: "HABITO_DE_FERRO",
        titulo: "Semana Vitoriosa",
        descricao: "Estudou por 7 dias seguidos.",
        categoria: "STREAK",
        icone: "conquistas/semana_vitoriosa.svg",
        xp_recompensa: 250,
        ordem: 2,
        desbloqueada: false,
        desbloqueada_em: null,
    },
]

beforeEach(() => {
    jest.clearAllMocks()
    mockGetInventory.mockResolvedValue(
        JSON.parse(JSON.stringify(inventario)) as Inventario,
    )
    mockGetAchievements.mockResolvedValue(conquistas)
})

describe("InventoryPage", () => {
    it("renderiza as categorias com imagens de /public e o item equipado", async () => {
        render(<InventoryPage />)

        const classico = await screen.findByRole("button", {
            name: "Vari Clássico (equipado)",
        })
        expect(classico).toHaveAttribute("aria-pressed", "true")
        expect(
            within(classico).getByRole("img", { name: "Vari Clássico" }),
        ).toHaveAttribute("src", "/avatares/vari_classico.png")
        expect(
            screen.getByRole("img", { name: "Borda Básica" }),
        ).toHaveAttribute("src", "/bordas/basica.png")
        expect(screen.getByText("Lendário")).toBeInTheDocument()
        expect(screen.getByText("Estudante VariSkill")).toBeInTheDocument()
    })

    it("exibe conquistas desbloqueadas com data e bloqueadas com cadeado", async () => {
        render(<InventoryPage />)

        expect(
            await screen.findByText("Conquistado em 14/05/2025"),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("img", { name: "Semana Vitoriosa bloqueada" }),
        ).toBeInTheDocument()
    })

    it("envia a troca ao backend e atualiza o item equipado", async () => {
        mockEquipItem.mockResolvedValue({
            sucesso: true,
            item_equipado_id: "a2",
            tipo: "AVATAR",
        })
        render(<InventoryPage />)

        await userEvent.click(
            await screen.findByRole("button", { name: "Equipar Vari Sensei" }),
        )

        expect(mockEquipItem).toHaveBeenCalledWith("a2")
        expect(
            await screen.findByRole("button", {
                name: "Vari Sensei (equipado)",
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: "Equipar Vari Clássico" }),
        ).toHaveAttribute("aria-pressed", "false")
        expect(mockToast.success).toHaveBeenCalled()
        expect(mockRefreshUser).toHaveBeenCalled()
    })

    it("reverte a seleção quando o backend falha", async () => {
        mockEquipItem.mockRejectedValue(new Error("falha"))
        render(<InventoryPage />)

        await userEvent.click(
            await screen.findByRole("button", { name: "Equipar Vari Sensei" }),
        )

        await waitFor(() => expect(mockToast.error).toHaveBeenCalled())
        expect(
            screen.getByRole("button", { name: "Vari Clássico (equipado)" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: "Equipar Vari Sensei" }),
        ).toBeInTheDocument()
    })

    it("exibe o cadeado nos itens bloqueados", async () => {
        render(<InventoryPage />)

        const cyberpunk = await screen.findByRole("button", {
            name: "Vari Cyberpunk (bloqueado)",
        })
        expect(cyberpunk).toHaveAttribute("aria-disabled", "true")
        expect(
            within(cyberpunk).getByRole("img", {
                name: "Vari Cyberpunk bloqueado",
            }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole("img", { name: "Vari Sensei bloqueado" }),
        ).not.toBeInTheDocument()
    })

    it("avisa com toast e não chama o backend ao tentar equipar item bloqueado", async () => {
        render(<InventoryPage />)

        await userEvent.click(
            await screen.findByRole("button", {
                name: "Vari Cyberpunk (bloqueado)",
            }),
        )

        expect(mockEquipItem).not.toHaveBeenCalled()
        expect(mockToast.error).toHaveBeenCalledWith(
            expect.stringContaining("Vari Cyberpunk ainda está bloqueado"),
        )
        expect(
            screen.getByRole("button", { name: "Vari Clássico (equipado)" }),
        ).toBeInTheDocument()
    })

    it("não envia requisição ao clicar no item já equipado", async () => {
        render(<InventoryPage />)

        await userEvent.click(
            await screen.findByRole("button", {
                name: "Vari Clássico (equipado)",
            }),
        )
        expect(mockEquipItem).not.toHaveBeenCalled()
    })
})
