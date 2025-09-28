"use client"

import { X, Package, CreditCard, Truck, MapPin, Gift, FileText, Calendar, ShoppingBag, Tag } from "lucide-react"
import { Order } from "@/types/order"

interface OrderDetailsModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  // Format date for display (DD/MM/YYYY)
  const formatDateShort = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Get status badge style
  const getStatusStyle = (status: string, type: string) => {
    if (type === "order") {
      switch (status) {
        case "delivered": return "bg-green-100 text-green-800 border-green-200"
        case "shipped": return "bg-blue-100 text-blue-800 border-blue-200"
        case "confirmed": return "bg-purple-100 text-purple-800 border-purple-200"
        case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200"
        case "cancelled": return "bg-red-100 text-red-800 border-red-200"
        default: return "bg-gray-100 text-gray-800 border-gray-200"
      }
    }
    
    if (type === "payment") {
      switch (status) {
        case "paid": return "bg-green-100 text-green-800 border-green-200"
        case "unpaid": return "bg-red-100 text-red-800 border-red-200"
        case "refunded": return "bg-gray-100 text-gray-800 border-gray-200"
        default: return "bg-gray-100 text-gray-800 border-gray-200"
      }
    }
    
    return "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#ffeeee] px-8 py-6 border-b border-[#A30000]/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#A30000] rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#A30000]">Order Details</h2>
                <p className="text-[#A30000] mt-1">
                  Order ID: <span className="font-mono text-sm">{order.order_number}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusStyle(order.order_status, "order")}`}>
                {order.order_status}
              </span>
              <button
                onClick={onClose}
                className="rounded-full hover:bg-[#fff6f6] p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Main Content Grid - Side by Side with equal height */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Customer Information */}
              <div className="flex flex-col">
                <div className="bg-white rounded-xl border border-[#A30000]/30 overflow-hidden flex-1 flex flex-col">
                  <div className="bg-[#ffeeee] px-4 py-3 border-b border-[#A30000]/30">
                    <h3 className="text-base font-semibold text-[#A30000] flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#A30000]" />
                      Customer Information
                    </h3>
                  </div>
                  <div className="p-4 flex-1">
                    <div className="!space-y-4">
                      <div className="flex items-center gap-3 py-2 border-b border-[#A30000]/10">
                        <Package className="w-4 h-4 text-[#A30000]" />
                        <div>
                          <div className="text-xs text-[#A30000] uppercase font-medium">Customer Name</div>
                          <div className="text-sm text-gray-800">{order.customer_name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 py-2 border-b border-[#A30000]/10">
                        <Package className="w-4 h-4 text-[#A30000]" />
                        <div>
                          <div className="text-xs text-[#A30000] uppercase font-medium">Email</div>
                          <div className="text-sm text-gray-800">{order.customer_email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 py-2 border-b border-[#A30000]/10">
                        <Package className="w-4 h-4 text-[#A30000]" />
                        <div>
                          <div className="text-xs text-[#A30000] uppercase font-medium">Phone</div>
                          <div className="text-sm text-gray-800">{order.customer_phone}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 py-2">
                        <Calendar className="w-4 h-4 text-[#A30000]" />
                        <div>
                          <div className="text-xs text-[#A30000] uppercase font-medium">Order Date</div>
                          <div className="text-sm text-gray-800">{formatDateShort(order.order_date)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Shipping Address */}
              <div className="flex flex-col">
                <div className="bg-white rounded-xl border border-[#A30000]/30 overflow-hidden flex-1 flex flex-col">
                  <div className="bg-[#ffeeee] px-4 py-3 border-b border-[#A30000]/30">
                    <h3 className="text-base font-semibold text-[#A30000] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#A30000]" />
                      Shipping Address
                    </h3>
                  </div>
                  <div className="p-4 flex-1">
                    <div className="space-y-2">
                      <p className="text-gray-800">{order.shipping_address_line1}</p>
                      {order.shipping_address_line2 && <p className="text-gray-800">{order.shipping_address_line2}</p>}
                      <p className="text-gray-800">{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
                      <p className="text-gray-800">{order.shipping_country}</p>
                    </div>
                    
                    {order.tracking_number && (
                      <div className="mt-4 pt-4 border-t border-[#A30000]/10">
                        <div className="flex items-center gap-3 py-2">
                          <Truck className="w-4 h-4 text-[#A30000]" />
                          <div>
                            <div className="text-xs text-[#A30000] uppercase font-medium">Tracking Number</div>
                            <div className="text-sm text-gray-800 font-mono">{order.tracking_number}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 py-2">
                          <Truck className="w-4 h-4 text-[#A30000]" />
                          <div>
                            <div className="text-xs text-[#A30000] uppercase font-medium">Courier Service</div>
                            <div className="text-sm text-gray-800">{order.courier_service}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl border border-[#A30000]/30 overflow-hidden">
              <div className="bg-[#ffeeee] px-4 py-3 border-b border-[#A30000]/30">
                <h3 className="text-base font-semibold text-[#A30000] flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#A30000]" />
                  Order Items
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#fff6f6]">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[#A30000]">Product</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-[#A30000]">Qty</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-[#A30000]">Price</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-[#A30000]">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#A30000]/10">
                    {order.items.map((item, index) => (
                      <tr key={index} className="hover:bg-[#fff6f6]">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-[#A30000]">{item.product_name}</p>
                            <p className="text-sm text-gray-600">SKU: {item.product_sku}</p>
                            {item.gift_wrap && (
                              <div className="flex items-center space-x-1 mt-1">
                                <Gift className="h-3 w-3 text-pink-500" />
                                <span className="text-xs text-pink-600">Gift Wrapped</span>
                              </div>
                            )}
                            {item.personalized_message && (
                              <p className="text-xs text-gray-600 mt-1">"{item.personalized_message}"</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">{item.product_quantity}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(item.product_price)}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.product_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Full Width Section - Order Summary and Additional Info */}
            <div className="bg-white rounded-xl border border-[#A30000]/30 overflow-hidden">
              <div className="bg-[#ffeeee] px-4 py-3 border-b border-[#A30000]/30">
                <h3 className="text-base font-semibold text-[#A30000] flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#A30000]" />
                  Order Summary
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Order Totals */}
                  <div className="!space-y-3">
                    <div className="flex justify-between py-2 border-b border-[#A30000]/10">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                    </div>
                    {order.discount_amount > 0 && (
                      <div className="flex justify-between py-2 border-b border-[#A30000]/10 text-green-600">
                        <span>Discount ({order.coupon_code}):</span>
                        <span className="font-medium">-{formatCurrency(order.discount_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-[#A30000]/10">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">{formatCurrency(order.tax_amount)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#A30000]/10">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="font-medium">{formatCurrency(order.shipping_fee)}</span>
                    </div>
                    {order.gift_wrap_charges > 0 && (
                      <div className="flex justify-between py-2 border-b border-[#A30000]/10">
                        <span className="text-gray-600">Gift Wrap:</span>
                        <span className="font-medium">{formatCurrency(order.gift_wrap_charges)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-t border-[#A30000]/30 mt-2 pt-2">
                      <span className="font-semibold text-[#A30000]">Total:</span>
                      <span className="font-bold text-[#A30000] text-lg">{formatCurrency(order.grand_total)}</span>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <div className="!space-y-5">
                      <div className="flex items-start gap-3 pt-3 pb-4 border-b border-[#A30000]/10">
                        <CreditCard className="w-4 h-4 text-[#A30000]" />
                        <div>
                          <div className="text-xs text-[#A30000] uppercase font-medium">Payment Status</div>
                          <div className="text-sm text-gray-800 mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusStyle(order.payment_status, "payment")}`}>
                              {order.payment_status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 pt-3 pb-4 border-b border-[#A30000]/10">
                        <CreditCard className="w-4 h-4 text-[#A30000]" />
                        <div>
                          <div className="text-xs text-[#A30000] uppercase font-medium">Payment Method</div>
                          <div className="text-sm text-gray-800 mt-1">Stripe</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 pt-3 pb-2 ">
                        <Truck className="w-4 h-4 text-[#A30000]" />
                        <div>
                          <div className="text-xs text-[#A30000] uppercase font-medium">Shipping Status</div>
                          <div className="text-sm text-gray-800 mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusStyle(order.shipping_status, "order")}`}>
                              {order.shipping_status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional Notes */}
                      {/* {(order.notes || order.gift_message || order.delivery_instructions) && (
                        <div className="pt-4 border-t border-[#A30000]/10">
                          <h4 className="text-sm font-semibold text-[#A30000] mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Additional Information
                          </h4>
                          <div className="space-y-2 text-sm">
                            {order.notes && (
                              <div>
                                <span className="font-medium text-[#A30000]">Notes:</span> {order.notes}
                              </div>
                            )}
                            {order.gift_message && (
                              <div>
                                <span className="font-medium text-[#A30000]">Gift Message:</span> {order.gift_message}
                              </div>
                            )}
                            {order.delivery_instructions && (
                              <div>
                                <span className="font-medium text-[#A30000]">Delivery Instructions:</span> {order.delivery_instructions}
                              </div>
                            )}
                          </div>
                        </div>
                      )} */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-[#ffeeee] border-t border-[#A30000]/30 flex justify-end items-center flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#A30000] hover:bg-[#8F0000] text-white rounded-lg font-medium transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailsModal