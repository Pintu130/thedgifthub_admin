import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface Stat {
  title: string
  value: string
  icon: React.ElementType
  change: string
  changeType: "positive" | "negative"
  bgGradient: string
}

const stats: Stat[] = [
  { title: "Total Sales", value: "₹45,230", icon: require("lucide-react").IndianRupee, change: "+12.5%", changeType: "positive", bgGradient: "from-blue-500 to-blue-600" },
  { title: "Total Orders", value: "1,200", icon: require("lucide-react").ShoppingCart, change: "+8.2%", changeType: "positive", bgGradient: "from-green-500 to-green-600" },
  { title: "Total Customers", value: "3,450", icon: require("lucide-react").Users, change: "+15.3%", changeType: "positive", bgGradient: "from-purple-500 to-purple-600" },
  { title: "Average Order Value", value: "₹37.69", icon: require("lucide-react").BarChart3, change: "+5.8%", changeType: "positive", bgGradient: "from-orange-500 to-orange-600" },
  { title: "Refund Rate", value: "2.4%", icon: require("lucide-react").RotateCcw, change: "-0.8%", changeType: "negative", bgGradient: "from-red-500 to-red-600" },
]

const StatsGrid = () => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
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
      ))}
    </div>
  )
}

export default StatsGrid
