export interface Budget {
  id: string
  eventName: string
  team: string
  allocatedAmount: number
  spentAmount: number
  startDate: string
  endDate: string
  status: "active" | "completed" | "exceeded"
  category: string
  description: string
  createdAt: string
} 

export interface User {
  id: string
  email: string
  name: string
  role: "finance_head" | "hr_admin" | "employee"
  department: string
  avatar?: string
}

export interface Expense {
  id: string
  budgetId: string
  description: string
  amount: number
  date: string
  submittedBy: string
  category: string
  receipt?: string
}

export interface Anomaly {
  id: string
  budgetId: string
  eventName: string
  team: string
  allocatedAmount: number
  exceededAmount: number
  percentageOver: number
  detectedAt: string
  status: "pending" | "reviewed" | "approved" | "rejected"
  reason?: string
}

export interface Notification {
  id: string
  type: "warning" | "alert" | "info"
  title: string
  message: string
  timestamp: string
  read: boolean
  budgetId?: string
}

export interface FeedbackReport {
  id: string
  category: "unfair-promotion" | "toxic-leadership" | "harassment" | "discrimination" | "retaliation" | "other"
  department: string
  severity: "low" | "medium" | "high" | "critical"
  subject: string
  description: string
  incidentDate?: string
  involvedParties?: string
  submittedAt: string
  status: "new" | "under-review" | "investigating" | "resolved" | "closed"
  hrNotes?: string
  assignedTo?: string
  isAnonymous: boolean
  trackingCode: string
}
