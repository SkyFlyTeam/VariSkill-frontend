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
    const { isAuthenticated, loading } = useAuth()
    const location = useLocation()

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

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
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
