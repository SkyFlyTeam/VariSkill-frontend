import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { api } from "@/services/api"

import { InstantAnswerFeedback } from "./InstantAnswerFeedback"
import { instantAnswerId } from "./instantAnswer"

jest.mock("@/services/api", () => ({
    api: jest.fn(),
}))

const mockedApi = api as jest.MockedFunction<typeof api>

describe("instantAnswerId", () => {
    it("retorna o id apenas para respostas do cache semântico", () => {
        expect(instantAnswerId("CACHE_SEMANTICO", "duvida-1")).toBe("duvida-1")
        expect(instantAnswerId("CACHE_SEMANTICO", null)).toBeUndefined()
        expect(instantAnswerId("IA_EXTERNA", "duvida-1")).toBeUndefined()
        expect(instantAnswerId(undefined, undefined)).toBeUndefined()
    })
})

describe("InstantAnswerFeedback", () => {
    beforeEach(() => {
        mockedApi.mockReset()
    })

    it("exibe o selo de resposta instantânea e os botões de feedback", () => {
        render(<InstantAnswerFeedback duvidaId="duvida-1" />)

        expect(screen.getByText("Resposta instantânea")).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: "Sim, a resposta ajudou" }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: "Não, a resposta não ajudou" }),
        ).toBeInTheDocument()
    })

    it("envia feedback negativo e agradece", async () => {
        const user = userEvent.setup()
        mockedApi.mockResolvedValueOnce({ sucesso: true })
        render(<InstantAnswerFeedback duvidaId="duvida-1" />)

        await user.click(
            screen.getByRole("button", { name: "Não, a resposta não ajudou" }),
        )

        expect(mockedApi).toHaveBeenCalledWith(
            "/chat/duvidas/duvida-1/feedback/",
            { method: "POST", body: JSON.stringify({ util: false }) },
        )
        expect(await screen.findByRole("status")).toHaveTextContent(
            "Obrigado pelo feedback!",
        )
        expect(
            screen.queryByRole("button", { name: /a resposta/ }),
        ).not.toBeInTheDocument()
    })

    it("mantém os botões e avisa quando o envio falha", async () => {
        const user = userEvent.setup()
        mockedApi.mockRejectedValueOnce(new Error("falhou"))
        render(<InstantAnswerFeedback duvidaId="duvida-1" />)

        await user.click(
            screen.getByRole("button", { name: "Sim, a resposta ajudou" }),
        )

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Não foi possível enviar o feedback",
        )
        expect(
            screen.getByRole("button", { name: "Sim, a resposta ajudou" }),
        ).toBeEnabled()
    })
})
