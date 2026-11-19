import { useCallback, useEffect, useState } from "react"

import {
    type Inventario,
    type InventarioCategoria,
    type ItemInventario,
    type ItemTipo,
    inventoryService,
} from "@/services/inventoryService"
import { sortByRarity } from "@/utils/rarity"

export const CATEGORIA_POR_TIPO: Record<ItemTipo, InventarioCategoria> = {
    AVATAR: "avatares",
    TITULO: "titulos",
    BORDA: "bordas",
}

const EMPTY_INVENTORY: Inventario = { avatares: [], titulos: [], bordas: [] }

/** Marca `item` como equipado e desequipa os demais da mesma categoria. */
function withEquipped(inventory: Inventario, item: ItemInventario): Inventario {
    const categoria = CATEGORIA_POR_TIPO[item.tipo]
    return {
        ...inventory,
        [categoria]: inventory[categoria].map((current) => ({
            ...current,
            equipado: current.item_id === item.item_id,
        })),
    }
}

export type UseInventoryResult = {
    inventory: Inventario
    loading: boolean
    error: string | null
    /** `item_id` do item com requisição de equipar em andamento. */
    equippingId: string | null
    equip: (item: ItemInventario) => Promise<boolean>
    reload: () => Promise<void>
}

export function useInventory(): UseInventoryResult {
    const [inventory, setInventory] = useState<Inventario>(EMPTY_INVENTORY)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [equippingId, setEquippingId] = useState<string | null>(null)

    const reload = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await inventoryService.getInventory()
            setInventory({
                avatares: sortByRarity(data.avatares),
                titulos: sortByRarity(data.titulos),
                bordas: sortByRarity(data.bordas),
            })
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível carregar o inventário.",
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void reload()
    }, [reload])

    const equip = useCallback(
        async (item: ItemInventario) => {
            if (item.equipado) return true
            // Itens bloqueados não têm registro de inventário para equipar.
            const inventarioId = item.id
            if (!item.desbloqueado || !inventarioId) return false

            const categoria = CATEGORIA_POR_TIPO[item.tipo]
            const previousEquipped = inventory[categoria].find(
                (current) => current.equipado,
            )
            // Atualização otimista: a UI reflete a escolha imediatamente.
            setInventory((current) => withEquipped(current, item))
            setEquippingId(item.item_id)
            try {
                await inventoryService.equipItem(inventarioId)
                return true
            } catch {
                // Reverte apenas a categoria afetada para o estado anterior.
                setInventory((current) => ({
                    ...current,
                    [categoria]: current[categoria].map((entry) => ({
                        ...entry,
                        equipado: entry.item_id === previousEquipped?.item_id,
                    })),
                }))
                return false
            } finally {
                setEquippingId(null)
            }
        },
        [inventory],
    )

    return { inventory, loading, error, equippingId, equip, reload }
}
