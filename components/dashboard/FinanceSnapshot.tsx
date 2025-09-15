import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IndianRupee } from "lucide-react"

const FinanceSnapshot = () => {
  return (
    <Card className="border-0 shadow-lg bg-[#fff7f8] overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f8d2d6] via-[#f4aab3] to-[#e96b7c]"></div>

      <CardHeader className="border-b border-[#f8d2d6] bg-[#fdeef0]">
        <CardTitle className="text-xl font-semibold text-[#2d1b1e] flex items-center space-x-2">
          <IndianRupee className="h-5 w-5 text-[#c94a5a]" />
          <span>Payments & Finance Snapshot</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          <div className="text-center p-4 rounded-xl bg-[#fdeef0]">
            <p className="text-sm text-[#7d4b54] font-medium mb-1">Today's Payments</p>
            <p className="text-3xl font-bold text-[#c94a5a]">₹2,450</p>
            <p className="text-xs font-medium text-[#5a2d36] mt-1">+15% from yesterday</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-[#fbe6e8]">
            <p className="text-sm text-[#7d4b54] font-medium mb-1">Pending Payouts</p>
            <p className="text-3xl font-bold text-[#e96b7c]">₹850</p>
            <p className="text-xs font-medium text-[#5a2d36] mt-1">3 pending transactions</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-[#fdeef0]">
            <p className="text-sm text-[#7d4b54] font-medium mb-1">Failed Payments</p>
            <p className="text-3xl font-bold text-[#c94a5a]">5</p>
            <p className="text-xs font-medium text-[#5a2d36] mt-1">-2 from yesterday</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-[#fbe6e8]">
            <p className="text-sm text-[#7d4b54] font-medium mb-1">Net Revenue</p>
            <p className="text-3xl font-bold text-[#c94a5a]">₹1,950</p>
            <p className="text-xs font-medium text-[#5a2d36] mt-1">After refunds & fees</p>
          </div>
        </div>

        {/* Payment Method Distribution */}
        <div className="bg-[#fdeef0] rounded-xl p-4">
          <h3 className="font-semibold text-[#5a2d36] mb-3">Payment Method Distribution</h3>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <div className="w-3 h-3 rounded-full bg-[#c94a5a]"></div>
              <span className="text-sm font-medium text-[#7d4b54]">COD</span>
              <span className="text-sm font-bold text-[#2d1b1e]">45%</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <div className="w-3 h-3 rounded-full bg-[#e96b7c]"></div>
              <span className="text-sm font-medium text-[#7d4b54]">UPI</span>
              <span className="text-sm font-bold text-[#2d1b1e]">30%</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <div className="w-3 h-3 rounded-full bg-[#f4aab3]"></div>
              <span className="text-sm font-medium text-[#7d4b54]">Card</span>
              <span className="text-sm font-bold text-[#2d1b1e]">25%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default FinanceSnapshot
