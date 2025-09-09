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

interface Category {
  id?: string
  name: string
  imageUrl: string
  createdAt?: string
  updatedAt?: string
}

interface CategoryFormData {
  name: string
  image: File | null
  imagePreview: string
}

const CategoriesData = () => {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchText, setSearchText] = useState("")
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; imageUrl: string } | null>(null)

  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    image: null,
    imagePreview: "",
  })

  // Format date to dd/MM/yyyy hh:mm a
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

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/categories")
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data)
      setFilteredCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      setIsError(true)
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Filter categories based on search text
  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredCategories(categories)
    } else {
      const filtered = categories.filter((category) => category.name.toLowerCase().includes(searchText.toLowerCase()))
      setFilteredCategories(filtered)
    }
  }, [searchText, categories])

  // Initialize component - fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      image: null,
      imagePreview: "",
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

      await fetchCategories()
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
            alt={params.data?.name || "Product"}
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

  if (isLoading) {
    return <Loader />
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Failed to load categories. Please try again.</p>
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardHeader className="p-0">
            <CardTitle className="text-lg text-gray-800">All Categories</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{categories.length} total categories</p>
          </CardHeader>
          {/* Search + Add Category */}
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Search categories..."
              className="border outline-none p-2 rounded-md shadow-sm w-52 lg:w-64"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
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
            >
              <Plus size={16} />
              <span>Add Category</span>
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <Loader />}

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
        onRefresh={fetchCategories}
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
