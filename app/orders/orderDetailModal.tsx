import React from 'react';
import { X, Package, CreditCard, Truck, MapPin, Gift, FileText } from 'lucide-react';
import { Order } from '@/types/order';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      {/* Modal Container */}
      <div
        className="relative bg-white rounded-2xl shadow-xl mx-4 max-h-[80vh] flex flex-col overflow-hidden z-10"
        style={{ width: '60rem' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#EADFC8]">
          <div>
            <h3 className="text-lg font-semibold text-[#4B3F2F]">{order.order_number}</h3>
            <p className="text-sm text-gray-500">Order placed on {formatDate(order.order_date)}</p>
          </div>
          <div className="flex space-x-2 items-center">
            {/* Order Status Badge */}
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
              {order.order_status}
            </span>
            
            {/* Payment Badge */}
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 capitalize">
              {order.payment_status}
            </span>
            
            {/* Shipping Badge */}
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 capitalize">
              {order.shipping_status}
            </span>
            
            <button
              onClick={onClose}
              className="transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto scrollbar-custom flex-1 space-y-8">

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {order.customer_name}</p>
                <p><span className="font-medium">Email:</span> {order.customer_email}</p>
                <p><span className="font-medium">Phone:</span> {order.customer_phone}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <MapPin className="h-4 w-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Shipping Address</h3>
              </div>
              <div className="text-sm text-gray-700">
                <p>{order.shipping_address_line1}</p>
                {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
                <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
                <p>{order.shipping_country}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Product</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Qty</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Price</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{item.product_name}</p>
                          <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>
                          {item.gift_wrap && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Gift className="h-3 w-3 text-pink-500" />
                              <span className="text-xs text-pink-600">Gift Wrapped</span>
                            </div>
                          )}
                          {item.personalized_message && (
                            <p className="text-xs text-gray-500 mt-1">"{item.personalized_message}"</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">{item.product_quantity}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(item.product_price)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.product_total)}</td>
                    </tr>
                  ))}
                  {/* Sample data rows */}
                  <tr>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">Sample Product 1</p>
                        <p className="text-sm text-gray-500">SKU: SP-001</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">2</td>
                    <td className="px-4 py-3 text-right">$29.99</td>
                    <td className="px-4 py-3 text-right font-medium">$59.98</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">Sample Product 2</p>
                        <p className="text-sm text-gray-500">SKU: SP-002</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <Gift className="h-3 w-3 text-pink-500" />
                          <span className="text-xs text-pink-600">Gift Wrapped</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">"Happy Birthday!"</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">1</td>
                    <td className="px-4 py-3 text-right">$49.99</td>
                    <td className="px-4 py-3 text-right font-medium">$49.99</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">Sample Product 3</p>
                        <p className="text-sm text-gray-500">SKU: SP-003</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">3</td>
                    <td className="px-4 py-3 text-right">$19.99</td>
                    <td className="px-4 py-3 text-right font-medium">$59.97</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {order.tracking_number && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Tracking Information</h3>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Tracking Number:</span> {order.tracking_number}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Courier:</span> {order.courier_service}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({order.coupon_code}):</span>
                    <span>-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(order.tax_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{formatCurrency(order.shipping_fee)}</span>
                </div>
                {order.gift_wrap_charges > 0 && (
                  <div className="flex justify-between">
                    <span>Gift Wrap:</span>
                    <span>{formatCurrency(order.gift_wrap_charges)}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(order.grand_total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(order.notes || order.gift_message || order.delivery_instructions) && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <FileText className="h-4 w-4 text-yellow-600" />
                <h3 className="font-semibold text-gray-900">Additional Information</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                {order.notes && (
                  <div>
                    <span className="font-medium">Notes:</span> {order.notes}
                  </div>
                )}
                {order.gift_message && (
                  <div>
                    <span className="font-medium">Gift Message:</span> {order.gift_message}
                  </div>
                )}
                {order.delivery_instructions && (
                  <div>
                    <span className="font-medium">Delivery Instructions:</span> {order.delivery_instructions}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;