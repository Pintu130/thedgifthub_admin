"use client"

import type React from "react"
import { useCallback, useRef, useState, useEffect } from "react"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Loader from "@/components/loading-screen"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Modal from "@/components/common/Modal"
import type { ColDef } from "ag-grid-community"
import { Button } from "@/components/ui/button"
import HomeModal from "./HomeModal"

export interface HomeFormData {
  id?: string
  title: string
  subtitle: string
  link: string
  image: File | string | null
  imagePreview?: string
  status: 'active' | 'inactive'
}

const HomeData = () => {
  const { toast } = useToast()
  const [homeItems, setHomeItems] = useState<HomeFormData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [formData, setFormData] = useState<HomeFormData>(() => ({
    title: '',
    subtitle: '',
    link: '',
    image: null,
    imagePreview: '',
    status: 'active'
  }))

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<HomeFormData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const gridRef = useRef<AgGridReact | null>(null)
  const [paginationPageSize] = useState(10)
  const [gridApi, setGridApi] = useState<any>(null)
  // Fetch hero section items
  const fetchHomeItems = useCallback(async () => {
    try {
      setIsLoading(true)
      setIsError(false)

      const response = await fetch('/api/heroSection')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch home items")
      }

      const data = await response.json()
      setHomeItems(data)
    } catch (error) {
      console.error("Error fetching home items:", error)
      setIsError(true)
      toast({
        title: "Error",
        description: `Failed to load home items: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchHomeItems()
  }, [fetchHomeItems])

  // Modal toggle
  const toggleModal = useCallback((isOpen: boolean) => {
    setIsModalVisible(isOpen)
    if (!isOpen) {
      setFormData({
        title: '',
        subtitle: '',
        link: '',
        image: null,
        imagePreview: '',
        status: 'active'
      })
    }
  }, [])

  // Edit
  const handleEdit = useCallback((item: HomeFormData) => {
    setFormData({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      link: item.link,
      image: item.image,
      imagePreview: typeof item.image === 'string' ? item.image : '',
      status: item.status
    })
    setIsModalVisible(true)
  }, [])

  // Delete
  const handleDelete = useCallback((item: HomeFormData) => {
    setItemToDelete(item)
    setIsDeleteModalOpen(true)
  }, [])

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false)
    setItemToDelete(null)
  }, [])

  const confirmDelete = async () => {
    if (!itemToDelete?.id) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/heroSection/delete/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to delete item')
      }

      await fetchHomeItems()
      toast({
        title: "Success",
        description: "Item deleted successfully",
        variant: "default",
      })
    } catch (error) {
      console.error('Error deleting item:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      closeDeleteModal()
    }
  }

  // Handle modal success (refresh data)
  const handleModalSuccess = async () => {
    await fetchHomeItems()
  }

  // Column Definitions
  const columnDefs: ColDef[] = [
    {
      headerName: "Image",
      field: "image",
      minWidth: 120,
      cellRenderer: (params: any) => {
        const imageSrc = params.value || "/placeholder.svg?height=40&width=40"

        return (
          <div className="flex items-center justify-center h-full w-full">
            <img
              src={imageSrc}
              alt="Home Item"
              className="w-16 h-10 rounded-sm border object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=40&width=40"
              }}
            />
          </div>
        )
      },
    },
    {
      headerName: "Title",
      field: "title",
      minWidth: 200,
      sortable: true,
      tooltipField: "title",
    },
    {
      headerName: "Subtitle",
      field: "subtitle",
      minWidth: 250,
      sortable: true,
      tooltipField: "subtitle",
    },
    {
      headerName: "Link",
      field: "link",
      minWidth: 150,
      sortable: true,
      tooltipField: "link",
    },
    {
      headerName: "Status",
      field: "status",
      width: 120,
      cellRenderer: (params: any) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            params.value === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {params.value === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      headerName: "Actions",
      field: "actions",
      width: 150,
      cellRenderer: (params: any) => (
        <div className="flex items-center justify-center gap-2 h-full w-full">
          <button
            onClick={() => handleEdit(params.data)}
            className="p-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(params.data)}
            className="p-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  const onGridReady = (params: any) => {
    setGridApi(params.api)
  }


  return (
    <div className="space-y-4 text-[#333]">
      <div className="px-2 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-customButton-text">Home Management</h1>
        <p className="text-sm text-[#7A6C53] mt-1">Manage banners, featured items, and promotions</p>
      </div>

      <Card className="shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center px-6 pt-4 gap-4">
          <CardHeader className="p-0">
            <CardTitle className="text-lg text-gray-800">Home Content</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {homeItems.length} total items
            </p>
          </CardHeader>

          <button
            onClick={() => toggleModal(true)}
            className="px-4 py-2 rounded-md bg-gradient-to-r 
                                     from-customButton-gradientFrom
                                     to-customButton-gradientTo
                                     text-customButton-text
                                     hover:bg-customButton-hoverBg
                                     hover:text-customButton-hoverText font-semibold transition flex items-center gap-2"
            aria-label="Add new item"
            disabled={isLoading}
          >
            <Plus size={16} />
            <span>Add Item</span>
          </button>
        </div>

        <CardContent className="pt-4">
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          )}
          {isError && (
            <div className="text-center py-4">
              <p className="text-red-600">Failed to load items. Please try again.</p>
            </div>
          )}
          {!isLoading && !isError && (
            <div className="ag-theme-alpine w-full">
              <AgGridReact
                ref={gridRef}
                rowData={homeItems}
                columnDefs={columnDefs}
                defaultColDef={{
                  flex: 1,
                  resizable: true,
                  sortable: true,
                  cellClass: "text-center text-[#2D3748] bg-white",
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

      {/* Add/Edit Modal */}
      <HomeModal
        key={formData.id || 'new-item'}
        isModalVisible={isModalVisible}
        onClose={() => toggleModal(false)}
        title={formData.id ? "Edit Item" : "Add Item"}
        closeLabel="Cancel"
        saveLabel={formData.id ? "Update" : "Save"}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={isSubmitting}
        onSubmit={async (itemData: HomeFormData) => {
          setIsSubmitting(true)
          try {
            const isEdit = !!itemData.id
            const fd = new FormData()

            const payload = {
              ...(isEdit && { id: itemData.id }),
              title: itemData.title,
              subtitle: itemData.subtitle,
              link: itemData.link,
              status: itemData.status,
            }

            fd.append('heroData', JSON.stringify(payload))

            if (isEdit) {
              // For update: only send newly added image File
              if (itemData.image instanceof File) {
                fd.append('image', itemData.image)
              }
            } else {
              // For create: send image if it's a File
              if (itemData.image instanceof File) {
                fd.append('image', itemData.image)
              }
            }

            const url = isEdit
              ? `/api/heroSection/update/${itemData.id}`
              : '/api/heroSection'
            const method = isEdit ? 'PUT' : 'POST'

            const response = await fetch(url, { method, body: fd })
            const result = await response.json().catch(() => ({}))
            if (!response.ok) {
              throw new Error((result && (result.error || result.message)) || `Failed to ${isEdit ? 'update' : 'create'} item`)
            }

            toast({
              title: 'Success',
              description: `Item ${isEdit ? 'updated' : 'created'} successfully!`,
              variant: 'default',
            })

            await fetchHomeItems()
            toggleModal(false)
          } catch (error) {
            console.error('Error saving item:', error)
            toast({
              title: 'Error',
              description: error instanceof Error ? error.message : 'Failed to save item. Please try again.',
              variant: 'destructive',
            })
          } finally {
            setIsSubmitting(false)
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item?"
        closeLabel="Cancel"
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  )
}

export default HomeData
