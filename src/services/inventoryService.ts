import { api } from "@/services/api"

// Contrato de userManagement.serializers.ItemInventarioSerializer e das views
// InventarioView / EquiparItemView (GET /gamificacao/inventario/ e
// POST /gamificacao/inventario/{inventario_id}/equipar/).

export type ItemTipo = "AVATAR" | "TITULO" | "BORDA"

export type ItemRaridade = "COMUM" | "RARO" | "EPICO" | "LENDARIO"

/** Item cosmético do catálogo (ex.: itens equipados em GET /users/me/). */
export type ItemCosmetico = {
    id: string
    nome: string
    descricao: string
    tipo: ItemTipo
    raridade: ItemRaridade
    /** Caminho relativo do recurso, ex.: "avatares/vari_classico.png". */
    recurso_visual: string
    asset_url: string
}

/**
 * Item do catálogo cosmético com o status de posse do usuário. O endpoint
 * devolve o catálogo inteiro: itens ainda não desbloqueados vêm com
 * `desbloqueado: false`, `id: null` e `desbloqueado_em: null`.
 */
export type ItemInventario = {
    /** ID do registro de inventário (usado para equipar); null se bloqueado. */
    id: string | null
    /** ID do item cosmético no catálogo (sempre presente). */
    item_id: string
    nome: string
    descricao: string
    tipo: ItemTipo
    raridade: ItemRaridade
    /** Caminho relativo do recurso, ex.: "avatares/vari_classico.png". */
    recurso_visual: string
    asset_url: string
    desbloqueado: boolean
    equipado: boolean
    desbloqueado_em: string | null
}

/** Resposta de GET /gamificacao/inventario/: itens agrupados por categoria. */
export type Inventario = {
    avatares: ItemInventario[]
    titulos: ItemInventario[]
    bordas: ItemInventario[]
}

export type InventarioCategoria = keyof Inventario

export type EquiparItemResponse = {
    sucesso: boolean
    item_equipado_id: string
    tipo: ItemTipo
}

export const inventoryService = {
    getInventory: () => api<Inventario>("/gamificacao/inventario/"),

    equipItem: (inventarioId: string) =>
        api<EquiparItemResponse>(
            `/gamificacao/inventario/${encodeURIComponent(inventarioId)}/equipar/`,
            { method: "POST" },
        ),
}
