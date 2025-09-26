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

// Counterparty mapping function with theme-aware colors
function getCounterpartyInfo(counterparty: string) {
  return {
    name: counterparty,
    color: "var(--primary)",
  }
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

interface CounterpartyDonutChartProps {
  data: Transaction[]
}

export function CounterpartyDonutChart({ data }: CounterpartyDonutChartProps) {
  // Process data to get counterparty spending
  const chartData = React.useMemo(() => {
    const counterpartyTotals = data.reduce(
      (acc, transaction) => {
        if (transaction.type === "OUTFLOW") {
          // Extract counterparty from description
          let counterparty = "Outros"

          // Try to extract counterparty from PIX transactions
          if (transaction.operation_type === "PIX") {
            const pixMatch = transaction.description.match(
              /PIX - (?:ENVIADO|RECEBIDO)\s+\d+\/\d+\s+\d+:\d+\s+(.+)/
            )
            if (pixMatch) {
              counterparty = pixMatch[1].trim()
            }
          }

          // Try to extract from other transaction types
          if (counterparty === "Outros") {
            // Look for common patterns in descriptions
            const patterns = [
              /COMPRA CARTÃO DE CRÉDITO - (.+)/,
              /TED - (.+)/,
              /DOC - (.+)/,
              /TRANSFERÊNCIA PARA (.+)/,
              /PAGAMENTO (.+)/,
            ]

            for (const pattern of patterns) {
              const match = transaction.description.match(pattern)
              if (match) {
                counterparty = match[1].trim()
                break
              }
            }
          }

          // Limit counterparty name length
          if (counterparty.length > 20) {
            counterparty = counterparty.substring(0, 17) + "..."
          }

          acc[counterparty] = (acc[counterparty] || 0) + transaction.amount
        }
        return acc
      },
      {} as Record<string, number>
    )

    return Object.entries(counterpartyTotals)
      .map(([counterparty, amount], index) => {
        const counterpartyInfo = getCounterpartyInfo(counterparty)
        // Create different shades of the primary color
        const opacity = 0.3 + index * 0.1 // 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0
        return {
          counterparty,
          name: counterpartyInfo.name,
          value: amount,
          color: counterpartyInfo.color,
          fillOpacity: Math.min(opacity, 1.0),
        }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 8) // Limit to top 8 counterparties
  }, [data])

  const totalSpending = chartData.reduce((sum, item) => sum + item.value, 0)

  const chartConfig = {
    value: {
      label: "Valor",
    },
  }

  // Debug: Log the data to see what we're working with
  console.log("Counterparty donut chart data:", chartData)

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gastos por Contraparte</CardTitle>
          <CardDescription>
            Distribuição dos gastos por contraparte
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
        <CardTitle>Gastos por Contraparte</CardTitle>
        <CardDescription>
          Distribuição dos gastos por contraparte
        </CardDescription>
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
                      id={`counterparty-gradient-${index}`}
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
                      fill={`url(#counterparty-gradient-${index})`}
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
                        console.log("Counterparty tooltip labelFormatter:", {
                          value,
                          payload,
                        })
                        if (payload && payload.length > 0) {
                          return payload[0].payload.name
                        }
                        return ""
                      }}
                      formatter={(value, name, props) => {
                        console.log("Counterparty tooltip formatter:", {
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
