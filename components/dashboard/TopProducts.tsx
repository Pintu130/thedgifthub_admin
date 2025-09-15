import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package } from "lucide-react"

const topProducts = [
  { img: "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=100", name: "Apple iPhone 13", units: 320, revenue: "₹999.29", stock: 15, category: "Electronics" },
  { img: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=100", name: "Nike Air Jordan", units: 210, revenue: "₹72.40", stock: 35, category: "Fashion" },
  { img: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=100", name: "Beats Studio 2", units: 180, revenue: "₹99.90", stock: 20, category: "Electronics" },
  { img: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=100", name: "Apple Watch Series 7", units: 140, revenue: "₹249.99", stock: 10, category: "Electronics" },
  { img: "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=100", name: "PlayStation Console", units: 120, revenue: "₹499.99", stock: 8, category: "Gaming" },
]

const TopProducts = () => {
  return (
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
              className={`p-3 hover:bg-[#fdeef0] transition-colors ${
                i !== topProducts.length - 1 ? "border-b border-[#f8d2d6]" : ""
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <img src={product.img} alt={product.name} className="h-8 w-8 rounded-lg object-cover ring-1 ring-[#e4b7bc]" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#2d1b1e] truncate">{product.name}</p>
                  <p className="text-xs text-[#7d4b54]">{product.category}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gradient-to-r from-[#fdeef0] to-[#f8d2d6] p-1.5 rounded">
                  <p className="text-[#5a2d36] font-medium">Revenue</p>
                  <p className="text-[#2d1b1e] font-bold">{product.revenue}</p>
                </div>
                <div className="bg-gradient-to-r from-[#fdeef0] to-[#f8d2d6] p-1.5 rounded">
                  <p className="text-[#5a2d36] font-medium">Units</p>
                  <p className="text-[#2d1b1e] font-bold">{product.units}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default TopProducts
