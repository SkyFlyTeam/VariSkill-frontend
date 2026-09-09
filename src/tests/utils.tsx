import type { ReactElement } from "react"

import { MemoryRouter } from "react-router-dom"

import { render } from "@testing-library/react"

import { AuthProvider } from "@/contexts/authContext"

export function renderWithProviders(ui: ReactElement) {
    return render(
        <MemoryRouter>
            <AuthProvider>{ui}</AuthProvider>
        </MemoryRouter>,
    )
}
