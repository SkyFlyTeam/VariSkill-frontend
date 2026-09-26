import { Navigate, Outlet, useLocation } from "react-router-dom"

import { AppSidebar } from "@/components/shared/AppSidebar"
import { ChatFloatingButton } from "@/components/shared/ChatFloatingButton"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/authContext"

export function PrivateRoute() {
    const { isAuthenticated, isLoading, user } = useAuth()
    const location = useLocation()

    if (isLoading) {
        return null
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    // 1º acesso: força passar pelo onboarding antes de qualquer rota privada.
    if (user?.is_primeiro_acesso && location.pathname !== "/onboarding") {
        return <Navigate to="/onboarding" replace />
    }

    return (
        <SidebarProvider defaultOpen>
            <AppSidebar />
            <SidebarInset>
                <div className="flex items-center bg-[#001A3F] px-4 py-2 md:hidden sticky top-0 z-10">
                    <SidebarTrigger className="text-gray-50" />
                </div>
                <Outlet />
                {location.pathname !== "/chat" && <ChatFloatingButton />}
            </SidebarInset>
        </SidebarProvider>
    )
}
