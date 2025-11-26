"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { BudgetForm } from "@/components/budget-form"
import { BudgetTable } from "@/components/budget-table"
import { BudgetProvider } from "@/lib/budget-context"
import { ThemeProvider } from "@/lib/theme-context"
import { AuthProvider } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"

export default function BudgetsPage() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGuard>
          <BudgetProvider>
            <div className="min-h-screen bg-background">
              <Sidebar />
              <main className="pl-64">
                <Header title="Budget Management" description="Create and manage event budgets" />
                <div className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">All Budgets</h2>
                      <p className="text-sm text-muted-foreground">Track and manage all company event budgets</p>
                    </div>
                    <BudgetForm />
                  </div>
                  <BudgetTable />
                </div>
              </main>
            </div>
          </BudgetProvider>
        </AuthGuard>
      </AuthProvider>
    </ThemeProvider>
  )
}
