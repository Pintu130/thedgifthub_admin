import { useState, useMemo } from 'react';
import { Order, OrderFilters } from '../types/order';
import { mockOrders } from '../data/mockOrders';

export const useOrderData = () => {
  const [orders] = useState<Order[]>(mockOrders);
  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    status: '',
    paymentStatus: '',
    fulfillmentStatus: '',
    paymentMethod: '',
    dateFrom: '',
    dateTo: '',
    orderType: ''
  });
  const [sortField, setSortField] = useState<keyof Order>('order_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          order.order_number.toLowerCase().includes(searchTerm) ||
          order.customer_name.toLowerCase().includes(searchTerm) ||
          order.customer_email.toLowerCase().includes(searchTerm) ||
          order.customer_phone.includes(searchTerm)
        );
      }
      return true;
    }).filter(order => {
      // Status filters
      if (filters.status && order.order_status !== filters.status) return false;
      if (filters.paymentStatus && order.payment_status !== filters.paymentStatus) return false;
      if (filters.fulfillmentStatus && order.fulfillment_status !== filters.fulfillmentStatus) return false;
      if (filters.paymentMethod && order.payment_method !== filters.paymentMethod) return false;
      if (filters.orderType && order.order_type !== filters.orderType) return false;

      // Date filters
      if (filters.dateFrom) {
        const orderDate = new Date(order.order_date);
        const fromDate = new Date(filters.dateFrom);
        if (orderDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const orderDate = new Date(order.order_date);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (orderDate > toDate) return false;
      }

      return true;
    });

    // Sort orders
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle date sorting
      if (sortField === 'order_date' || sortField === 'payment_date' || sortField === 'created_at' || sortField === 'updated_at') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      // Handle numeric sorting
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle string sorting
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });

    return filtered;
  }, [orders, filters, sortField, sortDirection]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleFiltersChange = (newFilters: OrderFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const exportOrders = () => {
    // Create CSV content
    const csvHeaders = [
      'Order Number', 'Customer Name', 'Customer Email', 'Order Date', 
      'Status', 'Payment Status', 'Total', 'Payment Method'
    ];
    
    const csvData = filteredOrders.map(order => [
      order.order_number,
      order.customer_name,
      order.customer_email,
      new Date(order.order_date).toLocaleDateString(),
      order.order_status,
      order.payment_status,
      order.grand_total,
      order.payment_method
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return {
    orders: paginatedOrders,
    allOrders: orders,
    filteredOrders,
    filters,
    sortField,
    sortDirection,
    currentPage,
    totalPages,
    totalItems: filteredOrders.length,
    handleSort,
    handleFiltersChange,
    handlePageChange,
    exportOrders
  };
};