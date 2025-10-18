import type React from "react"
import type { Metadata } from "next"
import { Inter, Barlow_Condensed } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "AthletIQs - Train smarter across every sport",
  description: "The all-in-one platform for multi-sport athletes to train, track progress, and compete.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
}

const interfaceFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const displayFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["800", "900"],
  style: "italic",
  variable: "--font-barlow-condensed",
  display: "swap",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${interfaceFont.variable} ${displayFont.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
