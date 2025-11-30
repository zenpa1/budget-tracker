"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useBudget } from "@/lib/budget-context"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase" // <--- needed for direct DB updates
import type { FeedbackReport } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Clock, CheckCircle, XCircle, Search, FileText, Building2, Calendar } from "lucide-react"
import { format } from "date-fns"

const statusConfig: Record<FeedbackReport["status"], { label: string; color: string; icon: React.ElementType }> = {
  new: { label: "New", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Clock },
  "under-review": { label: "Under Review", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Search },
  investigating: {
    label: "Investigating",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    icon: FileText,
  },
  resolved: { label: "Resolved", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle },
  closed: { label: "Closed", color: "bg-muted text-muted-foreground border-border", icon: XCircle },
}

const severityConfig: Record<FeedbackReport["severity"], { label: string; color: string }> = {
  low: { label: "Low", color: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
  medium: { label: "Medium", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  high: { label: "High", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  critical: { label: "Critical", color: "bg-red-500/10 text-red-500 border-red-500/20" },
}

const categoryLabels: Record<FeedbackReport["category"], string> = {
  "unfair-promotion": "Unfair Promotion",
  "toxic-leadership": "Toxic Leadership",
  harassment: "Harassment",
  discrimination: "Discrimination",
  retaliation: "Retaliation",
  other: "Other",
}

export function FeedbackList() {
  const { feedbackReports, reloadData } = useBudget()
  const { user } = useAuth()
  const isHR = user?.role === "hr_admin"
  const [selectedReport, setSelectedReport] = useState<FeedbackReport | null>(null)

  // Editable fields (local state)
  const [newStatus, setNewStatus] = useState<FeedbackReport["status"]>("new")
  const [hrNotes, setHrNotes] = useState("")
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<FeedbackReport["category"]>("other")
  const [department, setDepartment] = useState("")
  const [incidentDate, setIncidentDate] = useState<string | null>(null)
  const [involvedParties, setInvolvedParties] = useState<string | null>(null)
  const [severity, setSeverity] = useState<FeedbackReport["severity"]>("low")
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [assignedTo, setAssignedTo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (selectedReport) {
      // Initialize editable fields from the selected report
      setNewStatus(selectedReport.status)
      setHrNotes(selectedReport.hrNotes ?? "")
      setSubject(selectedReport.subject ?? "")
      setDescription(selectedReport.description ?? "")
      setCategory(selectedReport.category ?? "other")
      setDepartment(selectedReport.department ?? "")
      setIncidentDate(selectedReport.incidentDate ?? null)
      setInvolvedParties(selectedReport.involvedParties ?? null)
      setSeverity(selectedReport.severity ?? "low")
      setIsAnonymous(selectedReport.isAnonymous ?? true)
      setAssignedTo(selectedReport.assignedTo ?? null)
    } else {
      // clear
      setNewStatus("new")
      setHrNotes("")
      setSubject("")
      setDescription("")
      setCategory("other")
      setDepartment("")
      setIncidentDate(null)
      setInvolvedParties(null)
      setSeverity("low")
      setIsAnonymous(true)
      setAssignedTo(null)
    }
  }, [selectedReport])

  const filteredReports = feedbackReports.filter((report) => {
    if (activeTab === "all") return true
    if (activeTab === "active") return ["new", "under-review", "investigating"].includes(report.status)
    if (activeTab === "resolved") return ["resolved", "closed"].includes(report.status)
    return true
  })

  const openReportDialog = (report: FeedbackReport) => {
    setSelectedReport(report)
  }

  const handleClose = () => {
    setSelectedReport(null)
  }

  // Save edits directly to DB (and keep local modal updated)
  const handleSaveChanges = async () => {
    if (!selectedReport) return
    setLoading(true)

    try {
      const updates: any = {
        // Reporter fields should not be changed by HR; keep original if HR
        subject: isHR ? selectedReport.subject : subject,
        description: isHR ? selectedReport.description : description,
        category: isHR ? selectedReport.category : category,
        department: isHR ? selectedReport.department : department,
        incidentDate: isHR ? selectedReport.incidentDate ?? null : incidentDate ?? null,
        involvedParties: isHR ? selectedReport.involvedParties ?? null : involvedParties ?? null,
        // HR action fields remain editable
        severity,
        isAnonymous: isHR ? selectedReport.isAnonymous : isAnonymous,
        assignedTo: assignedTo ?? null,
        hrNotes,
        status: newStatus,
      }

      // Update SQL
      const { data, error } = await supabase
        .from("feedbackReports")
        .update(updates)
        .eq("id", selectedReport.id)
        .select()
        .single()

      if (error) {
        console.error("Failed to update feedback report:", error)
      } else {
        // ⭐ Optimistic UI update (local modal only)
        setSelectedReport(data)
      }
    } finally {
      setLoading(false)
      // Refresh data to reflect changes in the main list
      try { await reloadData() } catch {}
      // Close modal
      setSelectedReport(null)
    }
}


  const handleUpdateStatus = async () => {
    // keep for backwards compatibility: update only status + hrNotes if called from Save button
    await handleSaveChanges()
  }

  const getStatusCounts = () => ({
    all: feedbackReports.length,
    active: feedbackReports.filter((r) => ["new", "under-review", "investigating"].includes(r.status)).length,
    resolved: feedbackReports.filter((r) => ["resolved", "closed"].includes(r.status)).length,
  })

  const counts = getStatusCounts()

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Anonymous Reports</CardTitle>
          <CardDescription>Review and manage confidential employee feedback reports</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
              <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
              <TabsTrigger value="resolved">Resolved ({counts.resolved})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <div className="space-y-3">
                {filteredReports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No reports found</h3>
                    <p className="text-sm text-muted-foreground">There are no reports in this category</p>
                  </div>
                ) : (
                  filteredReports.map((report) => {
                    const StatusIcon = statusConfig[report.status].icon
                    return (
                      <div
                        key={report.id}
                        className="flex items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50 cursor-pointer"
                        onClick={() => openReportDialog(report)}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                          <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-medium text-foreground line-clamp-1">{report.subject}</h4>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-3.5 w-3.5" />
                                  {report.department}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {format(new Date(report.submittedAt), "MMM d, yyyy")}
                                </span>
                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{report.trackingCode}</code>
                              </div>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-2">
                              <Badge variant="outline" className={severityConfig[report.severity].color}>
                                {severityConfig[report.severity].label}
                              </Badge>
                              <Badge variant="outline" className={statusConfig[report.status].color}>
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {statusConfig[report.status].label}
                              </Badge>
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{report.description}</p>
                          <Badge variant="secondary" className="mt-2">
                            {categoryLabels[report.category]}
                          </Badge>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={severityConfig[selectedReport.severity].color}>
                    {severityConfig[selectedReport.severity].label} Severity
                  </Badge>
                  <Badge variant="outline" className={statusConfig[selectedReport.status].color}>
                    {statusConfig[selectedReport.status].label}
                  </Badge>
                </div>
                <DialogTitle className="text-xl">{subject || selectedReport.subject}</DialogTitle>
                <DialogDescription>
                  <span className="font-mono">{selectedReport.trackingCode}</span> • Submitted on{" "}
                  {format(new Date(selectedReport.submittedAt), "MMMM d, yyyy 'at' h:mm a")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm text-muted-foreground">Category</p>
                    <Select value={category} onValueChange={(v) => setCategory(v as FeedbackReport["category"])} disabled={isHR}>
                      <SelectTrigger disabled={isHR}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unfair-promotion">Unfair Promotion</SelectItem>
                        <SelectItem value="toxic-leadership">Toxic Leadership</SelectItem>
                        <SelectItem value="harassment">Harassment</SelectItem>
                        <SelectItem value="discrimination">Discrimination</SelectItem>
                        <SelectItem value="retaliation">Retaliation</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm text-muted-foreground">Department</p>
                    <input
                      className="mt-1 w-full rounded-md border px-2 py-1"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      readOnly={isHR}
                    />
                  </div>

                  {selectedReport.incidentDate !== undefined && (
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-sm text-muted-foreground">Incident Date</p>
                      <input
                        type="date"
                        className="mt-1 w-full rounded-md border px-2 py-1"
                        value={incidentDate ?? ""}
                        onChange={(e) => setIncidentDate(e.target.value || null)}
                        readOnly={isHR}
                        disabled={isHR}
                      />
                    </div>
                  )}

                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm text-muted-foreground">Involved Parties</p>
                    <input
                      className="mt-1 w-full rounded-md border px-2 py-1"
                      value={involvedParties ?? ""}
                      onChange={(e) => setInvolvedParties(e.target.value || null)}
                      readOnly={isHR}
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">Description</p>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      readOnly={isHR}
                      rows={6}
                    />
                  </div>
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <h4 className="font-medium">HR Actions</h4>
                  <div className="space-y-2">
                    <Label htmlFor="status">Update Status</Label>
                    <Select value={newStatus} onValueChange={(v) => setNewStatus(v as FeedbackReport["status"])}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="under-review">Under Review</SelectItem>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">HR Notes (Internal)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add internal notes about this report..."
                      value={hrNotes}
                      onChange={(e) => setHrNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 items-center">
                    <label className="text-sm text-muted-foreground">Is Anonymous?</label>
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      disabled={isHR}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Severity</p>
                      <Select value={severity} onValueChange={(v) => setSeverity(v as FeedbackReport["severity"])}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Assigned To</p>
                      <input
                        className="mt-1 w-full rounded-md border px-2 py-1"
                        value={assignedTo ?? ""}
                        onChange={(e) => setAssignedTo(e.target.value || null)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleClose} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
