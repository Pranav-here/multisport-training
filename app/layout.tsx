import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "AthletIQ - Train smarter across every sport",
  description: "The all-in-one platform for multi-sport athletes to train, track progress, and compete.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/athleIQ-icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/athleIQ-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/athleIQ-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
