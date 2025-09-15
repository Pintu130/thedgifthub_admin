import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

const orders = [
    { id: "#ORD-1001", customer: "Michael Hughes", img: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg", amount: "₹230.00", method: "Card", status: "Pending", date: "2025-09-11" },
    { id: "#ORD-1002", customer: "Daisy Coleman", img: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg", amount: "₹120.00", method: "UPI", status: "Shipped", date: "2025-09-11" },
    { id: "#ORD-1003", customer: "Glenn Todd", img: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg", amount: "₹540.00", method: "COD", status: "Processing", date: "2025-09-10" },
    { id: "#ORD-1004", customer: "Arthur West", img: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg", amount: "₹320.00", method: "Card", status: "Delivered", date: "2025-09-10" },
    { id: "#ORD-1001", customer: "Michael Hughes", img: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg", amount: "₹230.00", method: "Card", status: "Pending", date: "2025-09-11" },
    { id: "#ORD-1002", customer: "Daisy Coleman", img: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg", amount: "₹120.00", method: "UPI", status: "Shipped", date: "2025-09-11" },
    { id: "#ORD-1003", customer: "Glenn Todd", img: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg", amount: "₹540.00", method: "COD", status: "Processing", date: "2025-09-10" },
    { id: "#ORD-1004", customer: "Arthur West", img: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg", amount: "₹320.00", method: "Card", status: "Delivered", date: "2025-09-10" },
]

const RecentOrders = () => {
    return (
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
                            className={`p-3 hover:bg-[#fdeef0] transition-colors ${i !== orders.length - 1 ? "border-b border-[#f8d2d6]" : ""
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                {/* Customer Info */}
                                <div className="flex items-center space-x-2">
                                    <img src={order.img} alt={order.customer} className="h-8 w-8 rounded-full object-cover ring-1 ring-[#f8d2d6]" />
                                    <div>
                                        <p className="font-medium text-sm text-[#2d1b1e]">{order.customer}</p>
                                        <p className="text-xs text-[#7d4b54]">{order.id}</p>
                                        <p className="text-[11px] text-[#a6787f]">{order.date}</p>
                                    </div>
                                </div>

                                {/* Order Info */}
                                <div className="grid grid-cols-3 gap-2 text-[11px] min-w-[200px] text-center">
                                    <div className="bg-gradient-to-r from-[#fdeef0] to-[#f8d2d6] px-2 py-1 rounded">
                                        <p className="text-[#5a2d36]">Amt</p>
                                        <p className="text-[#2d1b1e] font-semibold">{order.amount}</p>
                                    </div>
                                    <div className="bg-gradient-to-r from-[#fdeef0] to-[#f8d2d6] px-2 py-1 rounded">
                                        <p className="text-[#5a2d36]">Pay</p>
                                        <p className="text-[#2d1b1e] font-semibold">{order.method}</p>
                                    </div>
                                    <div
                                        className={`px-2 py-1 rounded font-medium ${order.status === "Pending"
                                                ? "bg-amber-100 text-amber-700"
                                                : order.status === "Shipped"
                                                    ? "bg-indigo-100 text-indigo-700"
                                                    : order.status === "Processing"
                                                        ? "bg-pink-100 text-pink-700"
                                                        : "bg-emerald-100 text-emerald-700"
                                            }`}
                                    >
                                        {order.status}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default RecentOrders
