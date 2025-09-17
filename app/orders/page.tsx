"use client"

import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import RootLayout from '../RootLayout';
import OrderStats from './orderstats';
import OrderFilters from './orderFilltrers';
import OrderTable from './orderTable';
import OrderDetailsModal from './orderDetailModal';
import { useOrderData } from '@/hooks/userOrderData';
import { Order } from '@/types/order';

const OrderPage: React.FC = () => {
  const {
    orders,
    allOrders,
    filters,
    sortField,
    sortDirection,
    currentPage,
    totalPages,
    totalItems,
    handleSort,
    handleFiltersChange,
    handlePageChange,
    exportOrders
  } = useOrderData();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    console.log('Edit order:', order.order_id);
    // Implement edit functionality
  };

  const handleDeleteOrder = (orderId: string) => {
    console.log('Delete order:', orderId);
    // Implement delete functionality with confirmation
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-lg">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">{((currentPage - 1) * 10) + 1}</span>
              {' '}to{' '}
              <span className="font-medium">
                {Math.min(currentPage * 10, totalItems)}
              </span>
              {' '}of{' '}
              <span className="font-medium">{totalItems}</span>
              {' '}results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === currentPage
                      ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <RootLayout>
      <div className="space-y-6 font-montserrat ">
        {/* Header */}
        <div className="px-2 mb-4">
          <h1 className="text-3xl font-bold tracking-tight text-customButton-text">Orders</h1>
          <p className="text-sm text-[#7A6C53] mt-1">Manage your e-commerce orders</p>
        </div>

        {/* Stats */}
        <OrderStats orders={allOrders} />

        {/* Filters */}
        <OrderFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onExport={exportOrders}
        />

        {/* Orders Table */}
        <div className="space-y-4">
          <OrderTable
            orders={orders}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onViewOrder={handleViewOrder}
            onEditOrder={handleEditOrder}
            onDeleteOrder={handleDeleteOrder}
          />

          <Pagination />
        </div>

        {/* Order Details Modal */}
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </div>
    </RootLayout>
  );
};

export default OrderPage;