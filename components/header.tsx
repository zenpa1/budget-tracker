"use client"

import { Bell, Search, Sun, Moon, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useBudget } from "@/lib/budget-context"
import { useTheme } from "@/lib/theme-context"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { useState } from "react"

interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const openMobile = () => setMobileOpen(true)
  const closeMobile = () => setMobileOpen(false)
  const { getUnreadNotificationsCount, loading } = useBudget()
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const unreadCount = getUnreadNotificationsCount()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <>
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-3">
        <button onClick={openMobile} className="md:hidden -ml-2 mr-3 p-1 rounded-md hover:bg-secondary" aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>

        <div className="flex-1 min-w-0 pr-4">
        <h1 title={title} className="text-lg sm:text-xl font-semibold text-foreground truncate">{title}</h1>
        {description && (
          <p title={description} className="text-sm text-muted-foreground truncate">
            {description}
          </p>
        )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" placeholder="Search budgets..." className="w-64 bg-secondary pl-9" />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="relative">
            {loading ? <LoadingSpinner className="text-foreground" size={18} /> : <Bell className="h-5 w-5" />}
            {unreadCount > 0 && !loading && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                {unreadCount}
              </span>
            )}
          </Button>
        </Link>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {user.role.replace("_", " ")} - {user.department}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
    <MobileSidebar open={mobileOpen} onClose={closeMobile} />
    </>
  )
}
