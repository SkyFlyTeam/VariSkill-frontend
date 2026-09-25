import { fireEvent, render, screen, within } from "@testing-library/react"

import {
    ActivityResultModal,
    type ActivitySubmissionResult,
} from "./ActivityResultModal"

const APPROVED: ActivitySubmissionResult = {
    execucao_id: "exec-1",
    aprovado: true,
    taxa_acerto: 80,
    pontuacao_obtida: 40,
    xp_concedido: 50,
    novo_xp_total: 4617,
    executado_em: "2026-09-23T18:42:10Z",
    questoes_feedback: [
        { questao_id: "q1", correta: true, explicacao: "Explicação 1" },
        { questao_id: "q2", correta: false, explicacao: "Explicação 2" },
    ],
}

const FAILED: ActivitySubmissionResult = {
    ...APPROVED,
    execucao_id: "exec-2",
    aprovado: false,
    taxa_acerto: 40,
    pontuacao_obtida: 20,
    xp_concedido: 0,
    novo_xp_total: 4567,
}

function renderModal(
    result: ActivitySubmissionResult,
    handlers: { onContinue?: () => void; onRetry?: () => void } = {},
) {
    return render(
        <ActivityResultModal
            open
            result={result}
            onContinue={handlers.onContinue ?? (() => {})}
            onRetry={handlers.onRetry ?? (() => {})}
        />,
    )
}

describe("ActivityResultModal", () => {
    describe("aprovado", () => {
        it("celebra a aprovação com o mascote comemorando e a taxa de acerto", () => {
            renderModal(APPROVED)

            expect(
                screen.getByRole("heading", {
                    name: "Parabéns, você foi aprovado!",
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole("img", { name: /comemorando/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/acertou 80% das questões/i),
            ).toBeInTheDocument()
        })

        it("exibe pontuação obtida e XP concedido em separado, com o total", () => {
            renderModal(APPROVED)

            expect(screen.getByText("40 pts")).toBeInTheDocument()
            expect(screen.getByText("+50 XP")).toBeInTheDocument()
            expect(screen.getByText("Total: 4.617 XP")).toBeInTheDocument()
        })

        it("exibe a data da realização (executado_em)", () => {
            renderModal(APPROVED)

            expect(
                screen.getByText(/Realizado em 23 de setembro de 2026/),
            ).toBeInTheDocument()
        })

        it("oferece 'Continuar' e chama onContinue ao clicar", () => {
            const onContinue = jest.fn()
            const onRetry = jest.fn()
            renderModal(APPROVED, { onContinue, onRetry })

            expect(
                screen.queryByRole("button", { name: "Tentar Novamente" }),
            ).not.toBeInTheDocument()

            fireEvent.click(screen.getByRole("button", { name: "Continuar" }))

            expect(onContinue).toHaveBeenCalledTimes(1)
            expect(onRetry).not.toHaveBeenCalled()
        })

        it("segue o `aprovado` da API, inclusive no limite de 70%", () => {
            renderModal({ ...APPROVED, taxa_acerto: 70 })

            expect(
                screen.getByRole("button", { name: "Continuar" }),
            ).toBeInTheDocument()
        })
    })

    describe("reprovado", () => {
        it("mostra o feedback de reprovação com o mascote e a nota de corte", () => {
            renderModal(FAILED)

            expect(
                screen.getByRole("heading", {
                    name: "Quase lá! Vamos tentar de novo",
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole("img", { name: /tentar de novo/i }),
            ).toBeInTheDocument()
            expect(screen.getByText(/nota de corte é 70%/i)).toBeInTheDocument()
        })

        it("mantém pontuação obtida separada de um XP concedido zerado", () => {
            renderModal(FAILED)

            expect(screen.getByText("20 pts")).toBeInTheDocument()
            expect(screen.getByText("0 XP")).toBeInTheDocument()
            expect(screen.queryByText("+0 XP")).not.toBeInTheDocument()
        })

        it("oferece 'Tentar Novamente' e chama onRetry ao clicar", () => {
            const onContinue = jest.fn()
            const onRetry = jest.fn()
            renderModal(FAILED, { onContinue, onRetry })

            expect(
                screen.queryByRole("button", { name: "Continuar" }),
            ).not.toBeInTheDocument()

            fireEvent.click(
                screen.getByRole("button", { name: "Tentar Novamente" }),
            )

            expect(onRetry).toHaveBeenCalledTimes(1)
            expect(onContinue).not.toHaveBeenCalled()
        })
    })

    describe("parecer por questão", () => {
        it("lista cada questão com o status e a explicação pedagógica", () => {
            renderModal(FAILED)

            const items = within(
                screen.getByRole("region", { name: "Parecer por questão" }),
            ).getAllByRole("listitem")

            expect(items).toHaveLength(2)
            expect(items[0]).toHaveTextContent("Questão 1 — Correta")
            expect(items[0]).toHaveTextContent("Explicação 1")
            expect(items[1]).toHaveTextContent("Questão 2 — Incorreta")
            expect(items[1]).toHaveTextContent("Explicação 2")
        })
    })

    it("não fecha com Esc: só os botões encerram o modal", () => {
        renderModal(APPROVED)

        fireEvent.keyDown(document.body, { key: "Escape" })

        expect(
            screen.getByRole("heading", {
                name: "Parabéns, você foi aprovado!",
            }),
        ).toBeInTheDocument()
    })
})
