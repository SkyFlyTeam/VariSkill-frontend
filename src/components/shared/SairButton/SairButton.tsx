import { useNavigate } from "react-router-dom"

import { LogOut } from "lucide-react"

import { SidebarMenuButton } from "@/components/ui/sidebar"

export function SairButton() {
    const navigate = useNavigate()

    return (
        <SidebarMenuButton
            onClick={() => navigate("/login")}
            className="h-9 px-2 text-xs font-medium text-[#e91743] hover:bg-[#9b123086] hover:text-[#ff4c70] cursor-pointer"
        >
            <LogOut />
            <span>Sair</span>
        </SidebarMenuButton>
    )
}
