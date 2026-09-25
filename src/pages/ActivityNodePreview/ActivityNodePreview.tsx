import { useState } from "react"

import {
    ActivityNode,
    type ActivityPurpose,
    type ActivityStatus,
} from "@/components/shared/ActivityNode/ActivityNode"

const purposes: ActivityPurpose[] = ["theoretical", "practical", "exam"]
const statuses: ActivityStatus[] = ["locked", "in_progress", "completed"]
const titles: Record<ActivityPurpose, string> = {
    theoretical: "Variáveis",
    practical: "Complete o código",
    exam: "Revisão da unidade",
}

const statusLabels: Record<ActivityStatus, string> = {
    locked: "bloqueado",
    in_progress: "em andamento",
    completed: "concluído",
}

/**
 * Página de revisão manual da VAR-51, sem login e sem backend.
 * Acesse com `npm run dev` em /preview/activity-node.
 */
export function ActivityNodePreviewPage() {
    const [clicked, setClicked] = useState<string | null>(null)

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted p-6">
            <h1 className="text-xl font-bold">Nodes de atividade (VAR-51)</h1>

            <div className="flex flex-wrap justify-center gap-4">
                {purposes.map((purpose) =>
                    statuses.map((status) => (
                        <ActivityNode
                            key={`${purpose}-${status}`}
                            title={titles[purpose]}
                            purpose={purpose}
                            status={status}
                            onClick={() =>
                                setClicked(
                                    `${titles[purpose]} (${statusLabels[status]})`,
                                )
                            }
                        />
                    )),
                )}
            </div>

            {clicked && (
                <p className="text-sm text-muted-foreground">
                    Último clique: {clicked}
                </p>
            )}
        </main>
    )
}
