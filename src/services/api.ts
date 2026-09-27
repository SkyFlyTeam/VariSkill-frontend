// Mesmo domínio do Frontend: /api é encaminhado ao Django pelo proxy.
const API_URL = "/api"

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"])

export class ApiError extends Error {
    status: number
    data: unknown

    constructor(message: string, status: number, data: unknown = null) {
        super(message)
        this.name = "ApiError"
        this.status = status
        this.data = data
    }
}

/** Erros por campo devolvidos pelo backend (HTTP 400). */
export function getFieldErrors(error: unknown): Record<string, string> {
    if (!(error instanceof ApiError) || error.status !== 400) {
        return {}
    }

    const data = error.data

    if (!data || typeof data !== "object") {
        return {}
    }

    const result: Record<string, string> = {}

    for (const [field, value] of Object.entries(
        data as Record<string, unknown>,
    )) {
        if (Array.isArray(value) && value.length > 0) {
            result[field] = String(value[0])
        } else if (typeof value === "string") {
            result[field] = value
        }
    }

    return result
}

function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
    return match ? decodeURIComponent(match[1]) : null
}

function extractMessage(body: unknown): string | null {
    if (!body || typeof body !== "object") return null

    const data = body as Record<string, unknown>

    if (typeof data.detail === "string") return data.detail

    for (const value of Object.values(data)) {
        if (Array.isArray(value) && typeof value[0] === "string") {
            return value[0]
        }
    }

    return null
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
    const method = (init.method ?? "GET").toUpperCase()
    const headers = new Headers(init.headers)
    headers.set("Content-Type", "application/json")

    // O login Django cria/rotaciona csrftoken. Ler a cada chamada evita usar
    // um token antigo depois da confirmação da senha atual.
    if (UNSAFE_METHODS.has(method)) {
        const csrfToken = getCookie("csrftoken")
        if (csrfToken) headers.set("X-CSRFToken", csrfToken)
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...init,
        method,
        headers,
        credentials: "include",
    })

    if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new ApiError(
            extractMessage(body) ?? "Ocorreu um erro inesperado.",
            response.status,
            body,
        )
    }

    if (response.status === 204) return undefined as T

    const contentType = response.headers?.get("content-type")
    if (contentType && !contentType.includes("application/json")) {
        if (path === "/auth/logout/") return undefined as T
        throw new Error(
            "A API retornou uma resposta inválida. Verifique a conexão com o backend.",
        )
    }

    return response.json()
}
