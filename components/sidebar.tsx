"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useBudget } from "@/lib/budget-context"
import { LayoutDashboard, Wallet, AlertTriangle, FileText, Bell, Settings, TrendingUp, ShieldAlert } from "lucide-react"

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Budgets", href: "/budgets", icon: Wallet },
  { name: "Anomalies", href: "/anomalies", icon: AlertTriangle },
  { name: "Reports", href: "/reports", icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()
  const { getUnreadNotificationsCount, getAnomaliesCount, getNewFeedbackCount } = useBudget()
  const unreadCount = getUnreadNotificationsCount()
  const anomaliesCount = getAnomaliesCount()
  const newFeedbackCount = getNewFeedbackCount()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">BudgetTrack</h1>
            <p className="text-xs text-muted-foreground">Finance Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Main Menu</p>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const showBadge = item.name === "Anomalies" && anomaliesCount > 0

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
                {showBadge && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                    {anomaliesCount}
                  </span>
                )}
              </Link>
            )
          })}

          <div className="my-4 border-t border-sidebar-border" />

          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">HR Channel</p>
          <Link
            href="/hr-channel"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === "/hr-channel"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <ShieldAlert className="h-5 w-5" />
            Anonymous Reports
            {newFeedbackCount > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs text-amber-950">
                {newFeedbackCount}
              </span>
            )}
          </Link>

          <div className="my-4 border-t border-sidebar-border" />

          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">System</p>
          <Link
            href="/notifications"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === "/notifications"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === "/settings"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              JD
            </div>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">Jane Doe</p>
              <p className="text-xs text-muted-foreground">Finance Head</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
