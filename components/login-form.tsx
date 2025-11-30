"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Moon, Sun } from "lucide-react"
import { Logo } from "@/components/logo"
import { useTheme } from "@/lib/theme-context"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const result = await login(email, password)

    if (result.success) {
      router.push("/")
    } else {
      setError(result.error || "Login failed")
    }

    setIsLoading(false)
  }

  const heroImage = theme === "dark" ? "/images/login-hero-dark.jpg" : "/images/login-hero-light.jpg"

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Hero Image (theme-aware) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center transition-[background-image] duration-300"
          style={{ backgroundImage: `url('${heroImage}')` }}
          aria-hidden="true"
        />
      </div>

      {/* Right side - Login Form */}
      <div className="flex w-full lg:w-1/2 xl:w-2/5 items-center justify-center p-8 bg-background relative">
        {/* Theme Toggle Button - Top Right */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="absolute top-4 right-4"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex items-center justify-center">
              <Logo height={40} width={140} />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-8 rounded-lg border border-border bg-muted/50 p-4">
            <p className="mb-2 text-sm font-medium text-foreground">Demo Credentials</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                <span className="font-medium">Finance Head:</span> finance@company.com / finance123
              </p>
              <p>
                <span className="font-medium">HR Admin:</span> hr@company.com / hr123
              </p>
              <p>
                <span className="font-medium">Employee:</span> employee@company.com / emp123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
