"use client"

import Image from "next/image"
import { useTheme } from "@/lib/theme-context"

interface LogoProps {
  height?: number
  width?: number
  className?: string
}

export function Logo({ height = 40, width = 120, className = "" }: LogoProps) {
  const { theme } = useTheme()

  const logoSrc = theme === "dark" ? "/logos/logo-dark.svg" : "/logos/logo-light.svg"

  return (
    <Image
      src={logoSrc}
      alt="BudgetTrack Logo"
      height={height}
      width={width}
      priority
      className={className}
    />
  )
}
