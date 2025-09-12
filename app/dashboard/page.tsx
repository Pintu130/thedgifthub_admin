import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, DollarSign, Users, BarChart3, RotateCcw, TrendingUp, Package, Clock, CheckCircle } from "lucide-react"
import RootLayout from "../RootLayout"

// Dummy data
const stats = [
  { title: "Total Sales", value: "$45,230", icon: DollarSign, change: "+12.5%", changeType: "positive", bgGradient: "from-blue-500 to-blue-600" },
  { title: "Total Orders", value: "1,200", icon: ShoppingCart, change: "+8.2%", changeType: "positive", bgGradient: "from-green-500 to-green-600" },
  { title: "Total Customers", value: "3,450", icon: Users, change: "+15.3%", changeType: "positive", bgGradient: "from-purple-500 to-purple-600" },
  { title: "Average Order Value", value: "$37.69", icon: BarChart3, change: "+5.8%", changeType: "positive", bgGradient: "from-orange-500 to-orange-600" },
  { title: "Refund Rate", value: "2.4%", icon: RotateCcw, change: "-0.8%", changeType: "negative", bgGradient: "from-red-500 to-red-600" },
]

const topProducts = [
  { img: "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=100", name: "Apple iPhone 13", units: 320, revenue: "$999.29", stock: 15, category: "Electronics" },
  { img: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=100", name: "Nike Air Jordan", units: 210, revenue: "$72.40", stock: 35, category: "Fashion" },
  { img: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=100", name: "Beats Studio 2", units: 180, revenue: "$99.90", stock: 20, category: "Electronics" },
  { img: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=100", name: "Apple Watch Series 7", units: 140, revenue: "$249.99", stock: 10, category: "Electronics" },
  { img: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=100", name: "PlayStation Console", units: 120, revenue: "$499.99", stock: 8, category: "Gaming" },
]

const orders = [
  { id: "#ORD-1001", customer: "Michael Hughes", img: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100", amount: "$230.00", method: "Card", status: "Pending", date: "2025-09-11" },
  { id: "#ORD-1002", customer: "Daisy Coleman", img: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100", amount: "$120.00", method: "UPI", status: "Shipped", date: "2025-09-11" },
  { id: "#ORD-1003", customer: "Glenn Todd", img: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100", amount: "$540.00", method: "COD", status: "Processing", date: "2025-09-10" },
  { id: "#ORD-1004", customer: "Arthur West", img: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100", amount: "$320.00", method: "Card", status: "Delivered", date: "2025-09-10" },
]

const DashboardPage = () => {
  return (
    <RootLayout>
      <div className="font-montserrat">


        <div className="p-3 space-y-8">
          {/* Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3
           xl:grid-cols-5">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="relative overflow-hidden border-0 shadow-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-[#fdeef0] cursor-pointer"
              >
                <div className={`absolute inset-0`}></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.bgGradient} shadow-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${stat.changeType === 'positive'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                      }`}>
                      <TrendingUp className={`h-3 w-3 ${stat.changeType === 'negative' ? 'rotate-180' : ''}`} />
                      <span>{stat.change}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Recent Orders */}
            <Card className="xl:col-span-2 border-0 shadow-lg bg-[#fff7f8]">
              <CardHeader className="border-b border-[#f8d2d6] bg-[#fdeef0]">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-[#2d1b1e] flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-[#e96b7c]" />
                    <span>Recent Orders</span>
                  </CardTitle>
                  <span className="text-sm text-[#7d4b54]">Last 24 hours</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-y-auto">
                  {orders.map((order, i) => (
                    <div
                      key={i}
                      className={`p-6 hover:bg-[#fdeef0] transition-colors ${i !== orders.length - 1 ? 'border-b border-[#f8d2d6]' : ''
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <img
                              src={order.img}
                              alt={order.customer}
                              className="h-12 w-12 rounded-full object-cover ring-2 ring-[#fdeef0]"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                          </div>
                          <div>
                            <p className="font-semibold text-[#2d1b1e]">{order.customer}</p>
                            <p className="text-sm text-[#7d4b54]">{order.id}</p>
                            <p className="text-xs text-[#a6787f]">{order.date}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <p className="font-bold text-lg text-[#2d1b1e]">{order.amount}</p>
                          <p className="text-sm text-[#5a2d36] bg-[#fdeef0] px-2 py-1 rounded">
                            {order.method}
                          </p>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium
                    ${order.status === 'Pending'
                                ? 'bg-amber-100 text-amber-700'
                                : order.status === 'Shipped'
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : order.status === 'Processing'
                                    ? 'bg-pink-100 text-pink-700'
                                    : 'bg-emerald-100 text-emerald-700'
                              }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Selling Products */}
            <Card className="border-0 shadow-lg bg-[#fff7f8]">
              <CardHeader className="border-b border-[#f8d2d6] bg-[#fdeef0]">
                <CardTitle className="text-xl font-semibold text-[#2d1b1e] flex items-center space-x-2">
                  <Package className="h-5 w-5 text-[#c94a5a]" />
                  <span>Top Products</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-y-auto">
                  {topProducts.map((product, i) => (
                    <div
                      key={i}
                      className={`p-4 hover:bg-[#fdeef0] transition-colors ${i !== topProducts.length - 1 ? 'border-b border-[#f8d2d6]' : ''
                        }`}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={product.img}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover ring-1 ring-[#e4b7bc]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#2d1b1e] truncate">{product.name}</p>
                          <p className="text-sm text-[#7d4b54]">{product.category}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-gradient-to-r from-[#fdeef0] to-[#f8d2d6] p-2 rounded">
                          <p className="text-[#5a2d36] font-medium">Revenue</p>
                          <p className="text-[#2d1b1e] font-bold">{product.revenue}</p>
                        </div>
                        <div className="bg-gradient-to-r from-[#fdeef0] to-[#f8d2d6] p-2 rounded">
                          <p className="text-[#5a2d36] font-medium">Units</p>
                          <p className="text-[#2d1b1e] font-bold">{product.units}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[#7d4b54]">Stock</span>
                          <span
                            className={`text-xs font-medium ${product.stock < 15 ? 'text-[#c94a5a]' : 'text-[#2d1b1e]'
                              }`}
                          >
                            {product.stock} units
                          </span>
                        </div>
                        <div className="mt-1 bg-[#fdeef0] rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${product.stock < 15 ? 'bg-[#c94a5a]' : 'bg-[#e96b7c]'
                              }`}
                            style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>



          {/* Payments & Finance Snapshot */}
          <Card className="border-0 shadow-lg bg-[#fff7f8] overflow-hidden relative">
            {/* Top pink gradient border */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f8d2d6] via-[#f4aab3] to-[#e96b7c]"></div>

            <CardHeader className="border-b border-[#f8d2d6] bg-[#fdeef0]">
              <CardTitle className="text-xl font-semibold text-[#2d1b1e] flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-[#c94a5a]" />
                <span>Payments & Finance Snapshot</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 rounded-xl bg-[#fdeef0]">
                  <p className="text-sm text-[#7d4b54] font-medium mb-1">Today's Payments</p>
                  <p className="text-3xl font-bold text-[#c94a5a]">$2,450</p>
                  <p className="text-xs font-medium text-[#5a2d36] mt-1">+15% from yesterday</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-[#fbe6e8]">
                  <p className="text-sm text-[#7d4b54] font-medium mb-1">Pending Payouts</p>
                  <p className="text-3xl font-bold text-[#e96b7c]">$850</p>
                  <p className="text-xs font-medium text-[#5a2d36] mt-1">3 pending transactions</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-[#fdeef0]">
                  <p className="text-sm text-[#7d4b54] font-medium mb-1">Failed Payments</p>
                  <p className="text-3xl font-bold text-[#c94a5a]">5</p>
                  <p className="text-xs font-medium text-[#5a2d36] mt-1">-2 from yesterday</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-[#fbe6e8]">
                  <p className="text-sm text-[#7d4b54] font-medium mb-1">Net Revenue</p>
                  <p className="text-3xl font-bold text-[#c94a5a]">$1,950</p>
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



        </div>
      </div>
    </RootLayout>
  )
}

export default DashboardPage