"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBudget } from "@/lib/budget-context"
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Skeleton } from "@/components/ui/skeleton"

export function StatsCards() {
  const { getTotalAllocated, getTotalSpent, getAnomaliesCount, budgets, loading } = useBudget()

  const totalAllocated = getTotalAllocated()
  const totalSpent = getTotalSpent()
  const anomaliesCount = getAnomaliesCount()
  const activeBudgets = budgets.filter((b) => b.status === "active").length
  const utilizationRate = ((totalSpent / totalAllocated) * 100).toFixed(1)

  const stats = [
    {
      title: "Total Allocated",
      value: `$${totalAllocated.toLocaleString()}`,
      change: "+12.5% from last quarter",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Total Spent",
      value: `$${totalSpent.toLocaleString()}`,
      change: `${utilizationRate}% utilization`,
      trend: Number.parseFloat(utilizationRate) > 100 ? "down" : "up",
      icon: TrendingUp,
    },
    {
      title: "Active Budgets",
      value: activeBudgets.toString(),
      change: `${budgets.length} total budgets`,
      trend: "up",
      icon: TrendingDown,
    },
    {
      title: "Pending Anomalies",
      value: anomaliesCount.toString(),
      change: "Requires review",
      trend: anomaliesCount > 0 ? "down" : "up",
      icon: AlertTriangle,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-foreground">
                {loading ? <Skeleton className="inline-block h-6 w-24" /> : stat.value}
              </div>
              {loading ? (
                <Skeleton className={`inline-block h-4 w-32 ${stat.trend === "up" ? "" : ""}`} />
              ) : (
                <p className={`text-xs ${stat.trend === "up" ? "text-success" : "text-destructive"}`}>{stat.change}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
