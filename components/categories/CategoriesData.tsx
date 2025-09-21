"use client"

import { useState, useEffect, useCallback } from "react"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, GridReadyEvent } from "ag-grid-community"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import Loader from "@/components/loading-screen"
import Modal from "@/components/common/Modal"
import CategoryModal from "@/app/categories/CategoryModal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Category {
  id: string   // remove the `?`
  name: string
  imageUrl: string
  status: "active" | "inactive"
  createdAt?: string
  updatedAt?: string
}

interface CategoryFormData {
  name: string
  image: File | null
  imagePreview: string
  status: "active" | "inactive"
}

const CategoriesData = () => {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchText, setSearchText] = useState("")
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; imageUrl: string } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<string>("")

  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    image: null,
    imagePreview: "",
    status: "active",
  })

  // Format date to dd/MM/yyyy
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "-"

      const day = String(date.getDate()).padStart(2, "0")
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const year = date.getFullYear()

      return `${day}/${month}/${year}`
    } catch (e) {
      console.error("Error formatting date:", e)
      return "-"
    }
  }

  // Fetch all categories for dropdown (no filters)
  const fetchAllCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to fetch categories")
      }
      const data = await response.json()
      setAllCategories(data)
    } catch (error) {
      console.error("Error fetching all categories:", error)
      toast({
        title: "Error",
        description: "Failed to load categories for dropdown. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  // Fetch categories with optional filters - Method 1: Using query parameters
  const fetchCategoriesWithQueryParams = useCallback(async (categoryFilter?: string, statusFilter?: string) => {
    try {
      setIsLoading(true)
      setIsError(false)

      let url = "/api/categories"
      const params = new URLSearchParams()

      if (categoryFilter && categoryFilter !== "") {
        params.append("category", categoryFilter)
      }
      if (statusFilter && statusFilter !== "") {
        params.append("status", statusFilter)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      console.log('Fetching from URL:', url)

      const response = await fetch(url)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to fetch categories")
      }

      const data = await response.json()
      setCategories(data)
      setFilteredCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      setIsError(true)
      toast({
        title: "Error",
        description: `Failed to load categories: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Alternative method: Using dedicated status endpoint - Method 2
  const fetchCategoriesWithStatusEndpoint = useCallback(async (statusFilter: string) => {
    try {
      setIsLoading(true)
      setIsError(false)

      const url = `/api/categories/status/${statusFilter}`
      console.log('Fetching from status endpoint:', url)

      const response = await fetch(url)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to fetch categories by status")
      }

      const data = await response.json()
      setCategories(data)
      setFilteredCategories(data)
    } catch (error) {
      console.error("Error fetching categories by status:", error)
      setIsError(true)
      toast({
        title: "Error",
        description: `Failed to load categories by status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Main fetch function - you can choose which method to use
  const fetchCategories = useCallback(async (categoryFilter?: string, statusFilter?: string) => {
    // Method 1: Using query parameters (recommended)
    await fetchCategoriesWithQueryParams(categoryFilter, statusFilter)

    // Alternative - Method 2: Using dedicated endpoint for status only
    // Uncomment the lines below and comment out the line above if you prefer this approach
    /*
    if (statusFilter && statusFilter !== "" && !categoryFilter) {
      await fetchCategoriesWithStatusEndpoint(statusFilter)
    } else {
      await fetchCategoriesWithQueryParams(categoryFilter, statusFilter)
    }
    */
  }, [fetchCategoriesWithQueryParams])

  // Category filter
  const handleCategoryFilterChange = (value: string) => {
    setSelectedCategory(value === "all" ? "" : value)
    fetchCategories(value === "all" ? "" : value, selectedStatus)
  }

  // Status filter
  const handleStatusFilterChange = (value: string) => {
    setSelectedStatus(value === "all" ? "" : value)
    fetchCategories(selectedCategory, value === "all" ? "" : value)
  }


  // Filter categories based on search text (client-side filtering)
  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredCategories(categories)
    } else {
      const filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(searchText.toLowerCase())
      )
      setFilteredCategories(filtered)
    }
  }, [searchText, categories])

  // Initialize component - fetch categories on mount
  useEffect(() => {
    fetchAllCategories()
    fetchCategories()
  }, [fetchAllCategories, fetchCategories])

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      image: null,
      imagePreview: "",
      status: "active",
    })
    setEditingId(null)
  }

  // Handle add new category
  const handleAddNew = () => {
    resetForm()
    setIsModalOpen(true)
  }

  // Handle edit category
  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      image: null,
      imagePreview: category.imageUrl || "",
      status: category.status || "active",
    })
    setEditingId(category.id || null)
    setIsModalOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (id: string, imageUrl: string) => {
    setCategoryToDelete({ id, imageUrl })
    setDeleteModalOpen(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!categoryToDelete) return

    try {
      setIsDeleting(true)
      const url = new URL(`/api/categories/${categoryToDelete.id}`, window.location.origin)
      url.searchParams.append("imageUrl", categoryToDelete.imageUrl)

      const response = await fetch(url.toString(), {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete category")
      }

      await fetchAllCategories()
      await fetchCategories(selectedCategory, selectedStatus)

      toast({
        title: "Success",
        description: "Category deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteModalOpen(false)
      setCategoryToDelete(null)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    resetForm()
  }

  // Handle modal success (refresh data)
  const handleModalSuccess = async () => {
    await fetchAllCategories()
    await fetchCategories(selectedCategory, selectedStatus)
  }

  // Column definitions for AG Grid
  const centerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  }

  const columnDefs: ColDef[] = [
    {
      headerName: "Image",
      field: "imageUrl",
      flex: 1,
      minWidth: 120,
      maxWidth: 200,
      cellStyle: centerStyle,
      cellRenderer: (params: any) =>
        params.value ? (
          <Image
            src={params.value || "/placeholder.svg"}
            alt={params.data?.name || "Category"}
            width={40}
            height={40}
            className="rounded-md object-cover"
          />
        ) : (
          "-"
        ),
      filter: false,
      sortable: false,
    },
    {
      headerName: "Name",
      field: "name",
      flex: 1,
      minWidth: 200,
      cellStyle: centerStyle,
      cellRenderer: (params: any) => <span className="font-medium">{params.value || "No name"}</span>,
      filter: false,
    },
    {
      headerName: "Status",
      field: "status",
      flex: 1,
      minWidth: 120,
      maxWidth: 180,
      cellStyle: centerStyle,
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
      filter: false,
      sortable: true,
    },
    {
      headerName: "Last Updated",
      field: "updatedAt",
      flex: 1,
      minWidth: 180,
      cellStyle: centerStyle,
      valueFormatter: (params: any) => formatDate(params.value),
      filter: false,
    },
    {
      headerName: "Actions",
      field: "actions",
      flex: 1,
      minWidth: 150,
      cellStyle: centerStyle,
      cellRenderer: (params: any) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(params.data)}
            className="p-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => handleDeleteClick(params.data.id, params.data.imageUrl)}
            className="p-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      sortable: false,
      filter: false,
    },
  ]

  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
  }

  const onGridReady = (params: GridReadyEvent) => {
    params.api.sizeColumnsToFit()
  }

  if (isLoading && categories.length === 0) {
    return <Loader />
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">Failed to load categories. Please try again.</p>
        <Button onClick={() => fetchCategories(selectedCategory, selectedStatus)}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 text-[#333]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-customButton-text">Categories</h1>
        <p className="text-sm text-[#7A6C53] mt-1">View, manage, and organize all categories</p>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-wrap flex-row items-center justify-between space-y-3 pb-4">
          <CardHeader className="p-0">
            <CardTitle className="text-lg text-gray-800">All Categories</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {filteredCategories.length} of {allCategories.length} categories
              {(selectedCategory || selectedStatus) && " (filtered)"}
            </p>
          </CardHeader>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Category Filter */}
            <Select
              value={selectedCategory || "all"}
              onValueChange={handleCategoryFilterChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-52 border rounded-md shadow-sm px-2 py-2 cursor-pointer">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {allCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={selectedStatus || "all"}
              onValueChange={handleStatusFilterChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-44 border rounded-md shadow-sm px-2 py-2 cursor-pointer">
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
              placeholder="Search categories..."
              className="border outline-none p-2 rounded-md shadow-sm w-52 lg:w-64"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              disabled={isLoading}
            />

            <button
              onClick={handleAddNew}
              className="px-4 py-2 rounded-md bg-gradient-to-r 
                         from-customButton-gradientFrom
                         to-customButton-gradientTo
                         text-customButton-text
                         hover:bg-customButton-hoverBg
                         hover:text-customButton-hoverText font-semibold transition flex items-center gap-2"
              aria-label="Add new category"
              disabled={isLoading}
            >
              <Plus size={16} />
              <span>Add Category</span>
            </button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading && (
            <div>
              <Loader />
            </div>
          )}

          <div className="ag-theme-alpine" style={{ height: "300px", width: "100%" }}>
            <AgGridReact
              rowData={filteredCategories}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={5}
              suppressCellFocus={true}
              onGridReady={onGridReady}
              rowHeight={50}
            />
          </div>
        </CardContent>
      </Card>

      <CategoryModal
        isModalVisible={isModalOpen}
        onClose={handleModalClose}
        title={editingId ? "Edit Category" : "Add New Category"}
        closeLabel="Cancel"
        saveLabel={editingId ? "Update" : "Create"}
        formData={formData}
        setFormData={setFormData}
        onRefresh={handleModalSuccess}
        editingId={editingId}
      />


      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        closeLabel="Cancel"
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
        isLoading={isDeleting}
      />
    </div>
  )
}

export default CategoriesData