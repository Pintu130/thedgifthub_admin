"use client"

import React, { useState, useRef } from "react"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import { Eye, Pencil, Trash2 } from "lucide-react"
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
  onEditOrder,
  onDeleteOrder,
}) => {
  const gridRef = useRef<AgGridReact>(null)
  const [paginationPageSize] = useState(4)

  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Format currency function
  const formatCurrency = (amount: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  // Get status badge function
  const getStatusBadge = (status: string, type: "order" | "payment") => {
    if (type === "order") {
      switch (status) {
        case "pending":
          return `<span class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">${status}</span>`
        case "confirmed":
          return `<span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">${status}</span>`
        case "shipped":
          return `<span class="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">${status}</span>`
        case "delivered":
          return `<span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">${status}</span>`
        case "cancelled":
          return `<span class="px-2 py-1 text-xs font-medium rounded-full bg-pink-200 text-pink-800">${status}</span>`
        case "refunded":
          return `<span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">${status}</span>`
        default:
          return `<span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">${status}</span>`
      }
    }

    if (type === "payment") {
      switch (status) {
        case "paid":
          return `<span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">${status}</span>`
        case "unpaid":
          return `<span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">${status}</span>`
        case "refunded":
          return `<span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">${status}</span>`
        case "partially_paid":
          return `<span class="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">${status}</span>`
        default:
          return `<span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">${status}</span>`
      }
    }
  }

  // Custom cell renderer components
  const OrderCellRenderer = (params: any) => {
    return (
      <div className="flex flex-col h-full justify-center items-center">
        <div className="font-medium text-gray-900">{params.data.order_number}</div>
      </div>
    )
  }

  const CustomerCellRenderer = (params: any) => {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="font-medium text-gray-900">{params.data.customer_name}</div>
      </div>
    )
  }

  const EmailCellRenderer = (params: any) => {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-900">{params.data.customer_email}</div>
      </div>
    )
  }

  const StatusCellRenderer = (params: any) => {
    const htmlContent = getStatusBadge(params.value, "order") || "";
    return (
      <div className="flex h-full items-center justify-center" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    )
  }

  const TotalCellRenderer = (params: any) => {
    return (
      <div className="flex flex-row justify-center items-center space-x-2 text-gray-900">
        <div className="font-medium">
          {formatCurrency(params.data.grand_total, params.data.currency || "INR")}
        </div>

        {/* Divider */}
        <span className="text-gray-400">|</span>

        <div className="text-sm text-gray-500">
          {params.data.items.length} item{params.data.items.length > 1 ? "s" : ""}
        </div>
      </div>
    )
  }

  const ActionsCellRenderer = (params: any) => {
    return (
      <div className="flex items-center justify-center h-full gap-2">
        <button 
          className="p-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
          onClick={() => onViewOrder(params.data)}
          title="View Order"
        >
          <Eye className="h-4 w-4" />
        </button>
        {/* <button 
          className="p-1 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 transition"
          onClick={() => onEditOrder(params.data)}
          title="Edit Order"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button 
          className="p-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
          onClick={() => onDeleteOrder(params.data.order_id)}
          title="Delete Order"
        >
          <Trash2 className="h-4 w-4" />
        </button> */}
      </div>
    )
  }

  // Column definitions
  const columnDefs = [
    {
      headerName: "Order",
      field: "order_number",
      minWidth: 150,
      cellRenderer: OrderCellRenderer,
    },
    {
      headerName: "Customer",
      field: "customer_name",
      minWidth: 150,
      cellRenderer: CustomerCellRenderer,
    },
    {
      headerName: "Email",
      field: "customer_email",
      minWidth: 200,
      cellRenderer: EmailCellRenderer,
    },
    {
      headerName: "Mobile",
      field: "customer_phone",
      minWidth: 120,
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
    },
    {
      headerName: "Date",
      field: "order_date",
      minWidth: 150,
      valueFormatter: (params: any) => formatDate(params.value),
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
    },
    {
      headerName: "Status",
      field: "order_status",
      minWidth: 120,
      cellRenderer: StatusCellRenderer,
    },
    {
      headerName: "Total",
      field: "grand_total",
      minWidth: 120,
      cellRenderer: TotalCellRenderer,
      cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
    },
    {
      headerName: "Actions",
      field: "actions",
      minWidth: 150,
      cellRenderer: ActionsCellRenderer,
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-md border border-pink-200 overflow-hidden">
      <div className="ag-theme-alpine w-full">
        <AgGridReact
          ref={gridRef}
          rowData={orders}
          columnDefs={columnDefs}
          defaultColDef={{
            flex: 1,
            resizable: true,
            sortable: true,
            filter: true,
            cellClass: "text-gray-700 bg-white",
            headerClass: "custom-header",
          }}
          pagination={true}
          paginationPageSize={paginationPageSize}
          domLayout="autoHeight"
          suppressCellSelection={true}
          rowHeight={60}
        />
      </div>
    </div>
  )
}

export default OrderTable