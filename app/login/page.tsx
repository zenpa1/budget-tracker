"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/login-form"
import { ThemeProvider } from "@/lib/theme-context"
import { AuthProvider } from "@/lib/auth-context"

function LoginPageContent() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  if (isAuthenticated) return null

  // Keep form mounted during loading so error state persists
  return <LoginForm />
}

export default function LoginPage() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LoginPageContent />
      </AuthProvider>
    </ThemeProvider>
  )
}
