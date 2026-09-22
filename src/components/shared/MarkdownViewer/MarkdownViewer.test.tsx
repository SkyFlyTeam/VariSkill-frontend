import { render, screen } from "@testing-library/react"

import { MarkdownViewer } from "@/components/shared/MarkdownViewer/MarkdownViewer"

describe("MarkdownViewer", () => {
    it("deve renderizar um título e um parágrafo", () => {
        render(<MarkdownViewer content={"# Título\n\nUm parágrafo simples."} />)

        expect(
            screen.getByRole("heading", { level: 1, name: "Título" }),
        ).toBeInTheDocument()

        expect(screen.getByText("Um parágrafo simples.")).toBeInTheDocument()
    })

    it("deve diferenciar código inline de bloco de código", () => {
        render(
            <MarkdownViewer
                content={"Use `npm install`.\n\n```js\nconst a = 1\n```"}
            />,
        )

        const inlineCode = screen.getByText("npm install")

        expect(inlineCode.tagName).toBe("CODE")
        expect(inlineCode).toHaveClass("bg-muted")

        const blockCode = document.querySelector("pre code")

        expect(blockCode).toBeInTheDocument()
        expect(blockCode?.className).toContain("language-js")
    })

    it("deve renderizar links abrindo em nova aba com rel seguro", () => {
        render(<MarkdownViewer content={"[OpenAI](https://openai.com)"} />)

        const link = screen.getByRole("link", { name: "OpenAI" })

        expect(link).toHaveAttribute("href", "https://openai.com")
        expect(link).toHaveAttribute("target", "_blank")
        expect(link).toHaveAttribute("rel", "noreferrer")
    })

    it("deve renderizar listas ordenadas e não ordenadas", () => {
        render(
            <MarkdownViewer
                content={"- um\n- dois\n- três\n\n1. passo\n2. passo"}
            />,
        )

        expect(screen.getAllByRole("listitem")).toHaveLength(5)

        const lists = document.querySelectorAll("ul, ol")

        expect(lists).toHaveLength(2)
    })

    it("deve renderizar uma tabela GFM com cabeçalho e células", () => {
        render(
            <MarkdownViewer
                content={"| Nome | XP |\n| --- | --- |\n| Ana | 40 |"}
            />,
        )

        expect(screen.getByRole("table")).toBeInTheDocument()
        expect(
            screen.getByRole("columnheader", { name: "Nome" }),
        ).toBeInTheDocument()
        expect(screen.getByRole("cell", { name: "Ana" })).toBeInTheDocument()
    })

    it("deve renderizar um documento completo e mesclar a className externa", () => {
        const content = [
            "# Guia",
            "",
            "Texto com **negrito** e *itálico*.",
            "",
            "> Uma citação.",
            "",
            "```python",
            'print("oi")',
            "```",
        ].join("\n")

        const { container } = render(
            <MarkdownViewer content={content} className="minha-classe" />,
        )

        expect(container.firstElementChild).toHaveClass(
            "markdown-viewer",
            "minha-classe",
        )
        expect(
            screen.getByRole("heading", { level: 1, name: "Guia" }),
        ).toBeInTheDocument()
        expect(screen.getByText("negrito").tagName).toBe("STRONG")
        expect(document.querySelector("blockquote")).toBeInTheDocument()
        expect(document.querySelector("pre code")).toBeInTheDocument()
    })
})
