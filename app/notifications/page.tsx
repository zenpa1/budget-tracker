"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { NotificationList } from "@/components/notification-list"
import { BudgetProvider } from "@/lib/budget-context"
import { ThemeProvider } from "@/lib/theme-context"
import { AuthProvider } from "@/lib/auth-context"
import { AuthGuard } from "@/components/auth-guard"

export default function NotificationsPage() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGuard>
          <BudgetProvider>
            <div className="min-h-screen bg-background">
              <Sidebar />
              <main className="pl-64">
                <Header title="Notifications" description="View all system alerts and updates" />
                <div className="p-6">
                  <NotificationList />
                </div>
              </main>
            </div>
          </BudgetProvider>
        </AuthGuard>
      </AuthProvider>
    </ThemeProvider>
  )
}
