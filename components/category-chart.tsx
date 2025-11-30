"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { categorySpendingData } from "@/lib/data"
import { useBudget } from "@/lib/budget-context"
import { Skeleton } from "@/components/ui/skeleton"
import { useIsMobile } from "@/components/ui/use-mobile"

export function CategoryChart() {
  const { loading } = useBudget()
  const isMobile = useIsMobile()

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Spending by Category</CardTitle>
        <CardDescription>Distribution of expenses across categories</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Skeleton className="h-[220px] w-full max-w-2xl" />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-sm sm:max-w-md md:max-w-lg h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpendingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    label={false}
                    labelLine={false}
                  >
                    {categorySpendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      color: "var(--color-popover-foreground)",
                      fontWeight: 500,
                    }}
                    itemStyle={{
                      color: "var(--color-popover-foreground)",
                      fontWeight: 500,
                    }}
                    formatter={(value: number, name: string, entry: any) => [
                      `$${value.toLocaleString()}`,
                      entry && entry.payload && entry.payload.name ? entry.payload.name : name,
                    ]}
                    labelStyle={{
                      color: "var(--color-popover-foreground)",
                      fontWeight: 500,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-4 w-full max-w-lg grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-xs sm:text-sm" aria-label="Spending categories legend">
              {categorySpendingData.map((item) => (
                <li key={item.name} className="flex items-center gap-2">
                  <span
                    className="inline-block rounded-sm h-3 w-3"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="text-muted-foreground truncate" title={item.name}>
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
