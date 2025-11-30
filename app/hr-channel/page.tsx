"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { FeedbackForm } from "@/components/feedback-form"
import { FeedbackList } from "@/components/feedback-list"
import { FeedbackStatusChecker } from "@/components/feedback-status-checker"
import { BudgetProvider } from "@/lib/budget-context"
import { ThemeProvider } from "@/lib/theme-context"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Lock, Eye, UserX, ShieldAlert } from "lucide-react"

function HRChannelContent() {
  const { user } = useAuth()

  // Only HR admins can access the HR Dashboard
  const isHRAdmin = user?.role === "hr_admin"

  return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="md:pl-64">
        <Header
          title="Anonymous Feedback Channel"
          description="Confidentially report workplace concerns directly to HR"
        />
        <div className="p-6">
          {/* Trust & Privacy Banner */}
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="py-6">
              <div className="grid gap-6 md:grid-cols-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">100% Anonymous</h3>
                    <p className="text-sm text-muted-foreground">No identifying data collected</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Secure & Encrypted</h3>
                    <p className="text-sm text-muted-foreground">End-to-end protection</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">HR Direct Access</h3>
                    <p className="text-sm text-muted-foreground">Reports go straight to HR</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <UserX className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">No Retaliation</h3>
                    <p className="text-sm text-muted-foreground">Protected by company policy</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="submit" className="space-y-6">
            <TabsList className={`grid w-full max-w-full sm:max-w-md ${isHRAdmin ? "grid-cols-3" : "grid-cols-2"}`}>
              <TabsTrigger value="submit">Submit Report</TabsTrigger>
              <TabsTrigger value="check">Check Status</TabsTrigger>
              {isHRAdmin && <TabsTrigger value="manage">HR Dashboard</TabsTrigger>}
            </TabsList>

            <TabsContent value="submit" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <FeedbackForm />
                </div>
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">What You Can Report</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <p>Unfair promotion practices or favoritism</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <p>Toxic leadership behavior</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <p>Workplace harassment or bullying</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <p>Discrimination of any kind</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <p>Retaliation for speaking up</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <p>Other workplace concerns</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">How It Works</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <div className="flex gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                          1
                        </div>
                        <p className="text-muted-foreground">Submit your report anonymously</p>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                          2
                        </div>
                        <p className="text-muted-foreground">Receive a tracking code</p>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                          3
                        </div>
                        <p className="text-muted-foreground">HR reviews and investigates</p>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                          4
                        </div>
                        <p className="text-muted-foreground">Check status using your code</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="check">
              <div className="max-w-xl">
                <FeedbackStatusChecker />
              </div>
            </TabsContent>

            {isHRAdmin && (
              <TabsContent value="manage">
                <FeedbackList />
              </TabsContent>
            )}
          </Tabs>

          {!isHRAdmin && (
            <Card className="mt-6 border-muted">
              <CardContent className="py-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <ShieldAlert className="h-5 w-5" />
                  <p>Your reports are only visible to authorized HR personnel. Your identity remains confidential.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default function HRChannelPage() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGuard>
          <BudgetProvider>
            <HRChannelContent />
          </BudgetProvider>
        </AuthGuard>
      </AuthProvider>
    </ThemeProvider>
  )
}
