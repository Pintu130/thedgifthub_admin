import React from "react"
import { ChevronUp, ChevronDown, Eye } from "lucide-react"
import { Order } from "@/types/order"

interface OrderTableProps {
  orders: Order[]
  sortField: keyof Order
  sortDirection: "asc" | "desc"
  onSort: (field: keyof Order) => void
  onViewOrder: (order: Order) => void
  onEditOrder: (order: Order) => void
  onDeleteOrder: (orderId: string) => void
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  sortField,
  sortDirection,
  onSort,
  onViewOrder,
}) => {
  const getStatusBadge = (status: string, type: "order" | "payment" | "fulfillment") => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"

    if (type === "order") {
      switch (status) {
        case "pending":
          return `${baseClasses} bg-yellow-100 text-yellow-800`
        case "confirmed":
          return `${baseClasses} bg-blue-100 text-blue-800`
        case "shipped":
          return `${baseClasses} bg-purple-100 text-purple-800`
        case "delivered":
          return `${baseClasses} bg-green-100 text-green-800`
        case "cancelled":
          return `${baseClasses} bg-pink-200 text-pink-800`
        case "refunded":
          return `${baseClasses} bg-gray-100 text-gray-800`
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`
      }
    }

    if (type === "payment") {
      switch (status) {
        case "paid":
          return `${baseClasses} bg-green-100 text-green-800`
        case "unpaid":
          return `${baseClasses} bg-red-100 text-red-800`
        case "refunded":
          return `${baseClasses} bg-gray-100 text-gray-800`
        case "partially_paid":
          return `${baseClasses} bg-orange-100 text-orange-800`
        default:
          return `${baseClasses} bg-gray-100 text-gray-800`
      }
    }

    // fulfillment
    switch (status) {
      case "fulfilled":
        return `${baseClasses} bg-green-100 text-green-800`
      case "unfulfilled":
        return `${baseClasses} bg-red-100 text-red-800`
      case "partially_fulfilled":
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const SortButton: React.FC<{ field: keyof Order; children: React.ReactNode }> = ({
    field,
    children,
  }) => (
    <button
      onClick={() => onSort(field)}
      className="flex items-center space-x-1 hover:text-pink-600 transition-colors"
    >
      <span>{children}</span>
      {sortField === field &&
        (sortDirection === "asc" ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        ))}
    </button>
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  return (
    <div className="bg-[#fbe6e8] rounded-lg shadow-md border border-pink-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-pink-200">
          <thead className="bg-transparent">
            <tr>
              {[
                "Order",
                "Customer",
                // "Date",
                "Status",
                "Payment",
                "Fulfillment",
                "Total",
                "Payment Method",
                "Actions",
              ].map((header, i) => (
                <th
                  key={i}
                  className="px-5 py-3 text-left text-sm font-bold text-pink-800 uppercase tracking-wider"
                >
                  {i !== 8 ? (
                    <SortButton field={header.toLowerCase().replace(" ", "_") as keyof Order}>
                      {header}
                    </SortButton>
                  ) : (
                    header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-red-300 divide-y divide-pink-100">
            {orders.map((order, idx) => (
              <tr
                key={order.order_id}
                className={`transition-colors ${
            "bg-white"
                } hover:bg-pink-50`}
              >
                <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.order_number}
                  {order.is_gift && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-200 text-pink-800">
                      🎁 Gift
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                  <div className="text-sm text-gray-500">{order.customer_email}</div>
                  <div className="text-sm text-gray-500">{order.customer_phone}</div>
                </td>
                {/* <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(order.order_date)}
                </td> */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(order.order_status, "order")}>
                    {order.order_status}
                  </span>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(order.payment_status, "payment")}>
                    {order.payment_status}
                  </span>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(order.fulfillment_status, "fulfillment")}>
                    {order.fulfillment_status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(order.grand_total, order.currency)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.items.length} item{order.items.length > 1 ? "s" : ""}
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.payment_method}
                  {order.transaction_id && (
                    <div className="text-sm text-gray-500">{order.transaction_id}</div>
                  )}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button
                    onClick={() => onViewOrder(order)}
                    className="text-pink-600 hover:text-pink-800 p-1 rounded hover:bg-pink-100 transition-colors"
                    title="View Order"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OrderTable
