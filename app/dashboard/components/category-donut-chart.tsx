"use client"

import * as React from "react"
import { Cell, Label, Pie, PieChart } from "recharts"
import { z } from "zod"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Category mapping function with theme-aware colors
function getCategoryInfo(category: string) {
  const categoryMap: Record<string, { name: string; color: string }> = {
    Food: {
      name: "Alimentação",
      color: "var(--primary)",
    },
    Transport: {
      name: "Transporte",
      color: "var(--primary)",
    },
    Health: {
      name: "Saúde",
      color: "var(--primary)",
    },
    Income: {
      name: "Receita",
      color: "var(--primary)",
    },
    Transfer: {
      name: "Transferência",
      color: "var(--primary)",
    },
    Cash: {
      name: "Dinheiro",
      color: "var(--primary)",
    },
    Savings: {
      name: "Poupança",
      color: "var(--primary)",
    },
    Investment: {
      name: "Investimento",
      color: "var(--primary)",
    },
    Shopping: {
      name: "Compras",
      color: "var(--primary)",
    },
  }

  return (
    categoryMap[category] || {
      name: category,
      color: "var(--primary)",
    }
  )
}

const schema = z.object({
  id: z.string(),
  date: z.string(),
  description: z.string(),
  amount: z.number(),
  currency: z.string(),
  type: z.string(),
  status: z.string(),
  operation_type: z.string(),
  account_name: z.string(),
  category: z.string(),
})

type Transaction = z.infer<typeof schema>

interface CategoryDonutChartProps {
  data: Transaction[]
}

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  // Process data to get category spending
  const chartData = React.useMemo(() => {
    const categoryTotals = data.reduce(
      (acc, transaction) => {
        if (transaction.type === "OUTFLOW") {
          const category = transaction.category
          acc[category] = (acc[category] || 0) + transaction.amount
        }
        return acc
      },
      {} as Record<string, number>
    )

    return Object.entries(categoryTotals)
      .map(([category, amount], index) => {
        const categoryInfo = getCategoryInfo(category)
        // Create different shades of the primary color
        const opacity = 0.3 + index * 0.1 // 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0
        return {
          category,
          name: categoryInfo.name,
          value: amount,
          color: categoryInfo.color,
          fillOpacity: Math.min(opacity, 1.0),
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [data])

  const totalSpending = chartData.reduce((sum, item) => sum + item.value, 0)

  const chartConfig = {
    value: {
      label: "Valor",
    },
  }

  // Debug: Log the data to see what we're working with
  console.log("Donut chart data:", chartData)

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gastos por Categoria</CardTitle>
          <CardDescription>
            Distribuição dos gastos por categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-64 items-center justify-center">
            Nenhum gasto encontrado
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Categoria</CardTitle>
        <CardDescription>Distribuição dos gastos por categoria</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="relative h-80 w-80">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <PieChart>
                <defs>
                  {chartData.map((entry, index) => (
                    <linearGradient
                      key={`gradient-${index}`}
                      id={`gradient-${index}`}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={entry.color}
                        stopOpacity="1"
                      />
                      <stop
                        offset="100%"
                        stopColor={entry.color}
                        stopOpacity={entry.fillOpacity}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={140}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#gradient-${index})`}
                    />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-2xl font-bold"
                            >
                              R$ {totalSpending.toFixed(0)}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground text-sm"
                            >
                              Total Gastos
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="z-[9999]"
                      labelFormatter={(value, payload) => {
                        console.log("Tooltip labelFormatter:", {
                          value,
                          payload,
                        })
                        if (payload && payload.length > 0) {
                          return payload[0].payload.name
                        }
                        return ""
                      }}
                      formatter={(value, name, props) => {
                        console.log("Tooltip formatter:", {
                          value,
                          name,
                          props,
                        })
                        const percentage = (
                          ((value as number) / totalSpending) *
                          100
                        ).toFixed(1)
                        return [
                          `R$ ${(value as number).toFixed(2)} (${percentage}%)`,
                          "Valor",
                        ]
                      }}
                    />
                  }
                />
              </PieChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
