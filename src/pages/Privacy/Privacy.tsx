import { useEffect, useState } from "react"

import { Download, ScrollText, ShieldCheck } from "lucide-react"

import { MarkdownViewer } from "@/components/shared/MarkdownViewer/MarkdownViewer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/authContext"
import { userService } from "@/services/userService"

const TERMOS_PATH = "/docs/Termos_uso.md"
const EMAIL_PRIVACIDADE = "skyfly.organization@gmail.com"
const TERMOS_VERSAO = "1.1"
const TERMOS_ATUALIZADO_EM = "19/11/2026"

type Aba = "exportar" | "revogar" | "termos"

const abas: { id: Aba; label: string; icon: typeof Download }[] = [
    { id: "exportar", label: "Exportar dados", icon: Download },
    { id: "revogar", label: "Revogar dados", icon: ShieldCheck },
    { id: "termos", label: "Termos de aceite", icon: ScrollText },
]

const labelClassName = "text-[14px] leading-[20px] font-medium text-[#101828]"

export function PrivacyPage() {
    const { user } = useAuth()
    const [aba, setAba] = useState<Aba>("exportar")
    const [exportando, setExportando] = useState(false)
    const [exportError, setExportError] = useState<string | null>(null)
    const [exportSuccess, setExportSuccess] = useState<string | null>(null)
    const [termos, setTermos] = useState("")
    const [termosError, setTermosError] = useState<string | null>(null)

    useEffect(() => {
        if (aba !== "termos" || termos || termosError) return

        let active = true

        fetch(TERMOS_PATH)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Falha ao carregar os termos.")
                }
                return response.text()
            })
            .then((text) => {
                if (active) {
                    setTermos(text)
                    setTermosError(null)
                }
            })
            .catch(() => {
                if (active) {
                    setTermosError(
                        "Não foi possível carregar os Termos de Uso. Tente novamente mais tarde.",
                    )
                }
            })

        return () => {
            active = false
        }
    }, [aba, termos, termosError])

    async function handleExportar() {
        setExportError(null)
        setExportSuccess(null)
        setExportando(true)

        try {
            const blob = await userService.exportMyDataCsv()
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = "variskill-meus-dados.csv"
            document.body.appendChild(link)
            link.click()
            link.remove()
            URL.revokeObjectURL(url)
            setExportSuccess(
                "Exportação gerada. O download deve começar agora.",
            )
        } catch {
            setExportError(
                "Não foi possível gerar sua exportação agora. Tente novamente.",
            )
        } finally {
            setExportando(false)
        }
    }

    return (
        <main className="min-h-screen bg-page px-4 py-8 text-slate-900 sm:px-8">
            <div className="mx-auto w-full max-w-4xl">
                <header className="rounded-3xl bg-white px-6 py-8 sm:px-10">
                    <h1 className="font-poppins text-2xl font-bold text-[#101828]">
                        Privacidade e seus dados
                    </h1>
                    <p className="mt-2 text-sm text-neutral-600">
                        Consulte os termos aceitos, baixe uma cópia dos seus
                        dados ou solicite a revogação do consentimento.
                    </p>

                    <div
                        role="tablist"
                        aria-label="Seções de privacidade"
                        className="mt-6 flex flex-wrap gap-2"
                    >
                        {abas.map((item) => {
                            const Icone = item.icon
                            const ativa = aba === item.id
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={ativa}
                                    onClick={() => setAba(item.id)}
                                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                                        ativa
                                            ? "bg-brand-navy text-white"
                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                                >
                                    <Icone className="size-4" />
                                    {item.label}
                                </button>
                            )
                        })}
                    </div>
                </header>

                <section className="mt-4 rounded-3xl bg-white px-6 py-8 sm:px-10">
                    {aba === "exportar" && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-base font-bold text-[#101828]">
                                    Exportar seus dados
                                </h2>
                                <p className="mt-1 text-sm text-neutral-600">
                                    Geramos um arquivo CSV com perfil,
                                    consentimento, interesses, matrículas,
                                    progresso, atividades e conversas.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="export-email"
                                    className={labelClassName}
                                >
                                    E-mail da conta
                                </label>
                                <Input
                                    id="export-email"
                                    type="email"
                                    value={user?.email ?? ""}
                                    readOnly
                                    aria-readonly="true"
                                    className="h-10 rounded-[10px] border border-[#cad5e2] bg-slate-50 px-3 text-sm shadow-none"
                                />
                                <p className="text-xs text-neutral-500">
                                    A exportação é sempre dos dados da conta
                                    logada.
                                </p>
                            </div>

                            <Button
                                type="button"
                                variant="vari"
                                onClick={handleExportar}
                                disabled={exportando}
                                className="h-auto rounded-[10px] px-6 py-3 text-sm font-bold"
                            >
                                {exportando
                                    ? "Gerando exportação..."
                                    : "Baixar meus dados (.csv)"}
                            </Button>

                            {exportSuccess && (
                                <p
                                    role="status"
                                    className="text-sm text-green-700"
                                >
                                    {exportSuccess}
                                </p>
                            )}
                            {exportError && (
                                <p
                                    role="alert"
                                    className="text-sm text-destructive"
                                >
                                    {exportError}
                                </p>
                            )}
                        </div>
                    )}

                    {aba === "revogar" && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-base font-bold text-[#101828]">
                                    Revogar consentimento
                                </h2>
                                <p className="mt-1 text-sm text-neutral-600">
                                    Quer revogar seus dados? Entre em contato
                                    pelo nosso e-mail e a equipe responsável
                                    fará a revogação do consentimento.
                                </p>
                            </div>

                            <a
                                href={`mailto:${EMAIL_PRIVACIDADE}?subject=Revoga%C3%A7%C3%A3o%20de%20dados%20-%20VariSkill`}
                                className="inline-flex items-center gap-2 rounded-[10px] bg-brand-navy px-6 py-3 text-sm font-bold text-white hover:opacity-90"
                            >
                                <ShieldCheck className="size-4" />
                                {EMAIL_PRIVACIDADE}
                            </a>

                            <p className="text-xs text-neutral-500">
                                A revogação não apaga automaticamente sua conta:
                                ela interrompe o tratamento e é registrada na
                                auditoria do projeto.
                            </p>
                        </div>
                    )}

                    {aba === "termos" && (
                        <div>
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <h2 className="text-base font-bold text-[#101828]">
                                    Termos de Uso e Aviso de Privacidade
                                </h2>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                    Versão {TERMOS_VERSAO} ·{" "}
                                    {TERMOS_ATUALIZADO_EM}
                                </span>
                            </div>

                            {termosError ? (
                                <p
                                    role="alert"
                                    className="text-sm text-destructive"
                                >
                                    {termosError}
                                </p>
                            ) : !termos && !termosError ? (
                                <p className="text-sm text-slate-500">
                                    Carregando Termos de Uso...
                                </p>
                            ) : (
                                <MarkdownViewer content={termos} />
                            )}
                        </div>
                    )}
                </section>
            </div>
        </main>
    )
}
