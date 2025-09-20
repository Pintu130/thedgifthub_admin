"use client"

import type React from "react"
import { useCallback, useRef, useState, useEffect } from "react"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Loader from "@/components/loading-screen"
import { Eye, Package, Truck, CheckCircle, AlertCircle, Clock } from "lucide-react"
import Modal from "@/components/common/Modal"
import type { ColDef } from "ag-grid-community"
import RootLayout from "../RootLayout"

interface DeliveryData {
    id: string
    orderNumber: string
    customerName: string
    shippingPartner: string
    trackingNumber: string
    origin: string
    destination: string
    orderDate: string
    shippedDate: string
    estimatedDelivery: string
    actualDelivery?: string
    status: 'pending' | 'shipped' | 'in-transit' | 'delivered' | 'delayed' | 'cancelled'
    shippingCost: number
    weight: string
    dimensions: string
    packageType: string
    priority: 'standard' | 'express' | 'overnight'
    notes?: string
}

// Static demo data
const demoDeliveryData: DeliveryData[] = [
    {
        id: "1",
        orderNumber: "ORD-2024-001",
        customerName: "Rajesh Patel",
        shippingPartner: "Blue Dart",
        trackingNumber: "BD123456789",
        origin: "Surat, Gujarat",
        destination: "Mumbai, Maharashtra",
        orderDate: "2024-09-15",
        shippedDate: "2024-09-16",
        estimatedDelivery: "2024-09-18",
        actualDelivery: "2024-09-18",
        status: "delivered",
        shippingCost: 150,
        weight: "2.5 kg",
        dimensions: "30x20x15 cm",
        packageType: "Standard Box",
        priority: "standard",
        notes: "Delivered successfully"
    },
    {
        id: "2",
        orderNumber: "ORD-2024-002",
        customerName: "Priya Shah",
        shippingPartner: "DTDC",
        trackingNumber: "DT987654321",
        origin: "Ahmedabad, Gujarat",
        destination: "Delhi, NCR",
        orderDate: "2024-09-17",
        shippedDate: "2024-09-18",
        estimatedDelivery: "2024-09-21",
        status: "in-transit",
        shippingCost: 200,
        weight: "1.8 kg",
        dimensions: "25x18x10 cm",
        packageType: "Bubble Wrap",
        priority: "express",
        notes: "Express delivery requested"
    },
    {
        id: "3",
        orderNumber: "ORD-2024-003",
        customerName: "Amit Kumar",
        shippingPartner: "Delhivery",
        trackingNumber: "DL456789123",
        origin: "Surat, Gujarat",
        destination: "Bangalore, Karnataka",
        orderDate: "2024-09-19",
        shippedDate: "2024-09-20",
        estimatedDelivery: "2024-09-22",
        status: "shipped",
        shippingCost: 180,
        weight: "3.2 kg",
        dimensions: "35x25x20 cm",
        packageType: "Fragile Box",
        priority: "standard",
        notes: "Handle with care - fragile items"
    },
    {
        id: "4",
        orderNumber: "ORD-2024-004",
        customerName: "Sneha Desai",
        shippingPartner: "Ecom Express",
        trackingNumber: "EE789123456",
        origin: "Rajkot, Gujarat",
        destination: "Chennai, Tamil Nadu",
        orderDate: "2024-09-20",
        shippedDate: "",
        estimatedDelivery: "2024-09-24",
        status: "pending",
        shippingCost: 175,
        weight: "2.1 kg",
        dimensions: "28x22x12 cm",
        packageType: "Standard Box",
        priority: "standard",
        notes: "Awaiting pickup"
    },
    {
        id: "5",
        orderNumber: "ORD-2024-005",
        customerName: "Vikram Singh",
        shippingPartner: "FedEx",
        trackingNumber: "FX321654987",
        origin: "Vadodara, Gujarat",
        destination: "Pune, Maharashtra",
        orderDate: "2024-09-18",
        shippedDate: "2024-09-19",
        estimatedDelivery: "2024-09-20",
        actualDelivery: "2024-09-21",
        status: "delayed",
        shippingCost: 250,
        weight: "4.0 kg",
        dimensions: "40x30x25 cm",
        packageType: "Heavy Duty Box",
        priority: "overnight",
        notes: "Delayed due to weather conditions"
    },
    {
        id: "6",
        orderNumber: "ORD-2024-006",
        customerName: "Kavya Joshi",
        shippingPartner: "Blue Dart",
        trackingNumber: "BD654321789",
        origin: "Surat, Gujarat",
        destination: "Hyderabad, Telangana",
        orderDate: "2024-09-21",
        shippedDate: "2024-09-22",
        estimatedDelivery: "2024-09-24",
        status: "in-transit",
        shippingCost: 190,
        weight: "2.8 kg",
        dimensions: "32x24x18 cm",
        packageType: "Standard Box",
        priority: "express",
        notes: "Express delivery in progress"
    },
    {
        id: "7",
        orderNumber: "ORD-2024-007",
        customerName: "Rahul Mehta",
        shippingPartner: "India Post",
        trackingNumber: "IP147258369",
        origin: "Bharuch, Gujarat",
        destination: "Kolkata, West Bengal",
        orderDate: "2024-09-16",
        shippedDate: "2024-09-17",
        estimatedDelivery: "2024-09-22",
        actualDelivery: "2024-09-22",
        status: "delivered",
        shippingCost: 120,
        weight: "1.5 kg",
        dimensions: "20x15x8 cm",
        packageType: "Envelope",
        priority: "standard",
        notes: "Documents delivered"
    },
    {
        id: "8",
        orderNumber: "ORD-2024-008",
        customerName: "Neha Agarwal",
        shippingPartner: "Xpressbees",
        trackingNumber: "XB963852741",
        origin: "Anand, Gujarat",
        destination: "Jaipur, Rajasthan",
        orderDate: "2024-09-23",
        shippedDate: "",
        estimatedDelivery: "2024-09-26",
        status: "pending",
        shippingCost: 165,
        weight: "2.3 kg",
        dimensions: "26x20x14 cm",
        packageType: "Standard Box",
        priority: "standard",
        notes: "Processing order"
    },
    {
        id: "9",
        orderNumber: "ORD-2024-009",
        customerName: "Arjun Pandya",
        shippingPartner: "DTDC",
        trackingNumber: "DT852741963",
        origin: "Gandhinagar, Gujarat",
        destination: "Lucknow, Uttar Pradesh",
        orderDate: "2024-09-19",
        shippedDate: "2024-09-20",
        estimatedDelivery: "2024-09-23",
        status: "in-transit",
        shippingCost: 210,
        weight: "3.5 kg",
        dimensions: "38x28x22 cm",
        packageType: "Fragile Box",
        priority: "express",
        notes: "Fragile electronics inside"
    },
    {
        id: "10",
        orderNumber: "ORD-2024-010",
        customerName: "Pooja Trivedi",
        shippingPartner: "Delhivery",
        trackingNumber: "DL741852963",
        origin: "Navsari, Gujarat",
        destination: "Goa, India",
        orderDate: "2024-09-22",
        shippedDate: "2024-09-23",
        estimatedDelivery: "2024-09-25",
        actualDelivery: "2024-09-25",
        status: "delivered",
        shippingCost: 195,
        weight: "2.7 kg",
        dimensions: "30x22x16 cm",
        packageType: "Standard Box",
        priority: "standard",
        notes: "Successfully delivered to customer"
    }
]

const DeliveryShippingTable = () => {
    const [deliveryData, setDeliveryData] = useState<DeliveryData[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedDelivery, setSelectedDelivery] = useState<DeliveryData | null>(null)

    // Grid
    const gridRef = useRef<AgGridReact | null>(null)
    const [paginationPageSize] = useState(5)
    const [gridApi, setGridApi] = useState<any>(null)

    // Load demo data
    useEffect(() => {
        setIsLoading(true)
        // Simulate API call
        setTimeout(() => {
            setDeliveryData(demoDeliveryData)
            setIsLoading(false)
        }, 1000)
    }, [])

    const onGridReady = (params: any) => {
        setGridApi(params.api)
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered':
                return <CheckCircle size={16} className="text-green-600" />
            case 'in-transit':
                return <Truck size={16} className="text-blue-600" />
            case 'shipped':
                return <Package size={16} className="text-purple-600" />
            case 'delayed':
                return <AlertCircle size={16} className="text-orange-600" />
            case 'cancelled':
                return <AlertCircle size={16} className="text-red-600" />
            default:
                return <Clock size={16} className="text-gray-600" />
        }
    }

    const getStatusBadge = (status: string) => {
        const baseClasses = "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
        const statusClasses = {
            'delivered': 'bg-green-100 text-green-800',
            'in-transit': 'bg-blue-100 text-blue-800',
            'shipped': 'bg-purple-100 text-purple-800',
            'delayed': 'bg-orange-100 text-orange-800',
            'cancelled': 'bg-red-100 text-red-800',
            'pending': 'bg-gray-100 text-gray-800'
        }

        return (
            <span className={`${baseClasses} ${statusClasses[status as keyof typeof statusClasses]}`}>
                {getStatusIcon(status)}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        )
    }

    const getPriorityBadge = (priority: string) => {
        const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
        const priorityClasses = {
            'overnight': 'bg-red-100 text-red-800',
            'express': 'bg-yellow-100 text-yellow-800',
            'standard': 'bg-blue-100 text-blue-800'
        }

        return (
            <span className={`${baseClasses} ${priorityClasses[priority as keyof typeof priorityClasses]}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
        )
    }

    const columnDefs: ColDef[] = [
        {
            headerName: "Order #",
            field: "orderNumber",
            flex: 1.2,
            minWidth: 140,
            cellRenderer: (params: any) => (
                <span className="font-medium text-blue-600">{params.value}</span>
            )
        },
        { headerName: "Customer", field: "customerName", flex: 1.3, minWidth: 150 },
        {
            headerName: "Shipping Partner",
            field: "shippingPartner",
            flex: 1.2,
            minWidth: 140,
            cellRenderer: (params: any) => (
                <span className="font-medium">{params.value}</span>
            )
        },
       
        {
            headerName: "Status",
            field: "status",
            flex: 1.2,
            minWidth: 130,
            cellRenderer: (params: any) => getStatusBadge(params.value),
            cellStyle: {
                display: "flex",
                justifyContent: "center", // horizontal center
                alignItems: "center",     // vertical center
                height: "100%",           // make sure it fills the row
            },
        },
        
        {
            headerName: "Cost",
            field: "shippingCost",
            flex: 0.8,
            minWidth: 100,
            cellRenderer: (params: any) => (
                <span className="font-medium">₹{params.value}</span>
            )
        },
        { headerName: "Weight", field: "weight", flex: 0.8, minWidth: 100 },
        {
            headerName: "Est. Delivery",
            field: "estimatedDelivery",
            flex: 1.2,
            minWidth: 130,
            cellRenderer: (params: any) => {
                const date = new Date(params.value)
                return date.toLocaleDateString('en-IN')
            }
        },
        {
            headerName: "Actions",
            field: "action",
            flex: 1,
            minWidth: 100,
            cellRenderer: (params: any) => (
                <div className="h-full flex items-center justify-center gap-2">
                    <button
                        onClick={() => setSelectedDelivery(params.data)}
                        className="p-1 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition"
                        title="View Details"
                    >
                        <Eye size={16} />
                    </button>
                </div>
            ),
        }
    ]

    return (
        <RootLayout>
            <div className="space-y-4 text-[#333]">
                <div className="px-2 mb-4">
                    <h1 className="text-3xl font-bold tracking-tight text-customButton-text">Delivery & Shipping</h1>
                    <p className="text-sm text-[#7A6C53] mt-1">Track and manage all shipping partners and delivery status</p>
                </div>

                <Card className="shadow-md border border-gray-200">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center px-6 pt-4 gap-4">
                        <CardHeader className="p-0">
                            <CardTitle className="text-lg text-gray-800">Shipping Partners Integration & Order Tracking</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">{deliveryData.length} total shipments</p>
                        </CardHeader>

                        <div className="flex gap-2 items-center">
                            <input
                                type="text"
                                placeholder="Search orders, tracking numbers..."
                                className="border outline-none p-2 rounded-md shadow-sm w-64 lg:w-80"
                                onChange={(e) => gridApi?.setQuickFilter(e.target.value)}
                            />
                        </div>
                    </div>

                    <CardContent className="pt-4">
                        {isLoading && <Loader />}
                        {!isLoading && (
                            <div className="ag-theme-alpine w-full">
                                <AgGridReact
                                    ref={gridRef}
                                    rowData={deliveryData}
                                    columnDefs={columnDefs}
                                    defaultColDef={{
                                        resizable: true,
                                        sortable: true,
                                        filter: true,
                                        cellClass: "text-center text-[#2D3748] bg-white",
                                    }}
                                    pagination={true}
                                    paginationPageSize={paginationPageSize}
                                    domLayout="autoHeight"
                                    suppressCellSelection={true}
                                    onGridReady={onGridReady}
                                    rowHeight={50}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* View Details Modal */}
                <Modal
                    isOpen={!!selectedDelivery}
                    onClose={() => setSelectedDelivery(null)}
                    title="Shipment Details"
                    message=""
                    closeLabel="Close"
                    confirmLabel=""
                    width="60rem"
                >
                    {selectedDelivery && (
                        <div className="p-2">
                            {/* Header Section with Order Info */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6 border border-blue-100">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-blue-900">{selectedDelivery.orderNumber}</h3>
                                        <p className="text-blue-700">{selectedDelivery.customerName}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {getStatusBadge(selectedDelivery.status)}
                                        {getPriorityBadge(selectedDelivery.priority)}
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 !gap-6">
                                {/* Left Column - Shipping Details */}
                                <div className="!space-y-6">
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Package size={18} className="text-blue-600" />
                                            Shipping Information
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-600">Shipping Partner:</span>
                                                <span className="text-sm text-gray-900 font-semibold">{selectedDelivery.shippingPartner}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-600">Tracking Number:</span>
                                                <span className="text-sm text-blue-600 font-mono font-semibold">{selectedDelivery.trackingNumber}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-600">Shipping Cost:</span>
                                                <span className="text-sm text-green-600 font-bold">₹{selectedDelivery.shippingCost}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-600">Package Type:</span>
                                                <span className="text-sm text-gray-900">{selectedDelivery.packageType}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Truck size={18} className="text-green-600" />
                                            Route Information
                                        </h4>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-sm font-medium text-gray-600">From:</span>
                                                <p className="text-sm text-gray-900 font-medium">{selectedDelivery.origin}</p>
                                            </div>
                                            <div className="border-l-2 border-dashed border-gray-300 ml-2 pl-4 py-2">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                    <span className="text-xs">In Transit</span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-600">To:</span>
                                                <p className="text-sm text-gray-900 font-medium">{selectedDelivery.destination}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Dates & Package Details */}
                                <div className="!space-y-6">
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Clock size={18} className="text-purple-600" />
                                            Timeline
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-600">Order Date:</span>
                                                <span className="text-sm text-gray-900">{new Date(selectedDelivery.orderDate).toLocaleDateString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-600">Shipped Date:</span>
                                                <span className="text-sm text-gray-900">
                                                    {selectedDelivery.shippedDate ? new Date(selectedDelivery.shippedDate).toLocaleDateString('en-IN') :
                                                        <span className="text-orange-600 font-medium">Pending</span>}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium text-gray-600">Est. Delivery:</span>
                                                <span className="text-sm text-blue-600 font-medium">{new Date(selectedDelivery.estimatedDelivery).toLocaleDateString('en-IN')}</span>
                                            </div>
                                            {selectedDelivery.actualDelivery && (
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium text-gray-600">Delivered:</span>
                                                    <span className="text-sm text-green-600 font-bold">{new Date(selectedDelivery.actualDelivery).toLocaleDateString('en-IN')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Package Specifications</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center p-3 bg-gray-50 rounded">
                                                <p className="text-xs text-gray-600">Weight</p>
                                                <p className="text-lg font-bold text-gray-900">{selectedDelivery.weight}</p>
                                            </div>
                                            <div className="text-center p-3 bg-gray-50 rounded">
                                                <p className="text-xs text-gray-600">Dimensions</p>
                                                <p className="text-sm font-semibold text-gray-900">{selectedDelivery.dimensions}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes Section */}
                            {selectedDelivery.notes && (
                                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        Additional Notes
                                    </h4>
                                    <p className="text-sm text-yellow-700">{selectedDelivery.notes}</p>
                                </div>
                            )}

                            {/* Track Package Button */}
                            <div className="mt-6 flex justify-center">
                                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg">
                                    <Package size={18} />
                                    Track Package: {selectedDelivery.trackingNumber}
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </RootLayout>
    )
}

export default DeliveryShippingTable