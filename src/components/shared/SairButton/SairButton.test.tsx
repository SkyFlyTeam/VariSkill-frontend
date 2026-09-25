import type { ReactNode } from "react"

import { MemoryRouter, Route, Routes } from "react-router-dom"

import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { SairButton } from "@/components/shared/SairButton/SairButton"
import { AuthProvider } from "@/contexts/authContext"

jest.mock("@/components/ui/sidebar", () => ({
    SidebarMenuButton: ({
        children,
        ...props
    }: {
        children: ReactNode
        onClick?: () => void
        className?: string
    }) => <button {...props}>{children}</button>,
}))

const originalFetch = globalThis.fetch

afterEach(() => {
    globalThis.fetch = originalFetch
    jest.restoreAllMocks()
})

function renderSairButton() {
    return render(
        <MemoryRouter initialEntries={["/"]}>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<SairButton />} />
                    <Route path="/login" element={<p>Login page</p>} />
                </Routes>
            </AuthProvider>
        </MemoryRouter>,
    )
}

describe("SairButton", () => {
    it("deve chamar POST /api/logout/ e voltar para /login ao clicar", async () => {
        const fetchMock = jest.fn().mockResolvedValue({
            ok: true,
            status: 204,
            json: async () => null,
        })
        globalThis.fetch = fetchMock as unknown as typeof fetch

        const user = userEvent.setup()

        renderSairButton()

        await user.click(screen.getByRole("button", { name: /sair/i }))

        await waitFor(() =>
            expect(
                fetchMock.mock.calls.some(([url]) => url === "/api/logout/"),
            ).toBe(true),
        )

        const [url, options] = fetchMock.mock.calls.find(
            ([url]) => url === "/api/logout/",
        ) as [string, RequestInit]

        expect(url).toBe("/api/logout/")
        expect(options).toMatchObject({
            method: "POST",
            credentials: "include",
        })

        expect(await screen.findByText("Login page")).toBeInTheDocument()
    })
})
