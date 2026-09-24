import { MemoryRouter, Route, Routes, useParams } from "react-router-dom"

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { TrackCard } from "@/components/shared/TrackCard/TrackCard"

const baseProps = {
    id: "javascript",
    title: "Javascript",
    image: <span>JS</span>,
    totalModules: 12,
}

function Destination() {
    const { id } = useParams()
    return <h1>Roadmap: {id}</h1>
}

describe("TrackCard", () => {
    it("exibe módulos e calcula o progresso da trilha", () => {
        render(
            <MemoryRouter>
                <TrackCard
                    {...baseProps}
                    variant="in-progress"
                    completedModules={10}
                />
            </MemoryRouter>,
        )

        expect(screen.getByText("10/12 módulos")).toBeInTheDocument()
        expect(screen.getByText("83%")).toBeInTheDocument()
        expect(screen.getByRole("progressbar")).toHaveAttribute(
            "aria-valuenow",
            "83",
        )
        expect(screen.queryByText("Começar")).not.toBeInTheDocument()
        expect(
            screen.getByRole("link", { name: "Continuar trilha Javascript" }),
        ).toHaveAttribute("href", "/trilhas/javascript")
    })

    it("exibe a variante disponível e navega ao clicar em Começar", async () => {
        const user = userEvent.setup()
        render(
            <MemoryRouter>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <TrackCard {...baseProps} variant="available" />
                        }
                    />
                    <Route path="/trilhas/:id" element={<Destination />} />
                </Routes>
            </MemoryRouter>,
        )

        expect(screen.getByText("12 módulos")).toBeInTheDocument()
        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
        await user.click(screen.getByText("Começar"))
        expect(
            screen.getByRole("heading", { name: "Roadmap: javascript" }),
        ).toBeInTheDocument()
    })

    it("permite navegar pelo card usando Tab e Enter", async () => {
        const user = userEvent.setup()
        render(
            <MemoryRouter>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <TrackCard
                                {...baseProps}
                                variant="in-progress"
                                completedModules={6}
                            />
                        }
                    />
                    <Route path="/trilhas/:id" element={<Destination />} />
                </Routes>
            </MemoryRouter>,
        )

        await user.tab()
        expect(
            screen.getByRole("link", { name: "Continuar trilha Javascript" }),
        ).toHaveFocus()
        await user.keyboard("{Enter}")
        expect(
            screen.getByRole("heading", { name: "Roadmap: javascript" }),
        ).toBeInTheDocument()
    })

    it("mantém apenas uma parada de teclado por card disponível", async () => {
        const user = userEvent.setup()
        render(
            <MemoryRouter>
                <TrackCard {...baseProps} variant="available" />
                <TrackCard
                    {...baseProps}
                    id="react"
                    title="React"
                    variant="available"
                />
            </MemoryRouter>,
        )

        await user.tab()
        expect(
            screen.getByRole("link", { name: "Começar trilha Javascript" }),
        ).toHaveFocus()
        await user.tab()
        expect(
            screen.getByRole("link", { name: "Começar trilha React" }),
        ).toHaveFocus()
    })

    it.each([
        [0, 0, "0/0 módulos", "0"],
        [12, 0, "0/12 módulos", "0"],
        [12, 12, "12/12 módulos", "100"],
        [12, 20, "12/12 módulos", "100"],
        [12, -1, "0/12 módulos", "0"],
        [1, 1, "1/1 módulo", "100"],
    ])(
        "trata total %s e concluídos %s",
        (totalModules, completedModules, label, percentage) => {
            render(
                <MemoryRouter>
                    <TrackCard
                        {...baseProps}
                        totalModules={totalModules}
                        variant="in-progress"
                        completedModules={completedModules}
                    />
                </MemoryRouter>,
            )

            expect(screen.getByText(label)).toBeInTheDocument()
            expect(screen.getByRole("progressbar")).toHaveAttribute(
                "aria-valuenow",
                percentage,
            )
        },
    )
})
