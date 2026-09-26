import { useNavigate } from "react-router-dom"

import { AppSidebar } from "@/components/shared/AppSidebar"
import { ChatFloatingButton } from "@/components/shared/ChatFloatingButton"
import { ExerciseView } from "@/components/shared/ExerciseView/ExerciseView"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

export function ExercisePreviewPage() {
    const navigate = useNavigate()

    return (
        <SidebarProvider defaultOpen>
            <AppSidebar />
            <SidebarInset>
                <div className="flex items-center bg-[#001A3F] px-4 py-2 md:hidden sticky top-0 z-10">
                    <SidebarTrigger className="text-gray-50" />
                </div>
                <ExerciseView
                    enunciado="1 - Arraste os blocos para completar o código adequadamente:"
                    progress={30}
                    onClose={() => navigate(-1)}
                    onSubmit={() => navigate(-1)}
                />
                <ChatFloatingButton />
            </SidebarInset>
        </SidebarProvider>
    )
}
