import { useState } from "react"

import { VariMessageModal } from "@/components/shared/VariMessageModal/VariMessageModal"
import { Button } from "@/components/ui/button"

const SAMPLE_MESSAGE =
    "Seja bem-vindo!  Nosso objetivo é te ajudar a desenvolver diferentes habilidades de maneira fácil. Comece escolhendo uma trilha e dê inicio em sua jornada agora mesmo!\n\nNão se esqueça, em caso de qualquer dúvida, estarei sempre disponível."

/**
 * Página de revisão manual da VAR-34, sem login e fora do fluxo do app.
 * Acesse com `npm run dev` em /preview/vari-message-modal.
 */
export function VariMessageModalPreviewPage() {
    const [open, setOpen] = useState(true)

    return (
        <main className="flex min-h-screen items-center justify-center bg-muted p-4">
            <Button onClick={() => setOpen(true)}>Abrir modal do Vari</Button>

            <VariMessageModal
                open={open}
                onOpenChange={setOpen}
                message={SAMPLE_MESSAGE}
            />
        </main>
    )
}
