"use client"

import type React from "react"
import { useState } from "react"
import { supabase } from "@/lib/supabase"              // ⭐ REQUIRED
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Search, Clock, CheckCircle, XCircle, FileText, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import type { FeedbackReport } from "@/lib/types"

const statusConfig: Record<
  FeedbackReport["status"],
  { label: string; color: string; icon: React.ElementType; description: string }
> = {
  new: {
    label: "New",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: Clock,
    description: "Your report has been received and is awaiting review.",
  },
  "under-review": {
    label: "Under Review",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    icon: Search,
    description: "HR is currently reviewing your report.",
  },
  investigating: {
    label: "Investigating",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    icon: FileText,
    description: "An investigation has been opened based on your report.",
  },
  resolved: {
    label: "Resolved",
    color: "bg-green-500/10 text-green-500 border-green-500/20",
    icon: CheckCircle,
    description: "Your report has been addressed and resolved.",
  },
  closed: {
    label: "Closed",
    color: "bg-muted text-muted-foreground border-border",
    icon: XCircle,
    description: "This report has been closed.",
  },
}

export function FeedbackStatusChecker() {
  const [trackingCode, setTrackingCode] = useState("")
  const [foundReport, setFoundReport] = useState<FeedbackReport | null>(null)
  const [error, setError] = useState("")
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  // 🔍 Search directly in the database
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSearched(true)
    setLoading(true)

    const normalized = trackingCode.trim().toLowerCase()

    const { data, error: dbError } = await supabase
      .from("feedbackReports")
      .select("*")
      .ilike("trackingCode", normalized)   // ⭐ case-insensitive search
      .limit(1)
      .single()

    setLoading(false)

    if (dbError || !data) {
      setFoundReport(null)
      setError("No report found with this tracking code. Please check and try again.")
      return
    }

    setFoundReport(data as FeedbackReport)
  }

  const resetSearch = () => {
    setTrackingCode("")
    setFoundReport(null)
    setError("")
    setSearched(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Check Report Status
        </CardTitle>
        <CardDescription>
          Enter your tracking code to anonymously check the status of your report
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trackingCode">Tracking Code</Label>
            <div className="flex gap-2">
              <Input
                id="trackingCode"
                placeholder="e.g., FB-2025-001"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="font-mono"
              />
              <Button type="submit" disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>
        </form>

        {searched && error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Not Found</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {foundReport && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Report Status</h3>
              <Button variant="ghost" size="sm" onClick={resetSearch}>
                Clear
              </Button>
            </div>

            <div className="rounded-lg border border-border p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {foundReport.trackingCode}
                  </code>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Submitted on {format(new Date(foundReport.submittedAt), "MMMM d, yyyy")}
                  </p>
                </div>

                <Badge variant="outline" className={statusConfig[foundReport.status].color}>
                  {statusConfig[foundReport.status].label}
                </Badge>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                {(() => {
                  const StatusIcon = statusConfig[foundReport.status].icon
                  return <StatusIcon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                })()}
                <div>
                  <p className="font-medium">{statusConfig[foundReport.status].label}</p>
                  <p className="text-sm text-muted-foreground">
                    {statusConfig[foundReport.status].description}
                  </p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Category:</strong> {foundReport.category.replace("-", " ")}
                </p>
                <p>
                  <strong>Department:</strong> {foundReport.department}
                </p>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                For your privacy, we only display limited information.  
                HR will address your concern according to company policy.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
