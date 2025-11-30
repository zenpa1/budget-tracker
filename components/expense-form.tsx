"use client"

import { useState } from "react"
import { useBudget } from "@/lib/budget-context"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Loader2, AlertCircle } from "lucide-react"
import type { Expense } from "@/lib/types"

interface ExpenseFormProps {
  budgetId?: string
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function ExpenseForm({ budgetId, trigger, onSuccess }: ExpenseFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { budgets, addExpense, reloadData } = useBudget()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    budgetId: budgetId || "",
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  })

  const activeBudgets = budgets.filter((b) => b.status === "active")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.budgetId) {
      setError("Please select a budget")
      return
    }

    if (!formData.description.trim()) {
      setError("Please enter a description")
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setLoading(true)

    try {
      const expense: Expense = {
        id: crypto.randomUUID(),
        budgetId: formData.budgetId,
        description: formData.description.trim(),
        amount: amount,
        date: formData.date,
        submittedBy: user?.id || "unknown",
        category: formData.category || "General",
      }

      console.log("Form submitting expense:", expense);
      console.log("Current user:", user);
      await addExpense(expense)

      // Reset form
      setFormData({
        budgetId: budgetId || "",
        description: "",
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
      })

      setOpen(false)
      
      // Force reload all data to show updated budgets and expenses
      await reloadData()
      
      onSuccess?.()
    } catch (err) {
      setError("Failed to add expense. Please try again.")
      console.error("Add expense error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>Record a new expense transaction for a budget.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!budgetId && (
              <div className="space-y-2">
                <Label htmlFor="budget">Budget *</Label>
                <Select
                  value={formData.budgetId}
                  onValueChange={(value) => setFormData({ ...formData, budgetId: value })}
                  disabled={loading}
                >
                  <SelectTrigger id="budget">
                    <SelectValue placeholder="Select a budget" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeBudgets.length === 0 ? (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        No active budgets available
                      </div>
                    ) : (
                      activeBudgets.map((budget) => (
                        <SelectItem key={budget.id} value={budget.id}>
                          {budget.eventName} - {budget.team}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="e.g., Catering services for team event"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                type="text"
                placeholder="e.g., Catering, Venue, Equipment"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Expense"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
