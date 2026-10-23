import { Lightbulb } from "lucide-react"

export type ReforcoPedagogico = {
    modulo_id: string
    titulo: string
    taxa_acerto: number
}

type ReinforcementBannerProps = {
    reforco: ReforcoPedagogico
}

export function ReinforcementBanner({ reforco }: ReinforcementBannerProps) {
    return (
        <div
            role="status"
            className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900"
        >
            <Lightbulb className="size-4 shrink-0 text-amber-500" />
            <p className="min-w-0">
                <span className="font-semibold">Momento de reforço:</span>{" "}
                {reforco.titulo}
                <span className="text-amber-700">
                    {" "}
                    · {Math.round(reforco.taxa_acerto)}% de acertos
                </span>
            </p>
        </div>
    )
}
