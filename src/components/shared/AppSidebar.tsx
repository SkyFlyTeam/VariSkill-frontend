import { NavLink, useLocation } from "react-router-dom"

import { Backpack, Home, UserRound, ShieldCheck } from "lucide-react"

import { SairButton } from "@/components/shared/SairButton/SairButton"
import { UserStatistics } from "@/components/shared/UserStatistics/UserStatistics"
import { toUserStatisticsProps } from "@/components/shared/UserStatistics/toUserStatisticsProps"
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
    { label: "Inventário", href: "/inventario", icon: Backpack },
    { label: "Privacidade", href: "/privacidade", icon: ShieldCheck },
]

export function AppSidebar() {
    const location = useLocation()
    const { user } = useAuth()

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
                {user && (
                    <UserStatistics
                        {...toUserStatisticsProps(user)}
                        compact
                        className="mt-4"
                        trophies={user.conquistas_desbloqueadas}
                    />
                )}
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
                        <SairButton />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
