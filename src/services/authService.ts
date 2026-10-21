import { api } from "@/services/api"

export type ProgressoNivel = {
    nivel: number
    xp_atual: number
    xp_min_faixa: number
    xp_proximo_nivel: number
    xp_restante: number
    progresso_pct: number
}

export type User = {
    id: string
    apelido: string
    nome: string
    email: string
    xp_total: number
    streak_dias: number
    is_primeiro_acesso?: boolean
    sexo?: "M" | "F" | null
    idade?: number | null
    interesses?: { id: string; nome: string }[]
    nivel?: number
    progresso_nivel?: ProgressoNivel
}

export type RegisterPayload = {
    apelido: string
    nome: string
    email: string
    password: string
}

export function login(email: string, password: string) {
    return api<User>("/login/", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    })
}

export function register(payload: RegisterPayload) {
    return api<User>("/register/", {
        method: "POST",
        body: JSON.stringify(payload),
    })
}

export function logout() {
    return api<void>("/logout/", { method: "POST" })
}

export function me() {
    return api<User>("/users/me/")
}

export function completeOnboarding() {
    return api<User>("/users/me/", {
        method: "PATCH",
        body: JSON.stringify({ is_primeiro_acesso: false }),
    })
}
