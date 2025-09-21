import React from "react"
import { Search, Filter, Calendar, Download } from "lucide-react"
import { OrderFilters as OrderFiltersType } from "@/types/order"
import { Card, CardContent } from "@/components/ui/card"

interface OrderFiltersProps {
  filters: OrderFiltersType
  onFiltersChange: (filters: OrderFiltersType) => void
  onExport: () => void
}

const OrderFilters: React.FC<OrderFiltersProps> = ({ filters, onFiltersChange, onExport }) => {
  const updateFilter = (key: keyof OrderFiltersType, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <Card className="border-0 shadow-lg bg-transparent">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
              <Filter className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          <button
            onClick={onExport}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, customers..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Order Status */}
          <select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Payment Status */}
          <select
            value={filters.paymentStatus}
            onChange={(e) => updateFilter("paymentStatus", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Payment Status</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
            <option value="partially_paid">Partially Paid</option>
          </select>

          {/* Payment Method */}
          <select
            value={filters.paymentMethod}
            onChange={(e) => updateFilter("paymentMethod", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Payment Methods</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
            <option value="PayPal">PayPal</option>
            <option value="COD">Cash on Delivery</option>
            <option value="Stripe">Stripe</option>
            <option value="Razorpay">Razorpay</option>
            <option value="Wallet">Wallet</option>
          </select>

          {/* Date From */}
          {/* <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter("dateFrom", e.target.value)}
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div> */}

          {/* Date To */}
          {/* <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter("dateTo", e.target.value)}
              className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div> */}

          {/* Fulfillment Status */}
          <select
            value={filters.fulfillmentStatus}
            onChange={(e) => updateFilter("fulfillmentStatus", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Fulfillment Status</option>
            <option value="unfulfilled">Unfulfilled</option>
            <option value="partially_fulfilled">Partially Fulfilled</option>
            <option value="fulfilled">Fulfilled</option>
          </select>

          {/* Order Type */}
          <select
            value={filters.orderType}
            onChange={(e) => updateFilter("orderType", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Order Types</option>
            <option value="normal">Normal</option>
            <option value="gift">Gift</option>
            <option value="bulk">Bulk</option>
          </select>
        </div>
      </CardContent>
    </Card>
  )
}

export default OrderFilters
