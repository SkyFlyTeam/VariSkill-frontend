import { NavLink, useLocation, useNavigate } from "react-router-dom"

import { Home, LogOut, Medal, UserRound } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/authContext"

const navigationItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Perfil", href: "/perfil", icon: UserRound },
    { label: "Conquistas", href: "/conquistas", icon: Medal },
]

export function AppSidebar() {
    const { logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate("/login")
    }

    return (
        <Sidebar className="border-sidebar-border">
            <SidebarHeader className="px-3 pb-6 pt-7">
                <div className="flex items-center gap-3 px-2">
                    <img
                        src="/src/assets/vari/neutralVari.svg"
                        alt="VariSkill"
                        className="h-12 w-12 rounded-full"
                    />
                    <span className="text-base font-bold tracking-tight text-white font-poppins">
                        VariSkill
                    </span>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-3">
                <SidebarGroup className="p-0">
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-2">
                            {navigationItems.map((item) => {
                                const isActive =
                                    item.href === "/"
                                        ? location.pathname === "/"
                                        : location.pathname.startsWith(
                                              item.href,
                                          )

                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            render={<NavLink to={item.href} />}
                                            isActive={isActive}
                                            className="h-9 px-2 text-xs font-medium text-white hover:bg-[#12325d] hover:text-white data-active:bg-[#49b8df] data-active:text-[#06244b]"
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.label}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="px-3 pb-5">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            className="h-9 px-2 text-xs font-medium text-[#e91743] hover:bg-[#9b123086] hover:text-[#ff4c70] cursor-pointer"
                        >
                            <LogOut />
                            <span>Sair</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
