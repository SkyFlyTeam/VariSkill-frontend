import type { ItemRaridade } from "@/services/inventoryService"
import { sortByRarity } from "@/utils/rarity"

const item = (nome: string, raridade: ItemRaridade) => ({ nome, raridade })

describe("sortByRarity", () => {
    it("ordena Comum > Raro > Lendário > Épico", () => {
        const sorted = sortByRarity([
            item("Épico", "EPICO"),
            item("Lendário", "LENDARIO"),
            item("Comum", "COMUM"),
            item("Raro", "RARO"),
        ])

        expect(sorted.map((i) => i.raridade)).toEqual([
            "COMUM",
            "RARO",
            "LENDARIO",
            "EPICO",
        ])
    })

    it("preserva a ordem original entre itens da mesma raridade", () => {
        const sorted = sortByRarity([
            item("B", "RARO"),
            item("Z", "COMUM"),
            item("A", "RARO"),
            item("C", "COMUM"),
        ])

        expect(sorted.map((i) => i.nome)).toEqual(["Z", "C", "B", "A"])
    })

    it("não altera o array original", () => {
        const original = [item("Épico", "EPICO"), item("Comum", "COMUM")]
        sortByRarity(original)
        expect(original[0].raridade).toBe("EPICO")
    })
})
