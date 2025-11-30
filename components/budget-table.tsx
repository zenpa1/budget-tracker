"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { useBudget } from "@/lib/budget-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

export function BudgetTable() {
  const { budgets, loading } = useBudget()

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
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Event</TableHead>
            <TableHead className="text-muted-foreground">Team</TableHead>
            <TableHead className="text-muted-foreground">Category</TableHead>
            <TableHead className="text-muted-foreground">Budget</TableHead>
            <TableHead className="text-muted-foreground">Spent</TableHead>
            <TableHead className="text-muted-foreground">Progress</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-right text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            // Render a spinner row while loading, otherwise render budget rows
          }
          {loading ? (
            // Show several skeleton rows while budgets are loading
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`} className="border-border">
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-2 w-20" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-6 rounded-full" />
                </TableCell>
              </TableRow>
            ))
          ) : (
            budgets.map((budget) => {
              const percentage = (budget.spentAmount / budget.allocatedAmount) * 100
              const isOver = percentage > 100

              return (
                <TableRow key={budget.id} className="border-border">
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{budget.eventName}</p>
                      <p className="text-xs text-muted-foreground">
                        {budget.startDate} - {budget.endDate}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{budget.team}</TableCell>
                  <TableCell className="text-muted-foreground">{budget.category}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    ${budget.allocatedAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className={isOver ? "text-destructive" : "text-foreground"}>
                    ${budget.spentAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={Math.min(percentage, 100)}
                        className={`h-2 w-20 ${isOver ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"}`}
                      />
                      <span className={`text-xs ${isOver ? "text-destructive" : "text-muted-foreground"}`}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(budget.status)}>
                      {budget.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/budgets/${budget.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
