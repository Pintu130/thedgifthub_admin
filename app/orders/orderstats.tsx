import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, IndianRupee, TrendingUp, Package, Users } from "lucide-react"

interface Stat {
  title: string
  value: string
  icon: React.ElementType
  change: string
  changeType: "positive" | "negative"
  bgGradient: string
}

interface OrderStatsProps {
  orders: any[]
}

const OrderStats: React.FC<OrderStatsProps> = ({ orders }) => {
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + order.grand_total, 0)
  const pendingOrders = orders.filter(order => order.order_status === "pending").length
  const deliveredOrders = orders.filter(order => order.order_status === "delivered").length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)

  const stats: Stat[] = [
    { 
      title: "Total Revenue", 
      value: `₹${formatCurrency(totalRevenue)}`, 
      icon: IndianRupee, 
      change: "+12.5%", 
      changeType: "positive" as const, 
      bgGradient: "from-[#A30000] to-[#800000]" 
    },
    { 
      title: "Total Orders", 
      value: totalOrders.toString(), 
      icon: ShoppingCart, 
      change: "+8.2%", 
      changeType: "positive" as const, 
      bgGradient: "from-[#ff6b6b] to-[#c44545]" 
    },
    { 
      title: "Pending Orders", 
      value: pendingOrders.toString(), 
      icon: Package, 
      change: "+15.3%", 
      changeType: "positive" as const, 
      bgGradient: "from-[#ff8e8e] to-[#d96666]" 
    },
    { 
      title: "Average Order Value", 
      value: `₹${formatCurrency(averageOrderValue)}`, 
      icon: TrendingUp, 
      change: "+5.8%", 
      changeType: "positive" as const, 
      bgGradient: "from-[#ffb3b3] to-[#e68a8a]" 
    },
  ]

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card
            key={index}
            className="relative overflow-hidden border-0 shadow-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-[#fbe6e8] cursor-pointer"
          >
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.bgGradient} shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                    stat.changeType === "positive"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <TrendingUp className={`h-3 w-3 ${stat.changeType === "negative" ? "rotate-180" : ""}`} />
                  <span>{stat.change}</span>
                </div>
              </div>
              <div>
                <p className="md:text-sm text-xs font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="2xl:text-2xl text-lg font-bold text-gray-800">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default OrderStats