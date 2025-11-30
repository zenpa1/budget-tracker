"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useBudget } from "@/lib/budget-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, CheckCircle, XCircle, Clock, FileText } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

export function AnomalyList() {
  const { anomalies, updateAnomalyStatus, loading } = useBudget()
  const { user } = useAuth()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "reviewed":
        return <FileText className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-warning/10 text-warning border-warning/20"
      case "reviewed":
        return "bg-primary/10 text-primary border-primary/20"
      case "approved":
        return "bg-success/10 text-success border-success/20"
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-4">
      {loading ? (
        // Render a few card-shaped skeletons while anomalies load
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={`skel-${i}`} className="bg-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
                    <div>
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="mt-4">
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        anomalies.map((anomaly) => {
          return (
            <Card key={anomaly.id} className="bg-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">{anomaly.eventName}</CardTitle>
                      <CardDescription>{anomaly.team}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(anomaly.status)}>
                    {getStatusIcon(anomaly.status)}
                    <span className="ml-1 capitalize">{anomaly.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Allocated Budget</p>
                    <p className="text-lg font-semibold text-foreground">${anomaly.allocatedAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Exceeded Amount</p>
                    <p className="text-lg font-semibold text-destructive">+${anomaly.exceededAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Percentage Over</p>
                    <p className="text-lg font-semibold text-destructive">{anomaly.percentageOver.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Detected</p>
                    <p className="text-lg font-semibold text-foreground">{anomaly.detectedAt}</p>
                  </div>
                </div>

                {anomaly.reason && (
                  <div className="mt-4 rounded-lg bg-secondary p-3">
                    <p className="text-sm text-muted-foreground">Reason</p>
                    <p className="text-sm text-foreground">{anomaly.reason}</p>
                  </div>
                )}

                <div className="mt-4">
                  {/* Only Finance Heads can manage statuses and generate reports */}
                  {/* Show controls to finance_head; show informational message to others */}
                  {(() => {
                    if (user?.role === "finance_head") {
                      return (
                        <div className="flex flex-wrap gap-2">
                          {anomaly.status === "pending" && (
                            <>
                              <Button variant="outline" size="sm" onClick={() => updateAnomalyStatus(anomaly.id, "reviewed")}>
                                <FileText className="mr-2 h-4 w-4" />
                                Mark as Reviewed
                              </Button>
                              <Button variant="default" size="sm" onClick={() => updateAnomalyStatus(anomaly.id, "approved")}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => updateAnomalyStatus(anomaly.id, "rejected")}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}
                          {anomaly.status === "reviewed" && (
                            <>
                              <Button variant="default" size="sm" onClick={() => updateAnomalyStatus(anomaly.id, "approved")}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => updateAnomalyStatus(anomaly.id, "rejected")}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Link href={`/reports?anomaly=${anomaly.id}`}>
                            <Button variant="outline" size="sm">
                              Generate Report
                            </Button>
                          </Link>
                        </div>
                      )
                    }

                    return (
                      <div className="mt-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                        Only Finance Heads can manage anomaly statuses and generate reports.
                      </div>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
