"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useBudget } from "@/lib/budget-context"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export function RecentAnomalies() {
  const { anomalies } = useBudget()
  const recentAnomalies = anomalies.slice(0, 5)

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-foreground">Recent Anomalies</CardTitle>
          <CardDescription>Budget overruns requiring attention</CardDescription>
        </div>
        <Link href="/anomalies" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentAnomalies.map((anomaly) => (
            <div key={anomaly.id} className="flex items-start gap-4 rounded-lg border border-border p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">{anomaly.eventName}</p>
                  <Badge variant={anomaly.status === "pending" ? "destructive" : "secondary"} className="capitalize">
                    {anomaly.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{anomaly.team}</p>
                <p className="mt-1 text-sm text-destructive">
                  +${anomaly.exceededAmount.toLocaleString()} ({anomaly.percentageOver.toFixed(1)}% over)
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
