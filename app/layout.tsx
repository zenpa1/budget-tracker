import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata: Metadata = {
  title: "verity",
  description: "Company budget tracking and anomaly detection system for Finance Heads",
  icons: {
    icon: "/branding/verity-favicon.ico",
    apple: "/branding/verity-favicon.png",
  },
  generator: "v0.app"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono&family=Geist:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        {/* If custom branding icons are missing, Next will fall back to /favicon.ico automatically */}
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
