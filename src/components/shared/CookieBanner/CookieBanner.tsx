import { useState } from "react"

import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

const STORAGE_KEY = "variskill:cookie-consent"

function jaAceitou(): boolean {
    try {
        return localStorage.getItem(STORAGE_KEY) === "aceito"
    } catch {
        // Sem localStorage (modo privado): não insiste no banner.
        return true
    }
}

/**
 * Banner de cookies (VAR-125). O projeto usa apenas cookies essenciais e um
 * funcional; não há cookies de tracking/marketing.
 */
export function CookieBanner() {
    const [visivel, setVisivel] = useState(() => !jaAceitou())

    if (!visivel) return null

    function handleAceitar() {
        try {
            localStorage.setItem(STORAGE_KEY, "aceito")
        } catch {
            // Segue sem persistir a preferência.
        }
        setVisivel(false)
    }

    return (
        <div
            role="dialog"
            aria-label="Aviso de cookies"
            className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-lg sm:inset-x-6 sm:bottom-6 sm:p-5"
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-bold">Cookies do VariSkill</p>
                    <p className="text-xs leading-relaxed text-neutral-600">
                        Usamos apenas cookies essenciais e funcionais:{" "}
                        <strong>sessionid</strong> e <strong>csrftoken</strong>{" "}
                        para manter sua sessão segura, e{" "}
                        <strong>sidebar_state</strong> para lembrar o menu
                        aberto ou fechado. Não usamos cookies de rastreamento ou
                        publicidade.
                    </p>
                    <p className="text-xs text-neutral-600">
                        Saiba mais na página de{" "}
                        <Link
                            to="/privacidade"
                            className="font-bold text-brand-blue hover:underline"
                        >
                            Privacidade
                        </Link>
                        .
                    </p>
                </div>
                <Button
                    type="button"
                    variant="vari"
                    onClick={handleAceitar}
                    className="h-auto shrink-0 rounded-[10px] px-5 py-2.5 text-sm font-bold"
                >
                    Entendi
                </Button>
            </div>
        </div>
    )
}
