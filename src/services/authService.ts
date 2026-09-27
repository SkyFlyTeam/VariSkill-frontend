import { api } from "@/services/api"

export type User = {
    id: string
    apelido: string
    nome: string
    email: string
    xp_total: number
    streak_dias: number
    is_primeiro_acesso?: boolean
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
