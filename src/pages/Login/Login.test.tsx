import { screen } from "@testing-library/react"

import { LoginPage } from "@/pages/Login/Login"
import { renderWithProviders } from "@/tests/utils"

describe("LoginPage", () => {
    it("deve renderizar a tela de login", () => {
        renderWithProviders(<LoginPage />)

        expect(
            screen.getByRole("heading", {
                name: /login/i,
            }),
        ).toBeInTheDocument()

        expect(screen.getByPlaceholderText("seu@email.com")).toBeInTheDocument()

        expect(screen.getByPlaceholderText("Sua senha")).toBeInTheDocument()

        expect(
            screen.getByRole("button", {
                name: /entrar/i,
            }),
        ).toBeInTheDocument()
    })
})
