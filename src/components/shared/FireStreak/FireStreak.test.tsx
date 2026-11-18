import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { FireStreak } from "./FireStreak"

describe("FireStreak", () => {
    it("fica aceso quando o usuário praticou hoje", () => {
        render(<FireStreak count={5} record={8} active />)

        const trigger = screen.getByLabelText(/Sequência de 5 dias/)
        expect(trigger).toHaveAttribute("data-state", "lit")
        expect(trigger).toHaveAccessibleName(
            "Sequência de 5 dias. Você já praticou hoje. Recorde: 8 dias.",
        )
    })

    it("fica inativo quando o usuário ainda não praticou hoje", () => {
        render(<FireStreak count={1} record={1} active={false} />)

        const trigger = screen.getByLabelText(/Sequência de 1 dia\./)
        expect(trigger).toHaveAttribute("data-state", "inactive")
        expect(trigger).toHaveAccessibleName(
            "Sequência de 1 dia. Pratique hoje para manter sua sequência. Recorde: 1 dia.",
        )
    })

    it("exibe o contador apenas na variante badge", () => {
        const { rerender } = render(
            <FireStreak count={12} record={20} active variant="badge" />,
        )
        expect(screen.getByText("12")).toBeInTheDocument()

        rerender(<FireStreak count={12} record={20} active />)
        expect(screen.queryByText("12")).not.toBeInTheDocument()
    })

    it("mostra o recorde no tooltip ao passar o mouse", async () => {
        const user = userEvent.setup()
        render(<FireStreak count={3} record={9} active />)

        await user.hover(screen.getByLabelText(/Sequência de 3 dias/))

        expect(await screen.findByText("9 dias")).toBeInTheDocument()
    })
})
