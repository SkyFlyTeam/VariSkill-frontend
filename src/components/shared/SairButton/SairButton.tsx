import { useNavigate } from "react-router-dom"

import { LogOut } from "lucide-react"

import { SidebarMenuButton } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/authContext"

export function SairButton() {
    const { logout } = useAuth()
    const navigate = useNavigate()

    async function handleLogout() {
        await logout()
        navigate("/login")
    }

    return (
        <SidebarMenuButton
            onClick={handleLogout}
            className="h-9 px-2 text-xs font-medium text-[#e91743] hover:bg-[#9b123086] hover:text-[#ff4c70] cursor-pointer"
        >
            <LogOut />
            <span>Sair</span>
        </SidebarMenuButton>
    )
}
