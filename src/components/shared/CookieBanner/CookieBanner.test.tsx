import { MemoryRouter } from "react-router-dom"

import { fireEvent, render, screen } from "@testing-library/react"

import { CookieBanner } from "@/components/shared/CookieBanner/CookieBanner"

function renderBanner() {
    return render(
        <MemoryRouter>
            <CookieBanner />
        </MemoryRouter>,
    )
}

beforeEach(() => {
    localStorage.clear()
})

describe("CookieBanner", () => {
    it("informa os cookies usados e não menciona tracking", () => {
        renderBanner()

        expect(
            screen.getByRole("dialog", { name: /aviso de cookies/i }),
        ).toBeInTheDocument()
        expect(screen.getByText(/sessionid/)).toBeInTheDocument()
        expect(screen.getByText(/csrftoken/)).toBeInTheDocument()
        expect(screen.getByText(/sidebar_state/)).toBeInTheDocument()
        expect(
            screen.getByText(/não usamos cookies de rastreamento/i),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("link", { name: /privacidade/i }),
        ).toHaveAttribute("href", "/privacidade")
    })

    it("some ao aceitar e não volta na próxima visita", () => {
        const { unmount } = renderBanner()

        fireEvent.click(screen.getByRole("button", { name: /entendi/i }))

        expect(
            screen.queryByRole("dialog", { name: /aviso de cookies/i }),
        ).not.toBeInTheDocument()
        expect(localStorage.getItem("variskill:cookie-consent")).toBe("aceito")

        unmount()
        renderBanner()

        expect(
            screen.queryByRole("dialog", { name: /aviso de cookies/i }),
        ).not.toBeInTheDocument()
    })
})
