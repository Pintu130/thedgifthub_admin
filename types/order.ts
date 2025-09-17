export interface Order {
  // Basic Order Info
  order_id: string;
  order_number: string;
  customer_id: string;
  order_date: string;
  order_status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'unpaid' | 'paid' | 'refunded' | 'partially_paid';
  fulfillment_status: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled';
  order_type: 'normal' | 'gift' | 'bulk';

  // Customer Details
  customer_name: string;
  customer_email: string;
  customer_phone: string;

  // Shipping Details
  shipping_address_line1: string;
  shipping_address_line2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  shipping_postal_code: string;
  shipping_method: string;
  shipping_charges: number;
  shipping_status: 'pending' | 'dispatched' | 'delivered' | 'returned';
  tracking_number?: string;
  courier_service?: string;

  // Billing Details
  billing_address_line1: string;
  billing_address_line2?: string;
  billing_city: string;
  billing_state: string;
  billing_country: string;
  billing_postal_code: string;

  // Payment Details
  payment_method: 'UPI' | 'Card' | 'COD' | 'Wallet' | 'PayPal' | 'Stripe' | 'Razorpay';
  transaction_id?: string;
  payment_date?: string;
  payment_amount: number;
  currency: string;

  // Pricing & Discounts
  subtotal: number;
  discount_amount: number;
  coupon_code?: string;
  coupon_discount: number;
  tax_amount: number;
  shipping_fee: number;
  grand_total: number;

  // Other Info
  notes?: string;
  gift_message?: string;
  is_gift: boolean;
  gift_wrap_charges: number;
  delivery_instructions?: string;
  created_at: string;
  updated_at: string;

  // Order Items (simplified for display)
  items: OrderItem[];
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_sku: string;
  product_quantity: number;
  product_price: number;
  product_total: number;
  product_discount: number;
  gift_wrap: boolean;
  personalized_message?: string;
}

export interface OrderFilters {
  search: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  paymentMethod: string;
  dateFrom: string;
  dateTo: string;
  orderType: string;
}