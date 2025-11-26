"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ReportGenerator } from "@/components/report-generator"
import { ReportPreview } from "@/components/report-preview"
import { BudgetProvider } from "@/lib/budget-context"
import { ThemeProvider } from "@/lib/theme-context"
import { AuthProvider } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"

export default function ReportsPage() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGuard>
          <BudgetProvider>
            <div className="min-h-screen bg-background">
              <Sidebar />
              <main className="pl-64">
                <Header title="Reports" description="Generate budget anomaly reports for council review" />
                <div className="p-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <ReportGenerator />
                    <ReportPreview />
                  </div>
                </div>
              </main>
            </div>
          </BudgetProvider>
        </AuthGuard>
      </AuthProvider>
    </ThemeProvider>
  )
}
