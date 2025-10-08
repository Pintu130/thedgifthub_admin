"use client"

import type React from "react"
import { useCallback, useRef, useState, useEffect } from "react"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Pencil, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Modal from "@/components/common/Modal"
import TableModalProperData from "../../app/product-print/TableModalProductPrint"
import type { ColDef } from "ag-grid-community"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define the Proper data type
export interface Proper {
  id: string
  title: string
  image: string
  status: "active" | "inactive"
  notes: string
}

// Define form data type
export interface ProperFormData {
  id?: string
  title: string
  image: string
  status: "active" | "inactive"
  notes: string
}

const ProductPrint = () => {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [formData, setFormData] = useState<ProperFormData>({
    id: "",
    title: "",
    image: "",
    status: "inactive",
    notes: "",
  })
  const [selectedStatus, setSelectedStatus] = useState<string>("") // New state for status filter

  // Static data for the table
  const [properData, setProperData] = useState<Proper[]>([])

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [properToDelete, setProperToDelete] = useState<Proper | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const gridRef = useRef<AgGridReact | null>(null)
  const [paginationPageSize] = useState(4)
  const [gridApi, setGridApi] = useState<any>(null)

  // ✅ Search
  const onSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
    if (gridApi) gridApi.setQuickFilter(event.target.value)
  }

  const onGridReady = (params: any) => {
    setGridApi(params.api)
  }

  // ✅ Modal toggle
  const toggleModal = useCallback(() => {
    setFormData({
      title: "",
      image: "",
      status: "inactive",
      notes: "",
    })
    setIsModalVisible(!isModalVisible)
  }, [isModalVisible])

  // ✅ Edit
  const handleEdit = useCallback((proper: Proper) => {
    setFormData({
      id: proper.id,
      title: proper.title,
      image: proper.image,
      status: proper.status,
      notes: proper.notes,
    })
    setIsModalVisible(true)
  }, [])

  const handleDelete = useCallback((proper: Proper) => {
    setProperToDelete(proper)
    setIsDeleteModalOpen(true)
  }, [])

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false)
    setProperToDelete(null)
  }, [])

  const confirmDelete = async () => {
    if (!properToDelete?.id) return
    setIsDeleting(true)
    try {
      // Remove the proper from the state
      setProperData(prevData => prevData.filter(item => item.id !== properToDelete.id))
      
      toast({
        title: "Success",
        description: "Product print item deleted successfully",
      })
      closeDeleteModal()
    } catch (error) {
      console.error("Error deleting product print:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product print item. Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const refreshGridData = useCallback(() => {
    // In a real app, this would fetch new data
    // For now, we just reset the state to trigger a re-render
    setProperData([...properData])
  }, [properData])

  // ✅ Fetch proper items with status filter
  const fetchProperItems = useCallback(() => {
    // In a real app, this would fetch data with filters
    // For now, we'll filter the static data based on the selected status
    let filteredData: Proper[] = [
      {
        id: "1",
        title: "Sample Product Print 1",
        image: "/placeholder.svg?height=40&width=40",
        status: "active" as "active" | "inactive",
        notes: "This is a sample note for product print 1"
      },
      {
        id: "2",
        title: "Sample Product Print 2",
        image: "/placeholder.svg?height=40&width=40",
        status: "inactive" as "active" | "inactive",
        notes: "This is a sample note for product print 2"
      },
      {
        id: "3",
        title: "Sample Product Print 3",
        image: "/placeholder.svg?height=40&width=40",
        status: "active" as "active" | "inactive",
        notes: "This is a sample note for product print 3"
      },
      {
        id: "4",
        title: "Sample Product Print 4",
        image: "/placeholder.svg?height=40&width=40",
        status: "inactive" as "active" | "inactive",
        notes: "This is a sample note for product print 4"
      },
      {
        id: "5",
        title: "Sample Product Print 5",
        image: "/placeholder.svg?height=40&width=40",
        status: "active" as "active" | "inactive",
        notes: "This is a sample note for product print 5"
      },
      {
        id: "6",
        title: "Sample Product Print 6",
        image: "/placeholder.svg?height=40&width=40",
        status: "inactive" as "active" | "inactive",
        notes: "This is a sample note for product print 6"
      },
      {
        id: "7",
        title: "Sample Product Print 7",
        image: "/placeholder.svg?height=40&width=40",
        status: "active" as "active" | "inactive",
        notes: "This is a sample note for product print 7"
      },
      {
        id: "8",
        title: "Sample Product Print 8",
        image: "/placeholder.svg?height=40&width=40",
        status: "inactive" as "active" | "inactive",
        notes: "This is a sample note for product print 8"
      }
    ];

    // Apply status filter
    if (selectedStatus) {
      filteredData = filteredData.filter(item => item.status === selectedStatus);
    }

    setProperData(filteredData);
  }, [selectedStatus]);

  useEffect(() => {
    fetchProperItems();
  }, [fetchProperItems]);

  // ✅ Column Definitions
  const columnDefs: ColDef[] = [
    {
      headerName: "Image",
      field: "image",
      minWidth: 120,
      maxWidth: 150,
      cellRenderer: (params: any) => {
        const imageSrc = params.value || "/placeholder.svg?height=40&width=40"

        return (
          <div className="flex items-center justify-center h-full w-full">
            <img
              src={imageSrc}
              alt="Product Print"
              className="w-10 h-10 rounded-sm border object-cover"
              onError={(e: any) =>
                (e.currentTarget.src = "/placeholder.svg?height=40&width=40")
              }
            />
          </div>
        )
      },
    },
    {
      headerName: "Title",
      field: "title",
      flex: 1.5,
      sortable: true,
      minWidth: 200,
      maxWidth: 300,
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center h-full w-full">
          <span className="text-sm font-medium text-gray-900">
            {params.value || "No Title"}
          </span>
        </div>
      ),
    },
    {
      headerName: "Status",
      field: "status",
      flex: 1,
      sortable: true,
      minWidth: 140,
      maxWidth: 180,
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center h-full w-full">
          <span
            className={`px-2 py-1 text-xs rounded-full ${params.value === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
              }`}
          >
            {params.value === "active" ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
    {
      headerName: "Notes",
      field: "notes",
      flex: 2,
      sortable: true,
      minWidth: 200,
      cellRenderer: (params: any) => (
        <div className="flex items-center h-full w-full px-2">
          <div className="text-sm text-gray-900 line-clamp-2">
            {params.value || "No notes"}
          </div>
        </div>
      ),
    },
    {
      headerName: "Actions",
      field: "action",
      flex: 1,
      minWidth: 160,
      maxWidth: 200,
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center gap-2 h-full w-full">
          {/* Edit button */}
          <button
            onClick={() => handleEdit(params.data)}
            className="p-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
          >
            <Pencil size={16} />
          </button>

          {/* Delete button */}
          <button
            onClick={() => handleDelete(params.data)}
            className="p-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4 text-[#333]">
      <div className="px-2 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-customButton-text">Product Print</h1>
        <p className="text-sm text-[#7A6C53] mt-1">Manage product print items</p>
      </div>

      <Card className="shadow-md border border-gray-200">
        <div className="flex flex-wrap flex-col md:flex-row md:justify-between md:items-center px-6 pt-4 gap-4">
          <CardHeader className="p-0">
            <CardTitle className="text-lg text-gray-800">Product Print Items</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {properData.length} items
              {selectedStatus && " (filtered)"}
            </p>
          </CardHeader>

          {/* Search + Status Filter + Add Product Print */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Status Filter */}
            <Select
              value={selectedStatus || "all"}
              onValueChange={(value) => setSelectedStatus(value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <input
              type="text"
              placeholder="Search product print items..."
              className="border outline-none p-2 rounded-md shadow-sm w-52 lg:w-64"
              value={searchText}
              onChange={onSearchTextChange}
              disabled={isLoading}
            />
            <button
              onClick={toggleModal}
              className="px-4 py-2 rounded-md bg-gradient-to-r 
                                       from-customButton-gradientFrom
                                       to-customButton-gradientTo
                                       text-customButton-text
                                       hover:bg-customButton-hoverBg
                                       hover:text-customButton-hoverText font-semibold transition flex items-center gap-2"
              aria-label="Add new product print"
              disabled={isLoading}
            >
              <Plus size={16} />
              <span>Add Product Print</span>
            </button>
          </div>
        </div>

        <CardContent className="pt-4">
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="loader-overlay">
                <div className="loader-spinner"></div>
              </div>
            </div>
          )}
          {isError && <p className="p-4 bg-red-50 text-red-700 rounded-md">Failed to load product print items.</p>}
          {!isLoading && !isError && (
            <div className="ag-theme-alpine w-full">
              <AgGridReact
                ref={gridRef}
                rowData={properData}
                columnDefs={columnDefs}
                defaultColDef={{
                  flex: 1,
                  resizable: true,
                  sortable: true,
                  cellClass: "text-center text-[#2D3748] bg-white flex items-center justify-center",
                  headerClass: "custom-header",
                }}
                pagination={true}
                paginationPageSize={paginationPageSize}
                domLayout="autoHeight"
                suppressCellSelection={true}
                onGridReady={onGridReady}
                rowHeight={60}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Print Form Modal */}
      <TableModalProperData
        isModalVisible={isModalVisible}
        onClose={toggleModal}
        title={formData.id ? "Edit Product Print" : "Add Product Print"}
        closeLabel="Cancel"
        saveLabel={formData.id ? "Update" : "Save"}
        formData={formData}
        setFormData={setFormData}
        getTotalPropers={refreshGridData}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Product Print"
        message="Are you sure you want to delete this product print item?"
        closeLabel="Cancel"
        confirmLabel="Delete"
        isLoading={isDeleting}
      />

      {/* Removed View Modal */}
    </div>
  )
}

export default ProductPrint