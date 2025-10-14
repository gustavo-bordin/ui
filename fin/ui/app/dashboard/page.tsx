import { CategoryDonutChart } from "@/fin/ui/app/dashboard/components/category-donut-chart"
import { ChartAreaInteractive } from "@/fin/ui/app/dashboard/components/chart-area-interactive"
import { CounterpartyDonutChart } from "@/fin/ui/app/dashboard/components/counterparty-donut-chart"
import { DataTable } from "@/fin/ui/app/dashboard/components/data-table"
import { OperationDonutChart } from "@/fin/ui/app/dashboard/components/operation-donut-chart"
import { SectionCards } from "@/fin/ui/app/dashboard/components/section-cards"

import data from "@/app/dashboard/data.json"

export default function Page() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <div className="px-4 lg:px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <CategoryDonutChart data={data} />
            <OperationDonutChart data={data} />
            <CounterpartyDonutChart data={data} />
          </div>
        </div>
        <DataTable data={data} />
      </div>
    </div>
  )
}
