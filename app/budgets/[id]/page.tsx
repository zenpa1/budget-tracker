"use client"

import { useParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { BudgetProvider, useBudget } from "@/lib/budget-context"
import { ThemeProvider } from "@/lib/theme-context"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Calendar, DollarSign, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import { ExpenseForm } from "@/components/expense-form"

function BudgetDetailsContent() {
  const params = useParams()
  const router = useRouter()
  const budgetId = params.id as string
  const { budgets, getBudgetExpenses } = useBudget()
  const { user } = useAuth()
  const isFinance = user?.role === "finance_head"

  const budget = budgets.find((b) => b.id === budgetId)
  const expenses = getBudgetExpenses(budgetId)

  // Show loading screen while data is fetching to avoid brief "not found" flicker
  // We rely on budgets array length as a proxy; alternatively, expose loading from context
  if (!budget && budgets.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!budget) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Budget Not Found</CardTitle>
            <CardDescription>The budget you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/budgets">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Budgets
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const percentage = (budget.spentAmount / budget.allocatedAmount) * 100
  const isOver = percentage > 100

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary/10 text-primary border-primary/20"
      case "completed":
        return "bg-success/10 text-success border-success/20"
      case "exceeded":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:pl-64">
        <Header title="Budget Details" description={`Viewing details for ${budget.eventName}`} />
        <div className="p-6">
          <div className="mb-6">
            <Link href="/budgets">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Budgets
              </Button>
            </Link>
          </div>

          {/* Budget Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Allocated</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  ${budget.allocatedAmount.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Spent</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isOver ? "text-destructive" : "text-foreground"}`}>
                  ${budget.spentAmount.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isOver ? "text-destructive" : "text-success"}`}>
                  ${(budget.allocatedAmount - budget.spentAmount).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Utilization</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isOver ? "text-destructive" : "text-foreground"}`}>
                  {percentage.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Budget Information */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{budget.eventName}</CardTitle>
                  <CardDescription className="mt-2">{budget.description}</CardDescription>
                </div>
                <Badge variant="outline" className={getStatusColor(budget.status)}>
                  {budget.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Team</p>
                    <p className="font-medium text-foreground">{budget.team}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium text-foreground">
                      {budget.startDate} - {budget.endDate}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium text-foreground">{budget.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium text-foreground">
                    {new Date(budget.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Budget Progress</span>
                  <span className={`text-sm font-medium ${isOver ? "text-destructive" : "text-foreground"}`}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={Math.min(percentage, 100)}
                  className={`h-3 ${isOver ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"}`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Expenses List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Expenses</CardTitle>
                  <CardDescription>
                    {expenses.length} expense{expenses.length !== 1 ? "s" : ""} recorded for this budget
                  </CardDescription>
                </div>
                {isFinance && <ExpenseForm budgetId={budgetId} />}
              </div>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No expenses recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div>
                        <p className="font-medium text-foreground">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {expense.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">${expense.amount.toLocaleString()}</p>
                        <Badge variant="outline" className="mt-1">
                          {expense.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function BudgetDetailPage() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGuard>
          <BudgetProvider>
            <BudgetDetailsContent />
          </BudgetProvider>
        </AuthGuard>
      </AuthProvider>
    </ThemeProvider>
  )
}
