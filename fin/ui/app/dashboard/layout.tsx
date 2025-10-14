import { cookies } from "next/headers"
import { AppSidebar } from "@/fin/ui/app/dashboard/components/app-sidebar"
import { SiteHeader } from "@/fin/ui/app/dashboard/components/site-header"
import { SidebarInset, SidebarProvider } from "@/fin/ui/components/ui/sidebar"

import "@/app/dashboard/theme.css"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
