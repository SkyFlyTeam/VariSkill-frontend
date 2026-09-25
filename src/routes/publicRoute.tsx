import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "@/contexts/authContext"
import { isOnboardingCompleted } from "@/utils/onboarding"

export function PublicRoute() {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return (
            <main
                className="flex min-h-screen items-center justify-center"
                role="status"
            >
                Verificando sessão...
            </main>
        )
    }

    if (isAuthenticated) {
        return (
            <Navigate
                to={isOnboardingCompleted() ? "/" : "/onboarding"}
                replace
            />
        )
    }

    return <Outlet />
}
