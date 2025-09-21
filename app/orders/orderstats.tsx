import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, DollarSign, TrendingUp, Package, IndianRupee } from "lucide-react"
import { Order } from "@/types/order"

interface OrderStatsProps {
  orders: Order[]
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


  const stats = [
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      icon: ShoppingCart,
      change: "+12%",
      changeType: "positive" as const,
      bgGradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: IndianRupee,
      change: "+8.2%",
      changeType: "positive" as const,
      bgGradient: "from-green-500 to-green-600",
    },
    {
      title: "Average Order Value",
      value: formatCurrency(averageOrderValue),
      icon: TrendingUp,
      change: "+5.1%",
      changeType: "positive" as const,
      bgGradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Pending Orders",
      value: pendingOrders.toString(),
      icon: Package,
      change: "-3%",
      changeType: "negative" as const,
      bgGradient: "from-orange-500 to-orange-600",
    },
  ]

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="relative overflow-hidden border-0 shadow-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-[# ] cursor-pointer"
        >
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.bgGradient} shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div
                className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${stat.changeType === "positive"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                  }`}
              >
                <TrendingUp
                  className={`h-3 w-3 ${stat.changeType === "negative" ? "rotate-180" : ""}`}
                />
                <span>{stat.change}</span>
              </div>
            </div>
            <div>
              <p className="md:text-sm text-xs font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="2xl:text-2xl text-lg font-bold text-gray-800">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default OrderStats
