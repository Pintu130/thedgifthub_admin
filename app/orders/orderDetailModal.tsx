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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{order.order_number}</h2>
            <p className="text-sm text-gray-500">Order placed on {formatDate(order.order_date)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Order Status</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600 capitalize">{order.order_status}</p>
              <p className="text-sm text-gray-600 mt-1">Fulfillment: {order.fulfillment_status.replace('_', ' ')}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Payment</h3>
              </div>
              <p className="text-2xl font-bold text-green-600 capitalize">{order.payment_status}</p>
              <p className="text-sm text-gray-600 mt-1">{order.payment_method}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Truck className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Shipping</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600 capitalize">{order.shipping_status}</p>
              <p className="text-sm text-gray-600 mt-1">{order.shipping_method}</p>
            </div>
          </div>

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