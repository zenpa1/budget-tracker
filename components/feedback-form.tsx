"use client"

import type React from "react"

import { useState } from "react"
import { useBudget } from "@/lib/budget-context"
import { departments } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShieldCheck, Lock, Copy, Check } from "lucide-react"

const categories = [
  { value: "unfair-promotion", label: "Unfair Promotion Practices" },
  { value: "toxic-leadership", label: "Toxic Leadership Behavior" },
  { value: "harassment", label: "Harassment" },
  { value: "discrimination", label: "Discrimination" },
  { value: "retaliation", label: "Retaliation" },
  { value: "other", label: "Other Workplace Concern" },
]

const severityLevels = [
  { value: "low", label: "Low - Minor concern" },
  { value: "medium", label: "Medium - Moderate impact" },
  { value: "high", label: "High - Serious concern" },
  { value: "critical", label: "Critical - Requires immediate attention" },
]

export function FeedbackForm() {
  const { addFeedbackReport } = useBudget()
  const [submitted, setSubmitted] = useState(false)
  const [trackingCode, setTrackingCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [formData, setFormData] = useState({
    category: "" as "unfair-promotion" | "toxic-leadership" | "harassment" | "discrimination" | "retaliation" | "other",
    department: "",
    severity: "" as "low" | "medium" | "high" | "critical",
    subject: "",
    description: "",
    incidentDate: "",
    involvedParties: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = addFeedbackReport({
      ...formData,
      isAnonymous: true,
    })
    setTrackingCode(code)
    setSubmitted(true)
  }

  const copyTrackingCode = () => {
    navigator.clipboard.writeText(trackingCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const resetForm = () => {
    setSubmitted(false)
    setTrackingCode("")
    setFormData({
      category: "" as
        | "unfair-promotion"
        | "toxic-leadership"
        | "harassment"
        | "discrimination"
        | "retaliation"
        | "other",
      department: "",
      severity: "" as "low" | "medium" | "high" | "critical",
      subject: "",
      description: "",
      incidentDate: "",
      involvedParties: "",
    })
  }

  if (submitted) {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <ShieldCheck className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="text-green-500">Report Submitted Successfully</CardTitle>
          <CardDescription>Your anonymous report has been securely submitted to HR</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertTitle>Your Tracking Code</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="flex items-center gap-2">
                <code className="rounded bg-muted px-3 py-2 text-lg font-mono font-semibold">{trackingCode}</code>
                <Button variant="outline" size="sm" onClick={copyTrackingCode}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Save this code to check the status of your report anonymously. This is the only way to track your
                submission.
              </p>
            </AlertDescription>
          </Alert>
          <Button onClick={resetForm} className="w-full">
            Submit Another Report
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Submit Anonymous Report
        </CardTitle>
        <CardDescription>
          Your identity is protected. Reports are reviewed directly by HR without revealing any personal information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as typeof formData.category })}
                required
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select concern type" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
                required
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="severity">Severity Level *</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData({ ...formData, severity: value as typeof formData.severity })}
                required
              >
                <SelectTrigger id="severity">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {severityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="incidentDate">Incident Date (Optional)</Label>
              <Input
                id="incidentDate"
                type="date"
                value={formData.incidentDate}
                onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Brief summary of the concern"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              placeholder="Please provide as much detail as possible about the incident or concern. Include specific examples, dates, and any relevant context."
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="involvedParties">Involved Parties (Optional)</Label>
            <Input
              id="involvedParties"
              placeholder="Roles or departments involved (do not include names if you prefer)"
              value={formData.involvedParties}
              onChange={(e) => setFormData({ ...formData, involvedParties: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              You can describe by role (e.g., &quot;Department Manager&quot;) instead of using names
            </p>
          </div>

          <Alert>
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Your Privacy is Protected</AlertTitle>
            <AlertDescription>
              This report is completely anonymous. No identifying information (IP address, browser data, etc.) is
              collected or stored.
            </AlertDescription>
          </Alert>

          <Button type="submit" className="w-full" size="lg">
            Submit Anonymous Report
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
