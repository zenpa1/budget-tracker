"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useBudget } from "@/lib/budget-context"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export function ReportPreview() {
  const { budgets, anomalies } = useBudget()
  const exceededBudgets = budgets.filter((b) => b.status === "exceeded")

  const summaryData = exceededBudgets.map((budget) => ({
    name: budget.eventName.split(" ").slice(0, 2).join(" "),
    allocated: budget.allocatedAmount,
    spent: budget.spentAmount,
    exceeded: budget.spentAmount - budget.allocatedAmount,
  }))

  const statusData = [
    { name: "Pending", value: anomalies.filter((a) => a.status === "pending").length, color: "#eab308" },
    { name: "Reviewed", value: anomalies.filter((a) => a.status === "reviewed").length, color: "#6366f1" },
    { name: "Approved", value: anomalies.filter((a) => a.status === "approved").length, color: "#22c55e" },
    { name: "Rejected", value: anomalies.filter((a) => a.status === "rejected").length, color: "#ef4444" },
  ].filter((d) => d.value > 0)

  const totalExceeded = exceededBudgets.reduce((sum, b) => sum + (b.spentAmount - b.allocatedAmount), 0)

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Report Preview</CardTitle>
        <CardDescription>Preview of the anomaly report data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-secondary p-4">
            <p className="text-sm text-muted-foreground">Exceeded Budgets</p>
            <p className="text-2xl font-bold text-foreground">{exceededBudgets.length}</p>
          </div>
          <div className="rounded-lg bg-secondary p-4">
            <p className="text-sm text-muted-foreground">Total Overrun</p>
            <p className="text-2xl font-bold text-destructive">${totalExceeded.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-secondary p-4">
            <p className="text-sm text-muted-foreground">Pending Review</p>
            <p className="text-2xl font-bold text-warning">{anomalies.filter((a) => a.status === "pending").length}</p>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-medium text-foreground">Budget Exceedance Overview</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summaryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                <YAxis stroke="#9ca3af" fontSize={10} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#f9fafb",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                />
                <Bar dataKey="allocated" fill="#6366f1" name="Allocated" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" fill="#ef4444" name="Spent" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-4 font-medium text-foreground">Anomaly Status Distribution</h4>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={30} outerRadius={60} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#f9fafb",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h4 className="mb-4 font-medium text-foreground">Status Legend</h4>
            <div className="space-y-2">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <Badge variant="outline">{item.value}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
