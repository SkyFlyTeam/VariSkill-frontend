export class ApiError extends Error {
    status: number
    data: unknown

    constructor(status: number, data: unknown) {
        super(`Request failed with status ${status}`)
        this.name = "ApiError"
        this.status = status
        this.data = data
    }
}

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
    const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`))
    return match ? decodeURIComponent(match[2]) : null
}

export async function http<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const method = (options.method ?? "GET").toUpperCase()
    const headers = new Headers(options.headers)

    if (options.body !== undefined && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json")
    }

    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
        const csrfToken = getCookie("csrftoken")
        if (csrfToken) {
            headers.set("X-CSRFToken", csrfToken)
        }
    }

    const response = await fetch(path, {
        ...options,
        method,
        headers,
        credentials: "include",
    })

    const data =
        response.status === 204 ? null : await response.json().catch(() => null)

    if (!response.ok) {
        throw new ApiError(response.status, data)
    }

    return data as T
}
