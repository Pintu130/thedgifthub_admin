"use client"

import { 
  Circle, 
  CheckCircle, 
  Clock, 
  Truck, 
  Package,
  ChevronDown,
  FileText,
  Check
} from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface OrderTrackingProps {
  orderStatus: string
  orderDate: string
  updatedAt: string
  trackingNumber?: string
  notes?: string
  onStatusChange: (status: string) => void
}

const OrderTracking: React.FC<OrderTrackingProps> = ({
  orderStatus,
  orderDate,
  updatedAt,
  trackingNumber,
  notes,
  onStatusChange
}) => {
  // Get tracking status for order tracking visualization
  const getOrderTrackingStatus = (status: string) => {
    switch (status) {
      case "pending": return { placed: true, confirmed: false, processing: false, shipped: false, delivered: false, completed: false }
      case "confirmed": return { placed: true, confirmed: true, processing: false, shipped: false, delivered: false, completed: false }
      case "processing": return { placed: true, confirmed: true, processing: true, shipped: false, delivered: false, completed: false }
      case "shipped": return { placed: true, confirmed: true, processing: true, shipped: true, delivered: false, completed: false }
      case "delivered": return { placed: true, confirmed: true, processing: true, shipped: true, delivered: true, completed: false }
      case "completed": return { placed: true, confirmed: true, processing: true, shipped: true, delivered: true, completed: true }
      case "cancelled": return { placed: true, confirmed: false, processing: false, shipped: false, delivered: false, completed: false }
      default: return { placed: false, confirmed: false, processing: false, shipped: false, delivered: false, completed: false }
    }
  }

  const trackingStatus = getOrderTrackingStatus(orderStatus)

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Order status options
  const statusOptions = [
    { value: "pending", label: "Order Placed" },
    { value: "confirmed", label: "Order Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "completed", label: "Completed" }
  ]

  return (
    <div className="space-y-6">
      {/* Order Tracking Box */}
      <div className="bg-white rounded-xl border border-[#A30000]/30 overflow-hidden">
        <div className="bg-[#ffeeee] px-4 py-3 border-b border-[#A30000]/30">
          <h3 className="text-base font-semibold text-[#A30000] flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#A30000]" />
            Order Tracking
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between relative">
            {/* Tracking Line - Fixed to properly connect from first step */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0">
              {/* Progress line - changes based on status */}
              <div 
                className="absolute top-0 left-0 h-full bg-[#A30000]" 
                style={{ 
                  width: orderStatus === "pending" ? "10%" : 
                         orderStatus === "confirmed" ? "30%" : 
                         orderStatus === "processing" ? "50%" : 
                         orderStatus === "shipped" ? "70%" : 
                         orderStatus === "delivered" ? "90%" : "100%" 
                }}
              ></div>
            </div>
            
            {/* Tracking Steps with rounded containers on the line */}
            <div className="relative z-10 flex flex-col items-center flex-1">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-[#A30000] flex items-center justify-center mb-2">
                  {trackingStatus.placed ? (
                    <CheckCircle className="w-6 h-6 text-[#A30000]" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className={`text-xs font-medium cursor-pointer ${trackingStatus.placed ? 'text-[#A30000]' : 'text-gray-500'}`}>
                        Order Placed
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="p-2">
                        <p className="font-medium text-[#A30000]">Order Placed</p>
                        <p className="text-xs text-gray-600 mt-1">Date: {formatDate(orderDate)}</p>
                        <p className="text-xs text-gray-600">Status: {trackingStatus.placed ? 'Completed' : 'Pending'}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center flex-1">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-[#A30000] flex items-center justify-center mb-2">
                  {trackingStatus.confirmed ? (
                    <CheckCircle className="w-6 h-6 text-[#A30000]" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className={`text-xs font-medium cursor-pointer ${trackingStatus.confirmed ? 'text-[#A30000]' : 'text-gray-500'}`}>
                        Confirmed
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="p-2">
                        <p className="font-medium text-[#A30000]">Order Confirmed</p>
                        <p className="text-xs text-gray-600 mt-1">Date: {formatDate(orderDate)}</p>
                        <p className="text-xs text-gray-600">Status: {trackingStatus.confirmed ? 'Completed' : 'Pending'}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center flex-1">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-[#A30000] flex items-center justify-center mb-2">
                  {trackingStatus.processing ? (
                    <CheckCircle className="w-6 h-6 text-[#A30000]" />
                  ) : (
                    <Clock className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className={`text-xs font-medium cursor-pointer ${trackingStatus.processing ? 'text-[#A30000]' : 'text-gray-500'}`}>
                        Processing
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="p-2">
                        <p className="font-medium text-[#A30000]">Order Processing</p>
                        <p className="text-xs text-gray-600 mt-1">Date: {formatDate(orderDate)}</p>
                        <p className="text-xs text-gray-600">Status: {trackingStatus.processing ? 'Completed' : 'Pending'}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center flex-1">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-[#A30000] flex items-center justify-center mb-2">
                  {trackingStatus.shipped ? (
                    <CheckCircle className="w-6 h-6 text-[#A30000]" />
                  ) : (
                    <Truck className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className={`text-xs font-medium cursor-pointer ${trackingStatus.shipped ? 'text-[#A30000]' : 'text-gray-500'}`}>
                        Shipped
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="p-2">
                        <p className="font-medium text-[#A30000]">Order Shipped</p>
                        {trackingNumber ? (
                          <>
                            <p className="text-xs text-gray-600 mt-1">Date: {formatDate(updatedAt)}</p>
                            <p className="text-xs text-gray-600">Tracking: {trackingNumber}</p>
                            <p className="text-xs text-gray-600">Status: {trackingStatus.shipped ? 'Completed' : 'Pending'}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs text-gray-600 mt-1">Not yet shipped</p>
                            <p className="text-xs text-gray-600">Status: {trackingStatus.shipped ? 'Completed' : 'Pending'}</p>
                          </>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center flex-1">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-[#A30000] flex items-center justify-center mb-2">
                  {trackingStatus.delivered ? (
                    <CheckCircle className="w-6 h-6 text-[#A30000]" />
                  ) : (
                    <Package className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className={`text-xs font-medium cursor-pointer ${trackingStatus.delivered ? 'text-[#A30000]' : 'text-gray-500'}`}>
                        Delivered
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="p-2">
                        <p className="font-medium text-[#A30000]">Order Delivered</p>
                        <p className="text-xs text-gray-600 mt-1">Date: {formatDate(updatedAt)}</p>
                        <p className="text-xs text-gray-600">Status: {trackingStatus.delivered ? 'Completed' : 'Pending'}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center flex-1">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-[#A30000] flex items-center justify-center mb-2">
                  {trackingStatus.completed ? (
                    <Check className="w-6 h-6 text-[#A30000]" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className={`text-xs font-medium cursor-pointer ${trackingStatus.completed ? 'text-[#A30000]' : 'text-gray-500'}`}>
                        Completed
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="p-2">
                        <p className="font-medium text-[#A30000]">Order Completed</p>
                        <p className="text-xs text-gray-600 mt-1">Date: {formatDate(updatedAt)}</p>
                        <p className="text-xs text-gray-600">Status: {trackingStatus.completed ? 'Completed' : 'Pending'}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notes and Status Update Box - Separate box below tracking */}
      <div className="bg-white rounded-xl border border-[#A30000]/30 overflow-hidden">
        <div className="bg-[#ffeeee] px-4 py-3 border-b border-[#A30000]/30">
          <h3 className="text-base font-semibold text-[#A30000] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#A30000]" />
            Notes & Status Update
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-[#A30000] mb-2">Notes</h4>
              <p className="text-sm text-gray-600">
                {notes || "No notes available for this order."}
              </p>
            </div>
            
            <div className="flex flex-col items-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#A30000] text-white rounded-lg hover:bg-[#8F0000] transition-colors">
                    <span>Update Status</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {statusOptions.map((option) => (
                    <DropdownMenuItem 
                      key={option.value}
                      onClick={() => onStatusChange(option.value)}
                      className={`cursor-pointer ${
                        orderStatus === option.value ? 'bg-[#ffeeee] text-[#A30000] font-medium' : ''
                      }`}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderTracking