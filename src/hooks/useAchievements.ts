import { useCallback, useEffect, useState } from "react"

import {
    type Conquista,
    achievementsService,
} from "@/services/achievementsService"

export type UseAchievementsResult = {
    achievements: Conquista[]
    loading: boolean
    error: string | null
    reload: () => Promise<void>
}

export function useAchievements(): UseAchievementsResult {
    const [achievements, setAchievements] = useState<Conquista[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const reload = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await achievementsService.getAchievements()
            setAchievements([...data].sort((a, b) => a.ordem - b.ordem))
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível carregar as conquistas.",
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void reload()
    }, [reload])

    return { achievements, loading, error, reload }
}
