"use client"

import type React from "react"
import { useCallback, useRef, useState, useEffect } from "react"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Loader from "@/components/loading-screen"
import { Eye, Trash2, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Modal from "@/components/common/Modal"
import type { ColDef } from "ag-grid-community"
import { collection, getDocs, doc, deleteDoc, query, orderBy, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
// import ViewReviewModal from "./ViewReviewModal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ViewReviewModal from "./ViewReviewModal"

interface ProductReview {
  id: string
  comment: string
  createdAt: Timestamp | null
  productId: string
  productName: string
  productSlug: string
  rating: number
  updatedAt: Timestamp | null
  userEmail: string
  userId: string
  userName: string
}

const ProductReviewsData = () => {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  // View modal
  const [viewReview, setViewReview] = useState<ProductReview | null>(null)

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<ProductReview | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Grid
  const gridRef = useRef<AgGridReact | null>(null)
  const [paginationPageSize] = useState(10)
  const [gridApi, setGridApi] = useState<any>(null)

  // Filter state
  const [ratingFilter, setRatingFilter] = useState<"all" | "5" | "4" | "3" | "2" | "1">("all")

  const fetchReviews = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      let reviewsQuery: any = collection(db, "product-review")
      reviewsQuery = query(reviewsQuery, orderBy("createdAt", "desc"))

      const snapshot = await getDocs(reviewsQuery)
      const data = snapshot.docs.map((d) => {
        const raw = d.data() as any
        return {
          id: d.id,
          comment: raw.comment || "",
          createdAt: raw.createdAt || null,
          productId: raw.productId || "",
          productName: raw.productName || "",
          productSlug: raw.productSlug || "",
          rating: raw.rating || 0,
          updatedAt: raw.updatedAt || null,
          userEmail: raw.userEmail || "",
          userId: raw.userId || "",
          userName: raw.userName || "",
        } as ProductReview
      })

      // Filter by rating if selected
      let filteredData = data
      if (ratingFilter !== "all") {
        filteredData = data.filter((review) => review.rating === parseInt(ratingFilter))
      }

      setReviews(filteredData || [])
    } catch (error) {
      console.error("Error fetching reviews:", error)
      setIsError(true)
      setReviews([])
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load product reviews. Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [ratingFilter, toast])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const onGridReady = (params: any) => {
    setGridApi(params.api)
  }

  const handleView = (review: ProductReview) => {
    setViewReview(review)
  }

  const handleDelete = (review: ProductReview) => {
    setReviewToDelete(review)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!reviewToDelete?.id) return
    setIsDeleting(true)
    try {
      await deleteDoc(doc(db, "product-review", reviewToDelete.id))
      toast({
        title: "Success",
        description: "Review deleted successfully",
      })
      fetchReviews()
      setIsDeleteModalOpen(false)
    } catch (error) {
      console.error("Error deleting review:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete review. Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const refreshGridData = useCallback(() => {
    fetchReviews()
  }, [fetchReviews])

  // Rating cell renderer with stars
  const RatingCellRenderer = (params: any) => {
    const rating = params.value || 0
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
        <span className="ml-1 text-sm font-medium">({rating})</span>
      </div>
    )
  }

  // Date cell renderer
  const DateCellRenderer = (params: any) => {
    if (!params.value) return "-"
    const date = params.value.toDate ? params.value.toDate() : new Date(params.value)
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const columnDefs: ColDef[] = [
    {
      headerName: "User Name",
      field: "userName",
      flex: 0.8,
      minWidth: 100,
    },
    {
      headerName: "User Email",
      field: "userEmail",
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Rating",
      field: "rating",
      width: 140,
      cellRenderer: RatingCellRenderer,
    },
    {
      headerName: "Created At",
      field: "createdAt",
      width: 200,
      cellRenderer: DateCellRenderer,
    },
    {
      headerName: "Actions",
      field: "action",
      width: 120,
      cellRenderer: (params: any) => (
        <div className="h-full flex items-center justify-center gap-2">
          <button
            onClick={() => handleView(params.data)}
            className="p-1 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleDelete(params.data)}
            className="p-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
            title="Delete"
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
        <h1 className="text-3xl font-bold tracking-tight text-customButton-text">Product Reviews</h1>
        <p className="text-sm text-[#7A6C53] mt-1">View and manage all product reviews</p>
      </div>

      <Card className="shadow-md border border-gray-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center px-6 pt-4 gap-4">
          <CardHeader className="p-0">
            <CardTitle className="text-lg text-gray-800">All Reviews</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{reviews.length} total reviews</p>
          </CardHeader>

          <div className="flex gap-2 items-center">
            <Select value={ratingFilter} onValueChange={(value) => setRatingFilter(value as any)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
            <input
              type="text"
              placeholder="Search reviews..."
              className="border outline-none p-2 rounded-md shadow-sm w-52 lg:w-64"
              onChange={(e) => gridApi?.setQuickFilter(e.target.value)}
            />
          </div>
        </div>

        <CardContent className="pt-4">
          {isLoading && <Loader />}
          {isError && <p className="p-4 bg-red-50 text-red-700 rounded-md">Failed to load reviews.</p>}
          {!isLoading && !isError && (
            <div className="ag-theme-alpine w-full">
              <AgGridReact
                ref={gridRef}
                rowData={reviews}
                columnDefs={columnDefs}
                defaultColDef={{
                  resizable: true,
                  sortable: true,
                  cellClass: "text-center text-[#2D3748] bg-white",
                }}
                pagination={true}
                paginationPageSize={paginationPageSize}
                domLayout="autoHeight"
                suppressCellSelection={true}
                onGridReady={onGridReady}
                rowHeight={52}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Modal */}
      <ViewReviewModal review={viewReview} onClose={() => setViewReview(null)} />

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        closeLabel="Cancel"
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  )
}

export default ProductReviewsData
