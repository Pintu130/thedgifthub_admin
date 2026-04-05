"use client"

import type React from "react"
import Modal from "@/components/common/Modal"
import type { Product } from "@/lib/types/product"

interface ProductDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  categories: Array<{ id: string; name: string }>
}

const InfoRow = ({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs font-semibold uppercase tracking-wide text-[#A30000]">{label}</span>
    <span className="text-sm text-gray-800">{value}</span>
  </div>
)

const Badge = ({
  active,
  activeLabel,
  inactiveLabel,
}: {
  active: boolean
  activeLabel: string
  inactiveLabel: string
}) => (
  <span
    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
      active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`}
  >
    {active ? activeLabel : inactiveLabel}
  </span>
)

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  onClose,
  product,
  categories,
}) => {
  if (!product) return null

  const categoryName =
    categories.find((cat) => cat.id === product.categoryId)?.name || "N/A"

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Details"
      width="80rem"
      closeLabel="Close"
    >
      {/*
        Koi extra scroll wrapper NAHI — Modal.tsx ke body div mein
        pehle se `overflow-y-auto flex-1` laga hai, wahi scroll karta hai.
        Yahan sirf content daal do.
      */}
      <div className="space-y-6 text-[#4B3F2F]">

        {/* ── Image Gallery ── */}
        {Array.isArray(product.images) && product.images.length > 0 ? (
          <div className="flex flex-wrap gap-3 justify-center">
            {product.images.map((img, idx) => (
              <img
                key={idx}
                src={img || "/placeholder.svg?height=150&width=150"}
                alt={`${product.productName} - ${idx + 1}`}
                className="w-32 h-32 object-cover rounded-xl border shadow-sm hover:scale-105 transition-transform duration-200"
                onError={(e: any) =>
                  (e.currentTarget.src = "/placeholder.svg?height=150&width=150")
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex justify-center">
            <img
              src="/placeholder.svg?height=150&width=150"
              alt="No product"
              className="w-40 h-40 object-cover rounded-xl border shadow-sm"
            />
          </div>
        )}

        {/* ── Core Info Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 bg-[#fff5f5] p-5 rounded-2xl shadow-inner">
          <InfoRow label="Name" value={product.productName} />
          <InfoRow
            label="Status"
            value={
              <Badge
                active={product.status === "active"}
                activeLabel="Active"
                inactiveLabel="Inactive"
              />
            }
          />
          <InfoRow
            label="Out of Stock"
            value={
              <Badge
                active={product.outOfStock !== "yes"}
                activeLabel="In Stock"
                inactiveLabel="Out of Stock"
              />
            }
          />
          <InfoRow label="Category" value={categoryName} />
          <InfoRow
            label="Original Price"
            value={`₹${product.originalPrice?.toFixed(2)}`}
          />
          <InfoRow
            label="Selling Price"
            value={`₹${product.productPrice?.toFixed(2)}`}
          />
          <InfoRow
            label="Discount"
            value={
              <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                {product.discountPercentage || 0}%
              </span>
            }
          />
          <InfoRow label="Slug" value={product.slug || "—"} />
        </div>

        {/* ── Dimensions & Weight ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#fff5f5] p-5 rounded-2xl shadow-inner">
          <InfoRow label="Weight (kg)" value={product.weight ?? "—"} />
          <InfoRow label="Length (cm)" value={product.length ?? "—"} />
          <InfoRow label="Breadth (cm)" value={product.breadth ?? "—"} />
          <InfoRow label="Height (cm)" value={product.height ?? "—"} />
        </div>

        {/* ── Meta Info ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#fff5f5] p-5 rounded-2xl shadow-inner">
          <InfoRow label="Meta Title" value={product.metaTitle || "—"} />
          <InfoRow label="Meta Keywords" value={product.metaKeywords || "—"} />
          <InfoRow label="Meta Description" value={product.metaDescription || "—"} />
        </div>

        {/* ── Timestamps ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#fff5f5] p-5 rounded-2xl shadow-inner">
          <InfoRow
            label="Created At"
            value={product.createdAt ? formatDate(product.createdAt) : "—"}
          />
          <InfoRow
            label="Updated At"
            value={product.updatedAt ? formatDate(product.updatedAt) : "—"}
          />
        </div>

        {/* ── Description ── */}
        {product.description && (
          <div className="bg-[#fff5f5] p-5 rounded-2xl shadow-sm">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[#A30000] mb-2">
              Description
            </h4>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        )}

        {/* ── Available Offers ── */}
        {product.availableOffers && (
          <div className="bg-[#fff5f5] p-5 rounded-2xl shadow-sm">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[#A30000] mb-2">
              Available Offers
            </h4>
            <div
              className="prose prose-sm max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: product.availableOffers }}
            />
          </div>
        )}

        {/* ── Highlights ── */}
        {product.highlights && (
          <div className="bg-[#fff5f5] p-5 rounded-2xl shadow-sm">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[#A30000] mb-2">
              Highlights
            </h4>
            <div
              className="prose prose-sm max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: product.highlights }}
            />
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ProductDetailsModal