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
import TableModalOfferData from "@/app/offers/TableModalOfferData"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface OfferFormData {
  id?: string
  categoryId: string
  discountType: 'percentage' | 'price'
  discountLabel: string
  priceLabel: string
  value: string
  images: Array<File | string>
  imagesPreviews: string[]
  status: 'active' | 'inactive'
  availableOffers?: string
  highlights?: string
  imagesToDelete?: string[]
}

const OffersData = () => {
  const { toast } = useToast()
  const [offers, setOffers] = useState<OfferFormData[]>([])
  const [allOffers, setAllOffers] = useState<OfferFormData[]>([]) // Store all offers for dropdown
  const [filteredOffers, setFilteredOffers] = useState<OfferFormData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isError, setIsError] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [isModalVisible, setIsModalVisible] = useState(false)

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<string>("")

  const [formData, setFormData] = useState<OfferFormData>(() => ({
    categoryId: '',
    discountType: 'percentage',
    discountLabel: '',
    priceLabel: '',
    value: '',
    images: [],
    imagesPreviews: [],
    status: 'active',
    availableOffers: '',
    highlights: ''
  }))

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [offerToDelete, setOfferToDelete] = useState<OfferFormData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewOffer, setViewOffer] = useState<OfferFormData | null>(null)

  const gridRef = useRef<AgGridReact | null>(null)
  const [paginationPageSize] = useState(10)
  const [gridApi, setGridApi] = useState<any>(null)
  const [categories, setCategories] = useState<Array<{ id: string, name: string }>>([])

  // Fetch all offers for dropdown (no filters)
  const fetchAllOffers = useCallback(async () => {
    try {
      const response = await fetch('/api/offers')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to fetch offers")
      }
      const data = await response.json()
      setAllOffers(data)
    } catch (error) {
      console.error("Error fetching all offers:", error)
      toast({
        title: "Error",
        description: "Failed to load offers for dropdown. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  // Fetch offers with optional filters
  const fetchOffers = useCallback(async (categoryFilter?: string, statusFilter?: string) => {
    try {
      setIsLoading(true)
      setIsError(false)

      let url = "/api/offers"
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
        throw new Error(errorData.details || errorData.error || "Failed to fetch offers")
      }

      const data = await response.json()
      setOffers(data)
      setFilteredOffers(data)
    } catch (error) {
      console.error("Error fetching offers:", error)
      setIsError(true)
      toast({
        title: "Error",
        description: `Failed to load offers: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

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

  // Handle category filter change
  const handleStatusFilterChange = (status: string) => {
    setSelectedStatus(status)
    fetchOffers(selectedCategory, status)
  }

  // Handle category filter change - accepts string directly
  const handleCategoryFilterChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    fetchOffers(categoryId, selectedStatus)
  }


  // Filter offers based on search text (client-side filtering)
  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredOffers(offers)
    } else {
      const filtered = offers.filter((offer) =>
        offer.discountLabel.toLowerCase().includes(searchText.toLowerCase()) ||
        offer.priceLabel.toLowerCase().includes(searchText.toLowerCase()) ||
        categories.find(cat => cat.id === offer.categoryId)?.name.toLowerCase().includes(searchText.toLowerCase())
      )
      setFilteredOffers(filtered)
    }
  }, [searchText, offers, categories])

  useEffect(() => {
    fetchAllOffers() // Fetch all offers for dropdown
    fetchOffers() // Fetch offers for table
    fetchCategories()
  }, [fetchAllOffers, fetchOffers, fetchCategories])

  // Search
  const onSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value)
    if (gridApi) gridApi.setQuickFilter(event.target.value)
  }

  const onGridReady = (params: any) => {
    setGridApi(params.api)
  }

  // Modal toggle
  const toggleModal = useCallback((isOpen: boolean) => {
    setIsModalVisible(isOpen)
    if (!isOpen) {
      setFormData({
        categoryId: '',
        discountType: 'percentage',
        discountLabel: '',
        priceLabel: '',
        value: '',
        images: [],
        imagesPreviews: [],
        status: 'active',
        availableOffers: '',
        highlights: ''
      })
    }
  }, [])

  // Edit
  const handleEdit = useCallback((offer: OfferFormData) => {
    setFormData({
      categoryId: offer.categoryId || '',
      discountType: offer.discountType || 'percentage',
      discountLabel: offer.discountLabel || '',
      priceLabel: offer.priceLabel || '',
      value: offer.value || '',
      images: Array.isArray(offer.images) ? [...offer.images] : [],
      imagesPreviews: Array.isArray(offer.images)
        ? offer.images.filter((img): img is string => typeof img === 'string')
        : [],
      status: offer.status || 'active',
      availableOffers: offer.availableOffers || '',
      highlights: offer.highlights || '',
      ...(offer.id && { id: offer.id })
    })
    setIsModalVisible(true)
  }, [])

  // Delete
  const handleDelete = useCallback((offer: OfferFormData) => {
    setOfferToDelete(offer)
    setIsDeleteModalOpen(true)
  }, [])

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false)
    setOfferToDelete(null)
  }, [])

  const handleView = useCallback((offer: OfferFormData) => {
    setViewOffer(offer)
    setIsViewModalOpen(true)
  }, [])

  const closeViewModal = useCallback(() => {
    setIsViewModalOpen(false)
    setViewOffer(null)
  }, [])

  const confirmDelete = async () => {
    if (!offerToDelete?.id) {
      console.error('No offer ID provided for deletion')
      return
    }

    setIsDeleting(true)
    try {
      console.log('Deleting offer with ID:', offerToDelete.id)
      const response = await fetch(`/api/offers/delete/${offerToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const responseData = await response.json()
      console.log('Delete response:', responseData)

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to delete offer')
      }

      await fetchAllOffers()
      await fetchOffers(selectedCategory, selectedStatus)
      toast({
        title: "Success",
        description: "Offer deleted successfully",
        variant: "default",
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
    closeDeleteModal()
  }

  // Handle modal success (refresh data)
  const handleModalSuccess = async () => {
    await fetchAllOffers()
    await fetchOffers(selectedCategory, selectedStatus)
  }

  // Column Definitions
  const columnDefs: ColDef[] = [
    {
      headerName: "Image",
      field: "images",
      minWidth: 100,
      cellRenderer: (params: any) => {
        const imageSrc =
          Array.isArray(params.value) && params.value.length > 0
            ? params.value[0] // Show first image if available
            : "/placeholder.svg?height=40&width=40"

        return (
          <div className="flex items-center justify-center h-full w-full">
            <img
              src={imageSrc}
              alt="Offer"
              className="w-10 h-10 rounded-sm border object-cover"
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
      headerName: "Offer",
      field: "discountLabel",
      minWidth: 150,
      valueFormatter: (params: any) => `${params.value} ${params.data.value}%`
    },
    {
      headerName: "Category",
      field: "categoryId",
      minWidth: 150,
      valueGetter: (params: any) => {
        if (!params.data?.categoryId) return ''
        const category = categories.find(cat => cat.id === params.data.categoryId)
        return category?.name || params.data.categoryId
      }
    },
    {
      headerName: "Status",
      field: "status",
      width: 120,
      cellRenderer: (params: any) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${params.value === "active"
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
            }`}
        >
          {params.value}
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

  return (
    <div className="space-y-4 text-[#333]">
      <div className="px-2 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-customButton-text">Offers</h1>
        <p className="text-sm text-[#7A6C53] mt-1">View, manage, and organize all offers</p>
      </div>

      <Card className="shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center px-6 pt-4 gap-4">
          <CardHeader className="p-0">
            <CardTitle className="text-lg text-gray-800">All Offers</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {filteredOffers.length} of {allOffers.length} offers
              {(selectedCategory || selectedStatus) && " (filtered)"}
            </p>
          </CardHeader>

          {/* Search + Filters + Add Offer */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* Category Filter */}
              <Select
                value={selectedCategory || "all"}
                onValueChange={(value) =>
                  handleCategoryFilterChange(value === "all" ? "" : value)
                }
                disabled={isLoading}
              >
                <SelectTrigger className="w-52 border rounded-md shadow-sm px-2 py-2 cursor-pointer">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={cat.id || ""} // fallback to empty string for safety
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={selectedStatus || "all"}
                onValueChange={(value) =>
                  handleStatusFilterChange(value === "all" ? "" : value)
                }
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
            </div>


            <input
              type="text"
              placeholder="Search offers..."
              className="border outline-none p-2 rounded-md shadow-sm w-52 lg:w-64"
              value={searchText}
              onChange={onSearchTextChange}
              disabled={isLoading}
            />
            <button
              onClick={() => toggleModal(true)}
              className="px-4 py-2 rounded-md bg-gradient-to-r 
                                       from-customButton-gradientFrom
                                       to-customButton-gradientTo
                                       text-customButton-text
                                       hover:bg-customButton-hoverBg
                                       hover:text-customButton-hoverText font-semibold transition flex items-center gap-2"
              aria-label="Add new offer"
              disabled={isLoading}
            >
              <Plus size={16} />
              <span>Add Offer</span>
            </button>
          </div>
        </div>


        <CardContent className="pt-4">
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          )}
          {isError && (
            <div className="text-center py-4">
              <p className="text-red-600">Failed to load offers. Please try again.</p>
            </div>
          )}
          {!isLoading && !isError && (
            <div className="ag-theme-alpine w-full">
              <AgGridReact
                ref={gridRef}
                rowData={offers}
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
                rowHeight={50}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Offer Modal */}
      <TableModalOfferData
        key={formData.id || 'new-offer'}
        isModalVisible={isModalVisible}
        onClose={() => toggleModal(false)}
        title={formData.id ? "Edit Offer" : "Add Offer"}
        closeLabel="Cancel"
        saveLabel={formData.id ? "Update" : "Save"}
        formData={formData}
        setFormData={setFormData}
        getTotalOffers={fetchOffers}
        categories={categories} // Passing the categories from state
        isSubmitting={isSubmitting}
        onSubmit={async (offerData) => {
          setIsSubmitting(true)
          try {
            const isEdit = !!offerData.id
            const fd = new FormData()

            const payload = {
              ...(isEdit && { id: offerData.id }),
              categoryId: offerData.categoryId,
              discountType: offerData.discountType,
              discountLabel: offerData.discountLabel,
              priceLabel: offerData.priceLabel,
              value: offerData.value,
              status: offerData.status,
              availableOffers: offerData.availableOffers || '',
              highlights: offerData.highlights || '',
            }

            fd.append('offerData', JSON.stringify(payload))

            if (isEdit) {
              // For update: only send newly added image Files
              offerData.images.forEach((image) => {
                if (image instanceof File) {
                  fd.append('newImages', image)
                }
              })
              // If modal set imagesToDelete on data, include it
              const imagesToDelete = (offerData as any).imagesToDelete as string[] | undefined
              if (imagesToDelete && imagesToDelete.length) {
                fd.append('imagesToDelete', JSON.stringify(imagesToDelete))
              }
            } else {
              // For create: backend expects 'images'
              offerData.images.forEach((image) => {
                if (image instanceof File) {
                  fd.append('images', image)
                }
              })
            }

            const url = isEdit
              ? `/api/offers/update/${offerData.id}`
              : '/api/offers/create'
            const method = isEdit ? 'PUT' : 'POST'

            const response = await fetch(url, { method, body: fd })
            const result = await response.json().catch(() => ({}))
            if (!response.ok) {
              throw new Error((result && (result.error || result.message)) || `Failed to ${isEdit ? 'update' : 'create'} offer`)
            }

            toast({
              title: 'Success',
              description: `Offer ${isEdit ? 'updated' : 'created'} successfully!`,
              variant: 'default',
            })

            await fetchOffers()
            toggleModal(false)
          } catch (error) {
            console.error('Error saving offer:', error)
            toast({
              title: 'Error',
              description: error instanceof Error ? error.message : 'Failed to save offer. Please try again.',
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
        title="Delete Offer"
        message="Are you sure you want to delete this offer?"
        closeLabel="Cancel"
        confirmLabel="Delete"
        isLoading={isDeleting}
      />

      {viewOffer && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
          title="Offer Details"
          closeLabel="Close"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700">Offer:</h3>
                <p>{viewOffer.discountLabel} {viewOffer.value}%</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Category:</h3>
                <p>
                  {categories.find(c => c.id === viewOffer.categoryId)?.name || viewOffer.categoryId}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Status:</h3>
                <p className="capitalize">{viewOffer.status}</p>
              </div>
            </div>
            {viewOffer.availableOffers && (
              <div>
                <h3 className="font-medium text-gray-700">Available Offers:</h3>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: viewOffer.availableOffers }}
                />
              </div>
            )}
            {viewOffer.highlights && (
              <div>
                <h3 className="font-medium text-gray-700">Highlights:</h3>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: viewOffer.highlights }}
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

export default OffersData
