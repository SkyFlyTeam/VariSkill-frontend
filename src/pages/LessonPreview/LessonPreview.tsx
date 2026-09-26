import { useNavigate } from "react-router-dom"

import { AppSidebar } from "@/components/shared/AppSidebar"
import { ChatFloatingButton } from "@/components/shared/ChatFloatingButton"
import { LessonView } from "@/components/shared/LessonView/LessonView"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

// Conteúdo de demonstração só para o preview manual da tela (VAR-68).
const MOCK_BODY = `Variáveis são usadas para armazenar informações que podem ser utilizadas ao longo do código, como textos, números e valores verdadeiros ou falsos. Elas permitem guardar dados para consultar ou modificar posteriormente.

As principais formas de criar variáveis são **let**, **const** e **var**. Atualmente, é let quando o valor pode mudar, enquanto const é indicada quando o valor não deve ser reatribuído.`

const MOCK_EXAMPLES: string[][] = [
    ["let idade = 20;", "idade = 21;", "console.log(idade);"],
    ['const nome = "Maria";', "console.log(nome);"],
]

export function LessonPreviewPage() {
    const navigate = useNavigate()

    return (
        <SidebarProvider defaultOpen>
            <AppSidebar />
            <SidebarInset>
                <div className="flex items-center bg-[#001A3F] px-4 py-2 md:hidden sticky top-0 z-10">
                    <SidebarTrigger className="text-gray-50" />
                </div>
                <LessonView
                    title="Variáveis"
                    body={MOCK_BODY}
                    examples={MOCK_EXAMPLES}
                    progress={50}
                    onClose={() => navigate(-1)}
                    onNext={() => navigate(-1)}
                />
                <ChatFloatingButton />
            </SidebarInset>
        </SidebarProvider>
    )
}
