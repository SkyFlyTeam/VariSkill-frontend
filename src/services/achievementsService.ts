import { api } from "@/services/api"

// Contrato de userManagement.serializers.ConquistaUsuarioSerializer
// (GET /gamificacao/conquistas/).

export type ConquistaCategoria = "PROGRESSO" | "STREAK" | "PRECISAO"

export type Conquista = {
    id: string
    codigo: string
    titulo: string
    descricao: string
    categoria: ConquistaCategoria
    icone: string
    xp_recompensa: number
    ordem: number
    desbloqueada: boolean
    /** ISO 8601; null enquanto a conquista estiver bloqueada. */
    desbloqueada_em: string | null
}

export const achievementsService = {
    getAchievements: () => api<Conquista[]>("/gamificacao/conquistas/"),
}
