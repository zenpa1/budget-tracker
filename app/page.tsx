"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { StatsCards } from "@/components/stats-cards"
import { SpendingChart } from "@/components/spending-chart"
import { CategoryChart } from "@/components/category-chart"
import { TeamBudgetChart } from "@/components/team-budget-chart"
import { RecentAnomalies } from "@/components/recent-anomalies"
import { BudgetProvider } from "@/lib/budget-context"
import { ThemeProvider } from "@/lib/theme-context"
import { AuthProvider } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"

export default function DashboardPage() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGuard>
          <BudgetProvider>
            <div className="min-h-screen bg-background">
              <Sidebar />
              <main className="pl-64">
                <Header title="Dashboard Overview" description="Monitor your company's budget performance" />
                <div className="p-6">
                  <StatsCards />
                  <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    <SpendingChart />
                    <CategoryChart />
                  </div>
                  <div className="mt-6 grid gap-6 lg:grid-cols-3">
                    <TeamBudgetChart />
                    <RecentAnomalies />
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
