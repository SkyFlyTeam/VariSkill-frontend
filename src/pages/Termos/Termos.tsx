import { useEffect, useState } from "react"

import { Link } from "react-router-dom"

import { MarkdownViewer } from "@/components/shared/MarkdownViewer/MarkdownViewer"

const TERMOS_PATH = "/docs/Termos_uso.md"

export function TermosPage() {
    const [content, setContent] = useState("")
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let active = true

        fetch(TERMOS_PATH)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Falha ao carregar os termos.")
                }
                return response.text()
            })
            .then((text) => {
                if (active) setContent(text)
            })
            .catch(() => {
                if (active) {
                    setError(
                        "Não foi possível carregar os Termos de Uso. Tente novamente mais tarde.",
                    )
                }
            })

        return () => {
            active = false
        }
    }, [])

    return (
        <main className="min-h-screen bg-[#e8ebef] px-4 py-8 text-slate-900 sm:px-8">
            <article className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm sm:p-10">
                <div className="mb-6 flex justify-end">
                    <Link
                        to="/registro"
                        className="text-sm font-bold text-vari hover:underline"
                    >
                        Voltar ao cadastro
                    </Link>
                </div>

                {error ? (
                    <p role="alert" className="text-sm text-destructive">
                        {error}
                    </p>
                ) : content ? (
                    <MarkdownViewer content={content} />
                ) : (
                    <p className="text-sm text-slate-500">
                        Carregando Termos de Uso...
                    </p>
                )}
            </article>
        </main>
    )
}
