/** @jest-environment node */
import { achievementsService } from "@/services/achievementsService"
import { ApiError } from "@/services/api"
import { inventoryService } from "@/services/inventoryService"

const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
const originalFetch = globalThis.fetch
const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    })

beforeEach(() => {
    fetchMock.mockReset()
    globalThis.fetch = fetchMock
    Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: { cookie: "csrftoken=token-123" },
    })
})
afterAll(() => {
    globalThis.fetch = originalFetch
    Reflect.deleteProperty(globalThis, "document")
})

describe("inventoryService", () => {
    it("carrega o inventário agrupado por categoria", async () => {
        const inventario = { avatares: [], titulos: [], bordas: [] }
        fetchMock.mockResolvedValue(json(inventario))

        await expect(inventoryService.getInventory()).resolves.toEqual(
            inventario,
        )
        expect(fetchMock).toHaveBeenCalledWith(
            "/api/gamificacao/inventario/",
            expect.objectContaining({ method: "GET", credentials: "include" }),
        )
    })

    it("equipa o item via POST com token CSRF", async () => {
        const resposta = {
            sucesso: true,
            item_equipado_id: "inv-1",
            tipo: "AVATAR",
        }
        fetchMock.mockResolvedValue(json(resposta))

        await expect(inventoryService.equipItem("inv-1")).resolves.toEqual(
            resposta,
        )
        const [url, options] = fetchMock.mock.calls[0]
        expect(url).toBe("/api/gamificacao/inventario/inv-1/equipar/")
        expect(options).toMatchObject({
            method: "POST",
            credentials: "include",
        })
        expect(new Headers(options?.headers).get("X-CSRFToken")).toBe(
            "token-123",
        )
    })

    it("propaga 404 ao equipar item de outro usuário", async () => {
        fetchMock.mockResolvedValue(
            json(
                { detail: "Item não encontrado no inventário do usuário." },
                404,
            ),
        )
        await expect(inventoryService.equipItem("x")).rejects.toBeInstanceOf(
            ApiError,
        )
    })
})

describe("achievementsService", () => {
    it("carrega o catálogo de conquistas", async () => {
        fetchMock.mockResolvedValue(json([]))

        await expect(achievementsService.getAchievements()).resolves.toEqual([])
        expect(fetchMock).toHaveBeenCalledWith(
            "/api/gamificacao/conquistas/",
            expect.objectContaining({ method: "GET", credentials: "include" }),
        )
    })
})
