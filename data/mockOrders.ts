
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

export const mockOrders: Order[] = [
  {
    order_id: '1',
    order_number: 'TG-2025-000123',
    customer_id: 'cust_001',
    order_date: '2025-01-15T10:30:00Z',
    order_status: 'delivered',
    payment_status: 'paid',
    fulfillment_status: 'fulfilled',
    order_type: 'normal',
    customer_name: 'John Smith',
    customer_email: 'john.smith@email.com',
    customer_phone: '+1-555-0123',
    shipping_address_line1: '123 Main St',
    shipping_address_line2: 'Apt 4B',
    shipping_city: 'New York',
    shipping_state: 'NY',
    shipping_country: 'USA',
    shipping_postal_code: '10001',
    shipping_method: 'Express',
    shipping_charges: 15.99,
    shipping_status: 'delivered',
    tracking_number: 'TRK123456789',
    courier_service: 'FedEx',
    billing_address_line1: '123 Main St',
    billing_city: 'New York',
    billing_state: 'NY',
    billing_country: 'USA',
    billing_postal_code: '10001',
    payment_method: 'Card',
    transaction_id: 'txn_abc123',
    payment_date: '2025-01-15T10:32:00Z',
    payment_amount: 159.97,
    currency: 'USD',
    subtotal: 143.98,
    discount_amount: 14.40,
    coupon_code: 'SAVE10',
    coupon_discount: 14.40,
    tax_amount: 14.40,
    shipping_fee: 15.99,
    grand_total: 159.97,
    is_gift: false,
    gift_wrap_charges: 0,
    delivery_instructions: 'Leave at door',
    created_at: '2025-01-15T10:30:00Z',
    updated_at: '2025-01-18T14:20:00Z',
    items: [
      {
        product_id: 'prod_001',
        product_name: 'Wireless Bluetooth Headphones',
        product_sku: 'WBH-001',
        product_quantity: 2,
        product_price: 79.99,
        product_total: 159.98,
        product_discount: 16.00,
        gift_wrap: false
      }
    ]
  },
  {
    order_id: '2',
    order_number: 'TG-2025-000124',
    customer_id: 'cust_002',
    order_date: '2025-01-16T14:15:00Z',
    order_status: 'shipped',
    payment_status: 'paid',
    fulfillment_status: 'fulfilled',
    order_type: 'gift',
    customer_name: 'Sarah Johnson',
    customer_email: 'sarah.johnson@email.com',
    customer_phone: '+1-555-0124',
    shipping_address_line1: '456 Oak Avenue',
    shipping_city: 'Los Angeles',
    shipping_state: 'CA',
    shipping_country: 'USA',
    shipping_postal_code: '90210',
    shipping_method: 'Standard',
    shipping_charges: 9.99,
    shipping_status: 'dispatched',
    tracking_number: 'TRK987654321',
    courier_service: 'UPS',
    billing_address_line1: '789 Pine Street',
    billing_city: 'Los Angeles',
    billing_state: 'CA',
    billing_country: 'USA',
    billing_postal_code: '90211',
    payment_method: 'PayPal',
    transaction_id: 'txn_def456',
    payment_date: '2025-01-16T14:17:00Z',
    payment_amount: 89.98,
    currency: 'USD',
    subtotal: 74.99,
    discount_amount: 0,
    coupon_discount: 0,
    tax_amount: 5.00,
    shipping_fee: 9.99,
    grand_total: 89.98,
    is_gift: true,
    gift_wrap_charges: 4.99,
    gift_message: 'Happy Birthday! Hope you love this!',
    delivery_instructions: 'Ring doorbell twice',
    created_at: '2025-01-16T14:15:00Z',
    updated_at: '2025-01-17T09:30:00Z',
    items: [
      {
        product_id: 'prod_002',
        product_name: 'Premium Coffee Mug Set',
        product_sku: 'PCM-002',
        product_quantity: 1,
        product_price: 74.99,
        product_total: 74.99,
        product_discount: 0,
        gift_wrap: true,
        personalized_message: 'Best Mom Ever!'
      }
    ]
  },
  {
    order_id: '3',
    order_number: 'TG-2025-000125',
    customer_id: 'cust_003',
    order_date: '2025-01-17T09:45:00Z',
    order_status: 'pending',
    payment_status: 'unpaid',
    fulfillment_status: 'unfulfilled',
    order_type: 'normal',
    customer_name: 'Mike Davis',
    customer_email: 'mike.davis@email.com',
    customer_phone: '+1-555-0125',
    shipping_address_line1: '321 Elm Street',
    shipping_city: 'Chicago',
    shipping_state: 'IL',
    shipping_country: 'USA',
    shipping_postal_code: '60601',
    shipping_method: 'Standard',
    shipping_charges: 7.99,
    shipping_status: 'pending',
    billing_address_line1: '321 Elm Street',
    billing_city: 'Chicago',
    billing_state: 'IL',
    billing_country: 'USA',
    billing_postal_code: '60601',
    payment_method: 'COD',
    payment_amount: 127.98,
    currency: 'USD',
    subtotal: 119.99,
    discount_amount: 12.00,
    coupon_code: 'FIRST10',
    coupon_discount: 12.00,
    tax_amount: 12.00,
    shipping_fee: 7.99,
    grand_total: 127.98,
    is_gift: false,
    gift_wrap_charges: 0,
    created_at: '2025-01-17T09:45:00Z',
    updated_at: '2025-01-17T09:45:00Z',
    items: [
      {
        product_id: 'prod_003',
        product_name: 'Smart Watch Series 5',
        product_sku: 'SW-005',
        product_quantity: 1,
        product_price: 119.99,
        product_total: 119.99,
        product_discount: 12.00,
        gift_wrap: false
      }
    ]
  },
  {
    order_id: '4',
    order_number: 'TG-2025-000126',
    customer_id: 'cust_004',
    order_date: '2025-01-18T16:20:00Z',
    order_status: 'confirmed',
    payment_status: 'paid',
    fulfillment_status: 'partially_fulfilled',
    order_type: 'bulk',
    customer_name: 'Lisa Chen',
    customer_email: 'lisa.chen@email.com',
    customer_phone: '+1-555-0126',
    shipping_address_line1: '654 Maple Drive',
    shipping_city: 'Seattle',
    shipping_state: 'WA',
    shipping_country: 'USA',
    shipping_postal_code: '98101',
    shipping_method: 'Express',
    shipping_charges: 19.99,
    shipping_status: 'pending',
    billing_address_line1: '654 Maple Drive',
    billing_city: 'Seattle',
    billing_state: 'WA',
    billing_country: 'USA',
    billing_postal_code: '98101',
    payment_method: 'Stripe',
    transaction_id: 'txn_ghi789',
    payment_date: '2025-01-18T16:22:00Z',
    payment_amount: 289.95,
    currency: 'USD',
    subtotal: 249.97,
    discount_amount: 25.00,
    coupon_code: 'BULK10',
    coupon_discount: 25.00,
    tax_amount: 39.99,
    shipping_fee: 19.99,
    grand_total: 289.95,
    is_gift: false,
    gift_wrap_charges: 0,
    delivery_instructions: 'Business hours delivery only',
    created_at: '2025-01-18T16:20:00Z',
    updated_at: '2025-01-18T16:22:00Z',
    items: [
      {
        product_id: 'prod_004',
        product_name: 'Office Chair Pro',
        product_sku: 'OCP-001',
        product_quantity: 3,
        product_price: 83.32,
        product_total: 249.97,
        product_discount: 25.00,
        gift_wrap: false
      }
    ]
  }
];