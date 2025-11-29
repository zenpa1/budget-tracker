"use client"

import type React from "react"
import { useState } from "react"
import { useBudget } from "@/lib/budget-context"
import { departments } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShieldCheck, Lock, Copy, Check } from "lucide-react"

// ---------------------------------------------------------
// 🔧 Define form shape so incidentDate + involvedParties can be null
// ---------------------------------------------------------
type FormData = {
  category:
    | "unfair-promotion"
    | "toxic-leadership"
    | "harassment"
    | "discrimination"
    | "retaliation"
    | "other"
  department: string
  severity: "low" | "medium" | "high" | "critical"
  subject: string
  description: string
  incidentDate: string | null     // ⭐ optional & nullable
  involvedParties: string | null  // ⭐ optional & nullable
}

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
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  // ---------------------------------------------------------
  // 🟢 Typed clean state (no more "" for optional fields)
  // ---------------------------------------------------------
  const [formData, setFormData] = useState<FormData>({
    category: "" as FormData["category"],
    department: "",
    severity: "" as FormData["severity"],
    subject: "",
    description: "",
    incidentDate: null,
    involvedParties: null,
  })

  // ---------------------------------------------------------
  // 🟩 Submit
  // ---------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")

    try {
      const code = await addFeedbackReport({
        ...formData,
        incidentDate: formData.incidentDate || null,
        involvedParties: formData.involvedParties || null,
        isAnonymous: true,
      })

      setTrackingCode(code)
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      setErrorMsg("Failed to submit report. Please try again.")
    }

    setLoading(false)
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
      category: "" as FormData["category"],
      department: "",
      severity: "" as FormData["severity"],
      subject: "",
      description: "",
      incidentDate: null,
      involvedParties: null,
    })
  }

  // ---------------------------------------------------------
  // SUCCESS SCREEN
  // ---------------------------------------------------------
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
                <code className="rounded bg-muted px-3 py-2 text-lg font-mono font-semibold">
                  {trackingCode}
                </code>
                <Button variant="outline" size="sm" onClick={copyTrackingCode}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Save this code to check the status of your report anonymously.
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

  // ---------------------------------------------------------
  // FORM SCREEN
  // ---------------------------------------------------------
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          Submit Anonymous Report
        </CardTitle>
        <CardDescription>
          Your identity is protected. HR will never see your personal details.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errorMsg && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Category + Department */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Category */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value as FormData["category"] })
                }
                required
              >
                <SelectTrigger>
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

            {/* Department */}
            <div className="space-y-2">
              <Label>Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Severity + Date */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Severity */}
            <div className="space-y-2">
              <Label>Severity *</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) =>
                  setFormData({ ...formData, severity: value as FormData["severity"] })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {severityLevels.map((lvl) => (
                    <SelectItem key={lvl.value} value={lvl.value}>
                      {lvl.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Incident Date (optional) */}
            <div className="space-y-2">
              <Label>Incident Date (Optional)</Label>
              <Input
                type="date"
                value={formData.incidentDate ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    incidentDate: e.target.value ? e.target.value : null,
                  })
                }
              />
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label>Subject *</Label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Detailed Description *</Label>
            <Textarea
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          {/* Involved Parties */}
          <div className="space-y-2">
            <Label>Involved Parties (Optional)</Label>
            <Input
              value={formData.involvedParties ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  involvedParties: e.target.value ? e.target.value : null,
                })
              }
            />
          </div>

          {/* Privacy Notice */}
          <Alert>
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Your Privacy is Protected</AlertTitle>
            <AlertDescription>No identifying information is ever collected.</AlertDescription>
          </Alert>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Submitting..." : "Submit Anonymous Report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
