import { render, screen } from "@testing-library/react"

import { ProgressBar } from "@/components/shared/ProgressBar/ProgressBar"

function getFill(container: HTMLElement) {
    return container.querySelector("[data-slot='progress-fill']")
}

describe("ProgressBar", () => {
    it("deve renderizar com role progressbar e valores acessíveis", () => {
        render(<ProgressBar value={40} />)

        const bar = screen.getByRole("progressbar")

        expect(bar).toHaveAttribute("aria-valuenow", "40")
        expect(bar).toHaveAttribute("aria-valuemin", "0")
        expect(bar).toHaveAttribute("aria-valuemax", "100")
    })

    it("deve preencher proporcionalmente ao value", () => {
        const { container } = render(<ProgressBar value={75} />)

        expect(getFill(container)).toHaveStyle({ width: "75%" })
    })

    it("deve limitar o value acima de 100", () => {
        const { container } = render(<ProgressBar value={150} />)

        expect(getFill(container)).toHaveStyle({ width: "100%" })
        expect(screen.getByRole("progressbar")).toHaveAttribute(
            "aria-valuenow",
            "100",
        )
    })

    it("deve limitar o value abaixo de 0", () => {
        const { container } = render(<ProgressBar value={-20} />)

        expect(getFill(container)).toHaveStyle({ width: "0%" })
        expect(screen.getByRole("progressbar")).toHaveAttribute(
            "aria-valuenow",
            "0",
        )
    })

    it("deve ter transição suave de largura", () => {
        const { container } = render(<ProgressBar value={50} />)

        expect(getFill(container)).toHaveClass("transition-[width]")
    })

    it("deve ser responsiva e mesclar a className externa", () => {
        render(<ProgressBar value={10} className="minha-classe" />)

        const bar = screen.getByRole("progressbar")

        expect(bar).toHaveClass("w-full", "h-1.5", "sm:h-2", "minha-classe")
    })
})
