"use client"

import { X, Star, Package, User, Mail, MessageSquare, Calendar } from "lucide-react"
import { Timestamp } from "firebase/firestore"

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

interface ViewReviewModalProps {
  review: ProductReview | null
  onClose: () => void
}

export default function ViewReviewModal({ review, onClose }: ViewReviewModalProps) {
  if (!review) return null

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return "-"
    const date = timestamp.toDate()
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-xl mx-4 flex flex-col z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#EADFC8] shrink-0 bg-[#faeaea]">
          <h3 className="text-lg font-semibold text-[#4B3F2F]">Review Details</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-[#FFDEDE] transition-colors"
            aria-label="Close"
          >
            <X size={20} className="text-[#4B3F2F]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {/* Product Info */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Package size={18} className="text-customButton-text" />
              <h4 className="font-semibold text-gray-800">Product Information</h4>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Product Name:</span>
                <span className="text-sm font-medium text-gray-800">{review.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Product Slug:</span>
                <span className="text-sm font-medium text-gray-800">{review.productSlug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Product ID:</span>
                <span className="text-xs font-medium text-gray-800">{review.productId}</span>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <User size={18} className="text-customButton-text" />
              <h4 className="font-semibold text-gray-800">User Information</h4>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <User size={14} /> Name:
                </span>
                <span className="text-sm font-medium text-gray-800">{review.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Mail size={14} /> Email:
                </span>
                <span className="text-sm font-medium text-gray-800">{review.userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">User ID:</span>
                <span className="text-xs font-medium text-gray-800">{review.userId}</span>
              </div>
            </div>
          </div>

          {/* Rating & Comment */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Star size={18} className="text-customButton-text" />
              <h4 className="font-semibold text-gray-800">Rating & Review</h4>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Rating:</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                  <span className="ml-1 text-sm font-medium">({review.rating}/5)</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <MessageSquare size={14} className="text-gray-500" />
                  <span className="text-sm text-gray-500">Comment:</span>
                </div>
                <p className="text-sm text-gray-800 bg-white p-3 rounded border border-gray-200">
                  {review.comment || "No comment provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={18} className="text-customButton-text" />
              <h4 className="font-semibold text-gray-800">Timestamps</h4>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Created At:</span>
                <span className="text-sm font-medium text-gray-800">{formatDate(review.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Updated At:</span>
                <span className="text-sm font-medium text-gray-800">{formatDate(review.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-[#EADFC8] shrink-0 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-customButton-text bg-customButton hover:bg-[#FFD1D1] hover:text-[#800000] rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
