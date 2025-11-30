"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useBudget } from "@/lib/budget-context"
import { Bell, AlertTriangle, AlertCircle, Info, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function NotificationList() {
  const { notifications, markNotificationRead, markAllNotificationsRead, loading } = useBudget()

  const getIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-destructive" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-warning" />
      case "info":
        return <Info className="h-5 w-5 text-primary" />
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return "Just now"
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-foreground">Notifications</CardTitle>
          <CardDescription>
            {loading ? "Loading..." : unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
          </CardDescription>
        </div>
        {!loading && unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllNotificationsRead}>
            <Check className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <LoadingSpinner size={28} className="text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex cursor-pointer items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-secondary",
                  !notification.read && "bg-secondary/50",
                )}
                onClick={() => markNotificationRead(notification.id)}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={cn("font-medium", notification.read ? "text-muted-foreground" : "text-foreground")}>
                      {notification.title}
                    </p>
                    <span className="text-xs text-muted-foreground">{formatTimestamp(notification.timestamp)}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                </div>
                {!notification.read && <div className="h-2 w-2 rounded-full bg-primary" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
