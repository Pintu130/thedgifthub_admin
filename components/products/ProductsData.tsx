"use client"

import type React from "react"
import { useCallback, useRef, useState, useEffect } from "react"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Loader from "@/components/loading-screen"
import { Eye, Pencil, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Modal from "@/components/common/Modal"
import ProductDetailsModal from "./ProductDetailsModal"
import { useRouter } from "next/navigation"
import type { ColDef } from "ag-grid-community"
import type { Product } from "@/lib/types/product"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// types/product.ts
export interface ProductFormData {
  id?: string
  name: string
  amount: string
  discount: string
  originalPrice: string
  availableOffers: string
  highlights: string
  categoryId?: string
  description: string
  status: "active" | "inactive"
  images: Array<File | string>
  imagesPreviews: string[]
  productPrice: number
  discountPercentage: number
}

const ProductData = () => {
  const { toast } = useToast()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [searchText, setSearchText] = useState("")

  const [categories, setCategories] = useState<Array<{ id: string, name: string }>>([])

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewProduct, setViewProduct] = useState<Product | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<string>("") // New state for status filter

  const gridRef = useRef<AgGridReact | null>(null)
  const [paginationPageSize] = useState(20)
  const [gridApi, setGridApi] = useState<any>(null)

  // ✅ Fetch products with category and status filters
  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      const queryParams = new URLSearchParams()
      if (selectedCategory) queryParams.append("categoryId", selectedCategory)
      if (selectedStatus) queryParams.append("status", selectedStatus) // Add status filter

      const response = await fetch(`/api/products?${queryParams.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch products")
      const { data } = await response.json()
      setProducts(data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
      setIsError(true)
      setProducts([])
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load products. Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, selectedCategory, selectedStatus]) // Add selectedStatus dependency

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // ✅ Search
  const onSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
    if (gridApi) gridApi.setQuickFilter(event.target.value)
  }

  const onGridReady = (params: any) => {
    setGridApi(params.api)
  }

  // ✅ Add Product
  const handleAddProduct = useCallback(() => {
    router.push('/products/add')
  }, [router])

  // ✅ Edit
  const handleEdit = useCallback((product: Product) => {
    router.push(`/products/edit/${product.id}`)
  }, [router])

  const handleView = useCallback((product: Product) => {
    setViewProduct(product)
    setIsViewModalOpen(true)
  }, [])

  const handleDelete = useCallback((product: Product) => {
    setProductToDelete(product)
    setIsDeleteModalOpen(true)
  }, [])

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false)
    setProductToDelete(null)
  }, [])

  const closeViewModal = useCallback(() => {
    setIsViewModalOpen(false)
    setViewProduct(null)
  }, [])

  const confirmDelete = async () => {
    if (!productToDelete?.id) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete product")

      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
      fetchProducts()
      closeDeleteModal()
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product. Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      // Map categories to include only id and name fields
      const formattedCategories = data.map((category: any) => ({
        id: category.id,
        name: category.name
      }))
      setCategories(formattedCategories)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load categories. Please try again later.",
      })
    }
  }, [toast])

  const refreshGridData = useCallback(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // ✅ Column Definitions
  const columnDefs: ColDef[] = [
    {
      headerName: "Image",
      field: "images",
      minWidth: 90,
      maxWidth: 110,
      cellRenderer: (params: any) => {
        const imageSrc =
          Array.isArray(params.value) && params.value.length > 0
            ? params.value[0] // ✅ always show first image
            : "/placeholder.svg?height=40&width=40"

        return (
          <div className="flex items-center justify-center h-full w-full">
            <img
              src={imageSrc || "/placeholder.svg"}
              alt="Product"
              className="w-9 h-9 rounded-sm border object-cover"
              onError={(e: any) =>
                (e.currentTarget.src = "/placeholder.svg?height=40&width=40")
              }
            />
          </div>
        )
      },
    },
    {
      headerName: "Name",
      field: "productName",
      flex: 2,
      sortable: true,
      minWidth: 220,
      maxWidth: 350,
      cellRenderer: (params: any) => (
        <span className="text-sm font-medium text-gray-900">
          {params.value || "No Name"}
        </span>
      ),
    },
    {
      headerName: "Status",
      field: "status",
      flex: 0.8,
      sortable: true,
      minWidth: 100,
      maxWidth: 120,
      cellRenderer: (params: any) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${params.value === "active"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
            }`}
        >
          {params.value === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      headerName: "Out of Stock",
      field: "outOfStock",
      flex: 0.8,
      sortable: true,
      minWidth: 110,
      maxWidth: 130,
      cellRenderer: (params: any) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${params.value === "yes"
            ? "bg-red-100 text-red-800"
            : "bg-green-100 text-green-800"
            }`}
        >
          {params.value === "yes" ? "Yes" : "No"}
        </span>
      ),
    },
    {
      headerName: "Is Best Sell",
      field: "isBestSell",
      flex: 0.8,
      sortable: true,
      minWidth: 110,
      maxWidth: 130,
      cellRenderer: (params: any) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${params.value === "yes"
            ? "bg-purple-100 text-purple-800"
            : "bg-gray-100 text-gray-800"
            }`}
        >
          {params.value === "yes" ? "Yes" : "No"}
        </span>
      ),
    },
    {
      headerName: "Is Corporate Gifts",
      field: "isCorporateGifts",
      flex: 0.8,
      sortable: true,
      minWidth: 120,
      maxWidth: 140,
      cellRenderer: (params: any) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${params.value === "yes"
            ? "bg-blue-100 text-blue-800"
            : "bg-gray-100 text-gray-800"
            }`}
        >
          {params.value === "yes" ? "Yes" : "No"}
        </span>
      ),
    },
    {
      headerName: "Original Price (₹)",
      field: "originalPrice",
      flex: 1.2,
      sortable: true,
      minWidth: 130,
      maxWidth: 150,
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center h-full w-full">
          <p className="text-sm text-gray-900">
            ₹{(params.value || 0).toFixed(2)}
          </p>
        </div>
      ),
    },
    {
      headerName: "Discount Price (₹)",
      field: "productPrice",
      flex: 1.2,
      sortable: true,
      minWidth: 130,
      maxWidth: 150,
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center h-full w-full">
          <p className="text-sm text-gray-900">
            ₹{(params.value || 0).toFixed(2)}
          </p>
        </div>
      ),
    },
    {
      headerName: "Discount (%)",
      field: "discountPercentage",
      flex: 0.8,
      minWidth: 110,
      maxWidth: 130,
      cellRenderer: (params: any) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${params.value > 0
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
            }`}
        >
          {params.value || 0}%
        </span>
      ),
    },
    {
      headerName: "Actions",
      field: "action",
      flex: 0.8,
      minWidth: 130,
      maxWidth: 150,
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center gap-1.5 h-full w-full">
          {/* View button */}
          <button
            onClick={() => handleView(params.data)}
            className="p-1 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition"
          >
            <Eye size={15} />
          </button>

          {/* Edit button */}
          <button
            onClick={() => handleEdit(params.data)}
            className="p-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
          >
            <Pencil size={15} />
          </button>

          {/* Delete button */}
          <button
            onClick={() => handleDelete(params.data)}
            className="p-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4 text-[#333]">
      <div className="px-2 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-customButton-text">Products</h1>
        <p className="text-sm text-[#7A6C53] mt-1">View, manage, and organize all products</p>
      </div>

      <Card className="shadow-md border border-gray-200">
        <div className="flex flex-wrap flex-col md:flex-row md:justify-between md:items-center px-6 pt-4 gap-4">
          <CardHeader className="p-0">
            <CardTitle className="text-lg text-gray-800">All Products</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {products.length} products
              {(selectedCategory || selectedStatus) && " (filtered)"}
            </p>
          </CardHeader>

          {/* Search + Add Product */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Category Filter */}
            <Select
              value={selectedCategory || "all"}
              onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-52">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter - NEW */}
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
              placeholder="Search products..."
              className="border outline-none p-2 rounded-md shadow-sm w-52 lg:w-64"
              value={searchText}
              onChange={onSearchTextChange}
              disabled={isLoading}
            />
            <button
              onClick={handleAddProduct}
              className="px-4 py-2 rounded-md bg-gradient-to-r 
                                       from-customButton-gradientFrom
                                       to-customButton-gradientTo
                                       text-customButton-text
                                       hover:bg-customButton-hoverBg
                                       hover:text-customButton-hoverText font-semibold transition flex items-center gap-2"
              aria-label="Add new product"
              disabled={isLoading}
            >
              <Plus size={16} />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        <CardContent className="pt-4">
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <Loader />
            </div>
          )}
          {isError && <p className="p-4 bg-red-50 text-red-700 rounded-md">Failed to load products.</p>}
          {!isLoading && !isError && (
            <div className="ag-theme-alpine" style={{ height: "calc(100vh - 380px)", width: "100%", minHeight: "400px" }}>
              <AgGridReact
                ref={gridRef}
                rowData={products}
                columnDefs={columnDefs}
                defaultColDef={{
                  resizable: true,
                  sortable: true,
                  cellClass: "text-center text-[#2D3748] bg-white",
                  headerClass: "custom-header",
                }}
                pagination={true}
                paginationPageSize={paginationPageSize}
                suppressCellSelection={true}
                onGridReady={onGridReady}
                rowHeight={50}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
        closeLabel="Cancel"
        confirmLabel="Delete"
        isLoading={isDeleting}
      />

      <ProductDetailsModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        product={viewProduct}
        categories={categories}
      />
    </div>
  )
}

export default ProductData