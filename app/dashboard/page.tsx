import React from "react"
import RootLayout from "../RootLayout"
import StatsGrid from "@/components/dashboard/StatsGrid"
import RecentOrders from "@/components/dashboard/RecentOrders"
import TopProducts from "@/components/dashboard/TopProducts"
import FinanceSnapshot from "@/components/dashboard/FinanceSnapshot"
import PaymentLineChart from "@/components/dashboard/PaymentLineChart"


const DashboardPage = () => {
  return (
    <RootLayout>
      <div className="font-montserrat p-3 space-y-8">
        <StatsGrid />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <RecentOrders />
          <TopProducts />
        </div>
        <PaymentLineChart />
        <FinanceSnapshot />
      </div>
    </RootLayout>
  )
}

export default DashboardPage
