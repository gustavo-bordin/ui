"use client"

import * as React from "react"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { DateRangeSelector } from "@/app/dashboard/components/date-range-selector"
import { InstitutionSelector } from "@/app/dashboard/components/institution-selector"
import { ModeToggle } from "@/app/dashboard/components/mode-toggle"

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

export function SiteHeader() {
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(), // today
  })
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <InstitutionSelector />
        <div className="ml-auto flex items-center gap-2">
          <DateRangeSelector
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
