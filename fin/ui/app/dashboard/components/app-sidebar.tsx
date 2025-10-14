"use client"

import * as React from "react"
import { NavMain } from "@/fin/ui/app/dashboard/components/nav-main"
import { NavSecondary } from "@/fin/ui/app/dashboard/components/nav-secondary"
import { NavUser } from "@/fin/ui/app/dashboard/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/fin/ui/components/ui/sidebar"
import {
  IconBuildingBank,
  IconInnerShadowTop,
  IconSettings,
} from "@tabler/icons-react"

const data = {
  navMain: [
    {
      title: "Contas",
      url: "/dashboard",
      icon: IconBuildingBank,
    },
  ],
  navSecondary: [
    {
      title: "Configurações",
      url: "/settings",
      icon: IconSettings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">FinançasPro</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
