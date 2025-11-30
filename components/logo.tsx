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
  const configuredBase = process.env.NEXT_PUBLIC_BRAND_LOGO_BASE
  // Only use branding base if explicitly configured to avoid 404s when files are absent
  const usingBranding = Boolean(configuredBase)
  const base = usingBranding ? configuredBase : "/logos/logo"
  const lightPath = usingBranding ? `${base}-light.svg` : `${base}-light.svg`
  const darkPath = usingBranding ? `${base}-dark.svg` : `${base}-dark.svg`
  const fallbackLight = "/logos/logo-light.svg"
  const fallbackDark = "/logos/logo-dark.svg"
  const logoSrc = theme === "dark" ? darkPath : lightPath
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "Verity"

  return (
    <Image
      src={logoSrc}
      alt={`${brandName} Logo`}
      height={height}
      width={width}
      priority
      className={className}
      onError={(e) => {
        const target = e.currentTarget as HTMLImageElement
        // Fallback to known existing logos without causing repeated 404s
        target.src = theme === "dark" ? fallbackDark : fallbackLight
      }}
    />
  )
}
