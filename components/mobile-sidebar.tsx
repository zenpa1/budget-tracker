"use client"

import { useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useBudget } from "@/lib/budget-context"
import { useAuth } from "@/lib/auth-context"
import { LayoutDashboard, Wallet, AlertTriangle, FileText, Bell, Settings, ShieldAlert } from "lucide-react"
import { Logo } from "@/components/logo"

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Budgets", href: "/budgets", icon: Wallet },
  { name: "Anomalies", href: "/anomalies", icon: AlertTriangle },
  { name: "Reports", href: "/reports", icon: FileText },
]

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const { getUnreadNotificationsCount, getAnomaliesCount, getNewFeedbackCount } = useBudget()
  const { user } = useAuth()
  const unreadCount = getUnreadNotificationsCount()
  const anomaliesCount = getAnomaliesCount()
  const newFeedbackCount = getNewFeedbackCount()

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = "auto"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [open])

  if (!open) return null

  return (
    <div className="md:hidden fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="relative h-full w-64 border-r border-border bg-sidebar">
        <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-6">
          <Logo height={32} width={140} />
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 overflow-auto">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Main Menu</p>
          {navigation
            .filter((item) => {
              if (item.name === "Reports" && user?.role !== "finance_head") return false
              return true
            })
            .map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
                {item.name === "Anomalies" && anomaliesCount > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                    {anomaliesCount}
                  </span>
                )}
              </Link>
            ))}

          <div className="my-4 border-t border-sidebar-border" />

          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Anonymous Reports</p>
          <Link href="/hr-channel" onClick={onClose} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <ShieldAlert className="h-5 w-5" />
            Anonymous Reports
            {user?.role === "hr_admin" && newFeedbackCount > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs text-amber-950">{newFeedbackCount}</span>
            )}
          </Link>

          <div className="my-4 border-t border-sidebar-border" />

          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">System</p>
          <Link href="/notifications" onClick={onClose} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{unreadCount}</span>
            )}
          </Link>

          <Link href="/settings" onClick={onClose} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">{user?.name ? user.name.charAt(0) : "JD"}</div>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground">{user?.name ?? "Jane Doe"}</p>
              <p className="text-xs text-muted-foreground">{user?.role === "finance_head" ? "Finance Head" : user?.role === "hr_admin" ? "HR Admin" : "Employee"}</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
