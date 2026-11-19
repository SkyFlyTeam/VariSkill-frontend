import type { ItemRaridade } from "@/services/inventoryService"

/** Ordem de exibição das raridades no inventário. */
export const RARITY_ORDER: readonly ItemRaridade[] = [
    "COMUM",
    "RARO",
    "LENDARIO",
    "EPICO",
]

function rarityRank(raridade: ItemRaridade): number {
    const index = RARITY_ORDER.indexOf(raridade)
    // Raridades desconhecidas vão para o fim.
    return index === -1 ? RARITY_ORDER.length : index
}

/** Retorna uma cópia ordenada por raridade, preservando a ordem original em empates. */
export function sortByRarity<T extends { raridade: ItemRaridade }>(
    items: readonly T[],
): T[] {
    return [...items].sort(
        (a, b) => rarityRank(a.raridade) - rarityRank(b.raridade),
    )
}
