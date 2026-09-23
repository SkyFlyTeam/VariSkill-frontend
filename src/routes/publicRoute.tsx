import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "@/contexts/authContext"
import { isOnboardingCompleted } from "@/utils/onboarding"

export function PublicRoute() {
    const { isAuthenticated } = useAuth()

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
