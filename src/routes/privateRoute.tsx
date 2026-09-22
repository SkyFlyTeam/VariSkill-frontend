import { Navigate, Outlet } from "react-router-dom"

import { AppSidebar } from "@/components/shared/AppSidebar"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/authContext"

export function PrivateRoute() {
    const { isAuthenticated } = useAuth()

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
            </SidebarInset>
        </SidebarProvider>
    )
}
