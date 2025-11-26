"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AnomalyList } from "@/components/anomaly-list"
import { BudgetProvider } from "@/lib/budget-context"
import { ThemeProvider } from "@/lib/theme-context"
import { AuthProvider } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"

export default function AnomaliesPage() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGuard>
          <BudgetProvider>
            <div className="min-h-screen bg-background">
              <Sidebar />
              <main className="pl-64">
                <Header title="Budget Anomalies" description="Review and manage budget exceedances" />
                <div className="p-6">
                  <AnomalyList />
                </div>
              </main>
            </div>
          </BudgetProvider>
        </AuthGuard>
      </AuthProvider>
    </ThemeProvider>
  )
}
