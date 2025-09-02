import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { ReduxProvider } from "@/components/providers/redux-provider"
import 'react-date-range/dist/styles.css'; 

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "The D Gift Hub — Thoughtful Corporate & Personal Gifts",
  description: "Discover premium corporate gifts and personal surprises. Phone stands, diaries, books, key stands and more. Seamless checkout with Stripe.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ReduxProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
