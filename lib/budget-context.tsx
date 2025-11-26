"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Budget, Expense, Anomaly, Notification, FeedbackReport } from "./types"
import { mockBudgets, mockExpenses, mockAnomalies, mockNotifications, mockFeedbackReports } from "./data"

interface BudgetContextType {
  budgets: Budget[]
  expenses: Expense[]
  anomalies: Anomaly[]
  notifications: Notification[]
  feedbackReports: FeedbackReport[]
  addBudget: (budget: Omit<Budget, "id" | "createdAt" | "spentAmount" | "status">) => void
  updateBudget: (id: string, updates: Partial<Budget>) => void
  addExpense: (expense: Omit<Expense, "id">) => void
  updateAnomalyStatus: (id: string, status: Anomaly["status"]) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  getUnreadNotificationsCount: () => number
  getBudgetExpenses: (budgetId: string) => Expense[]
  getTotalAllocated: () => number
  getTotalSpent: () => number
  getAnomaliesCount: () => number
  addFeedbackReport: (report: Omit<FeedbackReport, "id" | "submittedAt" | "status" | "trackingCode">) => string
  updateFeedbackStatus: (id: string, status: FeedbackReport["status"], hrNotes?: string) => void
  getFeedbackByStatus: (status: FeedbackReport["status"]) => FeedbackReport[]
  getNewFeedbackCount: () => number
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined)

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets)
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses)
  const [anomalies, setAnomalies] = useState<Anomaly[]>(mockAnomalies)
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [feedbackReports, setFeedbackReports] = useState<FeedbackReport[]>(mockFeedbackReports)

  const addBudget = useCallback((budgetData: Omit<Budget, "id" | "createdAt" | "spentAmount" | "status">) => {
    const newBudget: Budget = {
      ...budgetData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
      spentAmount: 0,
      status: "active",
    }
    setBudgets((prev) => [...prev, newBudget])
  }, [])

  const updateBudget = useCallback((id: string, updates: Partial<Budget>) => {
    setBudgets((prev) => prev.map((budget) => (budget.id === id ? { ...budget, ...updates } : budget)))
  }, [])

  const addExpense = useCallback((expenseData: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
    }
    setExpenses((prev) => [...prev, newExpense])

    setBudgets((prev) =>
      prev.map((budget) => {
        if (budget.id === expenseData.budgetId) {
          const newSpent = budget.spentAmount + expenseData.amount
          const newStatus = newSpent > budget.allocatedAmount ? "exceeded" : budget.status

          if (newSpent > budget.allocatedAmount && budget.status !== "exceeded") {
            const anomaly: Anomaly = {
              id: Date.now().toString(),
              budgetId: budget.id,
              eventName: budget.eventName,
              team: budget.team,
              allocatedAmount: budget.allocatedAmount,
              exceededAmount: newSpent - budget.allocatedAmount,
              percentageOver: ((newSpent - budget.allocatedAmount) / budget.allocatedAmount) * 100,
              detectedAt: new Date().toISOString().split("T")[0],
              status: "pending",
            }
            setAnomalies((prev) => [...prev, anomaly])

            const notification: Notification = {
              id: Date.now().toString(),
              type: "alert",
              title: "Budget Exceeded",
              message: `${budget.eventName} has exceeded its budget`,
              timestamp: new Date().toISOString(),
              read: false,
              budgetId: budget.id,
            }
            setNotifications((prev) => [notification, ...prev])
          }

          return { ...budget, spentAmount: newSpent, status: newStatus }
        }
        return budget
      }),
    )
  }, [])

  const updateAnomalyStatus = useCallback((id: string, status: Anomaly["status"]) => {
    setAnomalies((prev) => prev.map((anomaly) => (anomaly.id === id ? { ...anomaly, status } : anomaly)))
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }, [])

  const getUnreadNotificationsCount = useCallback(() => {
    return notifications.filter((n) => !n.read).length
  }, [notifications])

  const getBudgetExpenses = useCallback(
    (budgetId: string) => {
      return expenses.filter((e) => e.budgetId === budgetId)
    },
    [expenses],
  )

  const getTotalAllocated = useCallback(() => {
    return budgets.reduce((sum, b) => sum + b.allocatedAmount, 0)
  }, [budgets])

  const getTotalSpent = useCallback(() => {
    return budgets.reduce((sum, b) => sum + b.spentAmount, 0)
  }, [budgets])

  const getAnomaliesCount = useCallback(() => {
    return anomalies.filter((a) => a.status === "pending").length
  }, [anomalies])

  const generateTrackingCode = () => {
    const year = new Date().getFullYear()
    const num = String(feedbackReports.length + 1).padStart(3, "0")
    return `FB-${year}-${num}`
  }

  const addFeedbackReport = useCallback(
    (reportData: Omit<FeedbackReport, "id" | "submittedAt" | "status" | "trackingCode">) => {
      const trackingCode = generateTrackingCode()
      const newReport: FeedbackReport = {
        ...reportData,
        id: Date.now().toString(),
        submittedAt: new Date().toISOString(),
        status: "new",
        trackingCode,
      }
      setFeedbackReports((prev) => [newReport, ...prev])

      const notification: Notification = {
        id: Date.now().toString(),
        type: "alert",
        title: "New Anonymous Report",
        message: `A new ${reportData.category.replace("-", " ")} report has been submitted`,
        timestamp: new Date().toISOString(),
        read: false,
      }
      setNotifications((prev) => [notification, ...prev])

      return trackingCode
    },
    [feedbackReports.length],
  )

  const updateFeedbackStatus = useCallback((id: string, status: FeedbackReport["status"], hrNotes?: string) => {
    setFeedbackReports((prev) =>
      prev.map((report) => (report.id === id ? { ...report, status, hrNotes: hrNotes || report.hrNotes } : report)),
    )
  }, [])

  const getFeedbackByStatus = useCallback(
    (status: FeedbackReport["status"]) => {
      return feedbackReports.filter((r) => r.status === status)
    },
    [feedbackReports],
  )

  const getNewFeedbackCount = useCallback(() => {
    return feedbackReports.filter((r) => r.status === "new").length
  }, [feedbackReports])

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        expenses,
        anomalies,
        notifications,
        feedbackReports,
        addBudget,
        updateBudget,
        addExpense,
        updateAnomalyStatus,
        markNotificationRead,
        markAllNotificationsRead,
        getUnreadNotificationsCount,
        getBudgetExpenses,
        getTotalAllocated,
        getTotalSpent,
        getAnomaliesCount,
        addFeedbackReport,
        updateFeedbackStatus,
        getFeedbackByStatus,
        getNewFeedbackCount,
      }}
    >
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudget() {
  const context = useContext(BudgetContext)
  if (context === undefined) {
    throw new Error("useBudget must be used within a BudgetProvider")
  }
  return context
}
