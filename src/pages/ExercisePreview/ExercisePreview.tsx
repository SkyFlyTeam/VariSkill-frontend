import { useState } from "react"

import { useNavigate } from "react-router-dom"

import { AppSidebar } from "@/components/shared/AppSidebar"
import { ChatFloatingButton } from "@/components/shared/ChatFloatingButton"
import { ExerciseView } from "@/components/shared/ExerciseView/ExerciseView"
import { Question } from "@/components/shared/Question/Question"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

const CODE_TEMPLATE = [
    "__SLOT_0__ contador = 0;",
    "",
    "function atualizarContador() {",
    "    contador = contador + 1;",
    "    console.log(contador);",
    "}",
]

const AVAILABLE_BLOCKS = [
    { id: "bloco-1", label: "const" },
    { id: "bloco-2", label: "let" },
    { id: "bloco-3", label: "updateCount" },
]

export function ExercisePreviewPage() {
    const navigate = useNavigate()
    const [slotAssignments, setSlotAssignments] = useState<
        Record<number, string>
    >({})

    const isComplete = Object.keys(slotAssignments).length === 1

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
                    submitDisabled={!isComplete}
                    onClose={() => navigate(-1)}
                    onSubmit={() => navigate(-1)}
                >
                    <Question
                        tipo="ORDENAR_BLOCOS"
                        question={{
                            questionText: "",
                            codeTemplate: CODE_TEMPLATE,
                            availableBlocks: AVAILABLE_BLOCKS,
                            slotAssignments,
                            onChangeSlotAssignments: setSlotAssignments,
                        }}
                    />
                </ExerciseView>
                <ChatFloatingButton />
            </SidebarInset>
        </SidebarProvider>
    )
}
