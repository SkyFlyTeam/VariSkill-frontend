import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "@/contexts/authContext"

export function PublicRoute() {
    const { isAuthenticated, isLoading, user } = useAuth()

    if (isLoading) {
        return null
    }

    if (isAuthenticated) {
        return (
            <Navigate
                to={user?.is_primeiro_acesso ? "/onboarding" : "/"}
                replace
            />
        )
    }

    return <Outlet />
}
