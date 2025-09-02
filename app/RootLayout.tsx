import type React from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard - Admin Panel",
  description: "Admin Dashboard",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#fbe6e8]">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <DashboardHeader />
      </div>

      <div className="flex pt-16"> {/* pt-16 = height of header (h-16 = 64px) */}
        {/* Sidebar */}
        <div className="hidden md:block fixed top-16 left-0 h-[calc(100vh-64px)] w-72 z-40">
          <DashboardSidebar />
        </div>

        {/* Main content with margin to avoid sidebar overlap */}
        <main className="flex-1 md:ml-72 p-4 md:p-6 overflow-auto h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  )
}
